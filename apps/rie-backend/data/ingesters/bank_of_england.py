"""
Bank of England API ingester.

Used for: Official Bank Rate (policy rate).

BoE provides a public CSV/JSON API via their Statistical Interactive Dataset.
Endpoint: https://www.bankofengland.co.uk/boeapps/database/_iadb-FromShowColumns.asp

We fetch the IUDBEDR series (Bank Rate) and average monthly values to annual.
No API key required.
"""
from __future__ import annotations

import io

import httpx
import pandas as pd

from data.ingesters.base import BaseIngester

BOE_URL = (
    "https://www.bankofengland.co.uk/boeapps/database/_iadb-FromShowColumns.asp"
    "?csv.x=yes"
    "&Datefrom=01/Jan/1990"
    "&Dateto=now"
    "&SeriesCodes=IUDBEDR"
    "&CSVF=TN"
    "&UsingCodes=Y"
)

TIMEOUT = 30.0

# BoE returns 403 for default Python/httpx User-Agent; send browser-like headers
BOE_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/csv,text/plain,*/*",
    "Accept-Language": "en-GB,en;q=0.9",
}


class BankOfEnglandIngester(BaseIngester):
    indicator = "BOE_BANK_RATE"
    source_name = "Bank of England — Official Bank Rate (%), annual average of monthly data"
    units = "% per annum"
    country = "GB"

    async def fetch(self) -> pd.DataFrame:
        async with httpx.AsyncClient(
            timeout=TIMEOUT,
            follow_redirects=True,
            headers=BOE_HEADERS,
        ) as client:
            resp = await client.get(BOE_URL)
            resp.raise_for_status()

        text = resp.text.strip()
        if not text or "<" in text[:200]:
            raise ValueError("Bank of England returned non-CSV (possibly HTML). Try again later.")

        # BoE CSV: may have 1+ header lines then "DATE,IUDBEDR" or "Date,IUDBEDR", then rows
        lines = text.splitlines()
        data_start = 0
        for i, line in enumerate(lines):
            if line.upper().startswith("DATE") or ("," in line and "IUDBEDR" in line.upper()):
                data_start = i
                break
        try:
            df_raw = pd.read_csv(
                io.StringIO(text),
                skiprows=data_start,
                header=0,
                names=["date", "value"],
            )
        except Exception as e:
            raise ValueError(f"Failed to parse BoE CSV: {e}")

        df_raw["value"] = pd.to_numeric(df_raw["value"], errors="coerce")
        df_raw = df_raw.dropna(subset=["value"])

        # Parse dates — BoE format is DD MMM YYYY or similar
        df_raw["parsed_date"] = pd.to_datetime(df_raw["date"], dayfirst=True, errors="coerce")
        df_raw = df_raw.dropna(subset=["parsed_date"])
        df_raw["year"] = df_raw["parsed_date"].dt.year.astype(int)

        df_annual = df_raw.groupby("year", as_index=False)["value"].mean()
        df_annual = df_annual[df_annual["year"] >= 1990]

        if df_annual.empty:
            raise ValueError("Bank of England CSV had no data from 1990 onward.")

        return df_annual[["year", "value"]]


def boe_rate_ingester() -> BankOfEnglandIngester:
    return BankOfEnglandIngester()
