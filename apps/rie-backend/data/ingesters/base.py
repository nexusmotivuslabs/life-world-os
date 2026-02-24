"""
Abstract base class for all data ingesters.

Each ingester is responsible for:
  1. Fetching raw time-series data from an external source
  2. Normalising it into (year: int, value: float) rows
  3. Persisting those rows to SQLite via upsert
"""
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Optional

import aiosqlite
import pandas as pd

from database.db import get_db_path


class BaseIngester(ABC):
    """
    Subclass must set `indicator` and implement `fetch()`.
    Call `run()` to fetch, normalise, and store.
    """

    indicator: str  # Unique key used in metric_data table (e.g. "WB_GB_FERTILITY")
    source_name: str  # Human-readable citation
    units: str
    country: str = "GB"

    @abstractmethod
    async def fetch(self) -> pd.DataFrame:
        """
        Fetch raw data from the external source.
        Must return a DataFrame with columns: year (int), value (float).
        Rows with null values should be dropped before returning.
        """
        ...

    async def run(self) -> pd.DataFrame:
        """Fetch, validate, persist, and return the cleaned series."""
        df = await self.fetch()
        df = self._validate(df)
        await self._store(df)
        return df

    async def load_cached(self) -> Optional[pd.DataFrame]:
        """Return cached rows from SQLite, or None if no data stored."""
        async with aiosqlite.connect(get_db_path()) as conn:
            conn.row_factory = aiosqlite.Row
            cursor = await conn.execute(
                "SELECT year, value FROM metric_data WHERE indicator = ? ORDER BY year ASC",
                (self.indicator,),
            )
            rows = await cursor.fetchall()
        if not rows:
            return None
        df = pd.DataFrame([{"year": r["year"], "value": r["value"]} for r in rows])
        return df

    async def get_or_fetch(self) -> pd.DataFrame:
        """Return cached data if available, otherwise fetch and cache."""
        cached = await self.load_cached()
        if cached is not None and len(cached) > 0:
            return cached
        return await self.run()

    def _validate(self, df: pd.DataFrame) -> pd.DataFrame:
        required = {"year", "value"}
        if not required.issubset(df.columns):
            raise ValueError(f"{self.indicator}: DataFrame must have columns 'year' and 'value'")
        df = df.dropna(subset=["value"]).copy()
        df["year"] = df["year"].astype(int)
        df["value"] = df["value"].astype(float)
        df = df.sort_values("year").reset_index(drop=True)
        return df

    async def _store(self, df: pd.DataFrame) -> None:
        now = datetime.now(timezone.utc).isoformat()
        async with aiosqlite.connect(get_db_path()) as conn:
            for _, row in df.iterrows():
                await conn.execute(
                    """
                    INSERT INTO metric_data (indicator, year, value, fetched_at)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(indicator, year) DO UPDATE SET value=excluded.value, fetched_at=excluded.fetched_at
                    """,
                    (self.indicator, int(row["year"]), float(row["value"]), now),
                )
            await conn.execute(
                """
                INSERT INTO ingest_log (indicator, last_fetched_at, row_count)
                VALUES (?, ?, ?)
                ON CONFLICT(indicator) DO UPDATE SET last_fetched_at=excluded.last_fetched_at, row_count=excluded.row_count
                """,
                (self.indicator, now, len(df)),
            )
            await conn.commit()
