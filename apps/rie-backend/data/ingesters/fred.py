"""
FRED (Federal Reserve Bank of St. Louis) API ingester.

Used for: Brent Crude oil price (DCOILBRENTEU) — monthly, averaged to annual.

API key required — free at https://fred.stlouisfed.org/docs/api/api_key.html
Set FRED_API_KEY in environment or .env file.

Monthly data is averaged to annual to align with annual constraint comparisons.
"""
from __future__ import annotations

import os

import httpx
import pandas as pd

from data.ingesters.base import BaseIngester

FRED_BASE = "https://api.stlouisfed.org/fred/series/observations"
TIMEOUT = 30.0


class FREDIngester(BaseIngester):
    """Generic FRED series ingester."""

    def __init__(
        self,
        series_id: str,
        indicator: str,
        source_name: str,
        units: str,
        aggregate_annual: bool = True,
    ):
        self.series_id = series_id
        self.indicator = indicator
        self.source_name = source_name
        self.units = units
        self.aggregate_annual = aggregate_annual

    async def fetch(self) -> pd.DataFrame:
        api_key = os.getenv("FRED_API_KEY", "")
        if not api_key:
            raise EnvironmentError(
                "FRED_API_KEY is not set. Get a free key at https://fred.stlouisfed.org/docs/api/api_key.html"
            )

        params = {
            "series_id": self.series_id,
            "api_key": api_key,
            "file_type": "json",
            "observation_start": "1990-01-01",
        }

        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(FRED_BASE, params=params)
            resp.raise_for_status()

        data = resp.json()
        observations = data.get("observations", [])
        if not observations:
            raise ValueError(f"No FRED observations returned for series {self.series_id}")

        rows = []
        for obs in observations:
            date_str = obs.get("date", "")
            value_str = obs.get("value", ".")
            if value_str == "." or not date_str:
                continue
            try:
                year = int(date_str[:4])
                value = float(value_str)
                rows.append({"year": year, "date": date_str, "value": value})
            except (ValueError, TypeError):
                continue

        if not rows:
            raise ValueError(f"All FRED observations were null for series {self.series_id}")

        df = pd.DataFrame(rows)

        if self.aggregate_annual:
            df = df.groupby("year", as_index=False)["value"].mean()

        return df[["year", "value"]]


def brent_crude_ingester() -> FREDIngester:
    return FREDIngester(
        series_id="DCOILBRENTEU",
        indicator="FRED_BRENT_CRUDE",
        source_name="FRED — Brent Crude Oil Price (USD/barrel), Europe, monthly averaged to annual",
        units="USD per barrel",
        aggregate_annual=True,
    )
