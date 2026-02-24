"""
ONS static data ingester.

Reads from a local CSV seed file (data/seeds/uk_crime_ons.csv).
Used for UK crime rate per 1,000 population.

Source: Office for National Statistics — Crime in England and Wales
URL: https://www.ons.gov.uk/peoplepopulationandcommunity/crimeandjustice

The seed CSV has columns: year (int), value (float)
"""
from __future__ import annotations

from pathlib import Path

import pandas as pd

from data.ingesters.base import BaseIngester

SEEDS_DIR = Path(__file__).parent.parent / "seeds"


class ONSStaticIngester(BaseIngester):
    """Reads a local CSV seed file — no HTTP request required."""

    def __init__(
        self,
        filename: str,
        indicator: str,
        source_name: str,
        units: str,
    ):
        self.filename = filename
        self.indicator = indicator
        self.source_name = source_name
        self.units = units
        self.country = "GB"

    async def fetch(self) -> pd.DataFrame:
        path = SEEDS_DIR / self.filename
        if not path.exists():
            raise FileNotFoundError(
                f"Seed file not found: {path}. "
                f"Add a CSV with columns 'year' and 'value' to data/seeds/"
            )
        df = pd.read_csv(path)
        if "year" not in df.columns or "value" not in df.columns:
            raise ValueError(f"Seed file {self.filename} must have 'year' and 'value' columns")
        return df[["year", "value"]]


def crime_rate_ingester() -> ONSStaticIngester:
    return ONSStaticIngester(
        filename="uk_crime_ons.csv",
        indicator="ONS_GB_CRIME_RATE",
        source_name="ONS — Crime in England and Wales, offences per 1,000 population",
        units="offences per 1,000 population",
    )
