"""
SQLite database connection and schema initialisation.

Tables:
  metric_data   — raw ingested time series rows
  ingest_log    — tracks last successful fetch per indicator
"""
import aiosqlite  # noqa: F401 — re-exported for use in ingesters
import os
from pathlib import Path

# Default DB path relative to app root (rie-backend) so it works from any cwd
_APP_ROOT = Path(__file__).resolve().parent.parent
_DEFAULT_DB = _APP_ROOT / "data" / "rie.db"
DB_PATH = os.getenv("DATABASE_PATH", str(_DEFAULT_DB))

CREATE_METRIC_DATA = """
CREATE TABLE IF NOT EXISTS metric_data (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    indicator   TEXT NOT NULL,
    year        INTEGER NOT NULL,
    value       REAL,
    fetched_at  TEXT NOT NULL,
    UNIQUE(indicator, year)
);
"""

CREATE_INGEST_LOG = """
CREATE TABLE IF NOT EXISTS ingest_log (
    indicator       TEXT PRIMARY KEY,
    last_fetched_at TEXT NOT NULL,
    row_count       INTEGER NOT NULL
);
"""


def get_db_path() -> str:
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    return DB_PATH


async def init_db() -> None:
    """Create tables if they do not exist."""
    async with aiosqlite.connect(get_db_path()) as conn:
        conn.row_factory = aiosqlite.Row
        await conn.execute(CREATE_METRIC_DATA)
        await conn.execute(CREATE_INGEST_LOG)
        await conn.commit()
