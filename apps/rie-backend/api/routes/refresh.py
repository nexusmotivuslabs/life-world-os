"""
POST /api/refresh

Force re-fetches all data ingesters, bypassing the SQLite cache.
Useful when you want to pull the latest values from external APIs.
"""
from __future__ import annotations

import asyncio

from fastapi import APIRouter

from api.schemas import RefreshResponseSchema
from data.ingesters.fred import brent_crude_ingester
from data.ingesters.world_bank import (
    fertility_ingester,
    dependency_ratio_ingester,
    debt_gdp_ingester,
    broadband_ingester,
    rd_spend_ingester,
    unemployment_ingester,
)
from data.ingesters.bank_of_england import boe_rate_ingester
from data.ingesters.ons_static import crime_rate_ingester

router = APIRouter()

ALL_INGESTERS = [
    brent_crude_ingester,
    fertility_ingester,
    dependency_ratio_ingester,
    debt_gdp_ingester,
    boe_rate_ingester,
    broadband_ingester,
    rd_spend_ingester,
    unemployment_ingester,
    crime_rate_ingester,
]


@router.post("/refresh", response_model=RefreshResponseSchema)
async def refresh_all():
    """Re-fetch all data sources and update the SQLite cache."""
    refreshed: list[str] = []
    errors: dict[str, str] = {}

    async def _run(factory):
        ingester = factory()
        try:
            await ingester.run()
            refreshed.append(ingester.indicator)
        except Exception as e:
            errors[ingester.indicator] = str(e)

    await asyncio.gather(*[_run(f) for f in ALL_INGESTERS])

    return RefreshResponseSchema(
        status="ok" if not errors else "partial",
        refreshed=refreshed,
        errors=errors,
    )
