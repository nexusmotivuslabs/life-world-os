"""
World Bank API ingester.

Free API — no authentication required.
Endpoint: https://api.worldbank.org/v2/country/{country}/indicator/{indicator}?format=json&mrv=60&per_page=100

Supported indicators (GB):
  SP.DYN.TFRT.IN    — Fertility rate, total (births per woman)
  SP.POP.DPND       — Age dependency ratio (% of working-age population)
  GC.DOD.TOTL.GD.ZS — Central government debt, total (% of GDP)
  IT.NET.BBND.P2    — Fixed broadband subscriptions (per 100 people)
  GB.XPD.RSDV.GD.ZS — Research and development expenditure (% of GDP)
  SL.UEM.TOTL.ZS    — Unemployment, total (% of total labor force)
"""
from __future__ import annotations

import httpx
import pandas as pd

from data.ingesters.base import BaseIngester

WB_BASE = "https://api.worldbank.org/v2"
TIMEOUT = 30.0


class WorldBankIngester(BaseIngester):
    """Generic World Bank ingester parameterised at construction."""

    def __init__(
        self,
        wb_indicator: str,
        indicator: str,
        source_name: str,
        units: str,
        country: str = "GB",
    ):
        self.wb_indicator = wb_indicator
        self.indicator = indicator
        self.source_name = source_name
        self.units = units
        self.country = country

    async def fetch(self) -> pd.DataFrame:
        url = (
            f"{WB_BASE}/country/{self.country}/indicator/{self.wb_indicator}"
            f"?format=json&mrv=60&per_page=100"
        )
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(url)
            resp.raise_for_status()

        payload = resp.json()
        if not isinstance(payload, list) or len(payload) < 2:
            raise ValueError(f"Unexpected World Bank response for {self.wb_indicator}")

        records = payload[1]
        rows = []
        for rec in records:
            year = rec.get("date")
            value = rec.get("value")
            if year and value is not None:
                try:
                    rows.append({"year": int(year), "value": float(value)})
                except (ValueError, TypeError):
                    continue

        if not rows:
            raise ValueError(f"No data returned from World Bank for {self.wb_indicator} / {self.country}")

        return pd.DataFrame(rows)


# ── Pre-configured instances ─────────────────────────────────────────────────

def fertility_ingester() -> WorldBankIngester:
    return WorldBankIngester(
        wb_indicator="SP.DYN.TFRT.IN",
        indicator="WB_GB_FERTILITY",
        source_name="World Bank — Fertility rate, total (births per woman), GB",
        units="births per woman",
    )


def dependency_ratio_ingester() -> WorldBankIngester:
    return WorldBankIngester(
        wb_indicator="SP.POP.DPND",
        indicator="WB_GB_DEPENDENCY_RATIO",
        source_name="World Bank — Age dependency ratio (% of working-age population), GB",
        units="% of working-age population",
    )


def debt_gdp_ingester() -> WorldBankIngester:
    return WorldBankIngester(
        wb_indicator="GC.DOD.TOTL.GD.ZS",
        indicator="WB_GB_DEBT_GDP",
        source_name="World Bank — Central government debt, total (% of GDP), GB",
        units="% of GDP",
    )


def broadband_ingester() -> WorldBankIngester:
    return WorldBankIngester(
        wb_indicator="IT.NET.BBND.P2",
        indicator="WB_GB_BROADBAND",
        source_name="World Bank — Fixed broadband subscriptions per 100 people, GB",
        units="subscriptions per 100 people",
    )


def rd_spend_ingester() -> WorldBankIngester:
    return WorldBankIngester(
        wb_indicator="GB.XPD.RSDV.GD.ZS",
        indicator="WB_GB_RD_SPEND",
        source_name="World Bank — R&D expenditure (% of GDP), GB",
        units="% of GDP",
    )


def unemployment_ingester() -> WorldBankIngester:
    return WorldBankIngester(
        wb_indicator="SL.UEM.TOTL.ZS",
        indicator="WB_GB_UNEMPLOYMENT",
        source_name="World Bank — Unemployment rate (% of total labour force), GB",
        units="% of total labour force",
    )
