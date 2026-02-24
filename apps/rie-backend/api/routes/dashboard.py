"""
GET /api/dashboard

Returns all 5 constraint layers resolved in parallel,
with an aggregated overall warning level.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from api.schemas import ConstraintResultSchema, DashboardSchema, MetricStateSchema, SignalResultSchema, DataPointSchema
from constraints.registry import all_constraint_ids, get_constraint
from engine.warning import aggregate_warning

router = APIRouter()


def _to_schema(result) -> ConstraintResultSchema:
    metrics = []
    for m in result.metrics:
        signals_schema = None
        if m.signals:
            signals_schema = SignalResultSchema(
                yoy_change=m.signals.yoy_change,
                rolling_slope=m.signals.rolling_slope,
                inflection_detected=m.signals.inflection_detected,
                zscore_vs_10yr=m.signals.zscore_vs_10yr,
                ma_divergence=m.signals.ma_divergence,
                latest_year=m.signals.latest_year,
                latest_value=m.signals.latest_value,
                descriptions=m.signals.descriptions,
            )
        metrics.append(MetricStateSchema(
            indicator=m.indicator,
            name=m.name,
            latest_value=m.latest_value,
            units=m.units,
            source=m.source,
            last_updated=m.last_updated,
            series=[DataPointSchema(year=p["year"], value=p["value"]) for p in m.series],
            signals=signals_schema,
            pressure_direction=m.pressure_direction,
        ))
    return ConstraintResultSchema(
        id=result.id,
        name=result.name,
        layer=result.layer,
        country=result.country,
        time_horizon=result.time_horizon,
        metrics=metrics,
        structural_message=result.structural_message,
        warning_level=result.warning_level,
        thesis=result.thesis,
        implications=result.implications,
        disconfirming_conditions=result.disconfirming_conditions,
    )


@router.get("/dashboard", response_model=DashboardSchema)
async def get_dashboard():
    """Resolve all constraint layers and return the full dashboard payload."""
    ids = all_constraint_ids()
    tasks = [get_constraint(cid).resolve() for cid in ids]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    constraints = []
    errors = []
    for cid, result in zip(ids, results):
        if isinstance(result, Exception):
            errors.append(f"{cid}: {result}")
        else:
            constraints.append(_to_schema(result))

    if errors:
        # Partial results are fine — return what resolved successfully
        pass

    overall = aggregate_warning([c.warning_level for c in constraints])

    return DashboardSchema(
        country="GB",
        constraints=sorted(constraints, key=lambda c: c.layer),
        overall_warning=overall,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )
