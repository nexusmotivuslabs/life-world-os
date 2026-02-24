"""
GET /api/constraints/{constraint_id}

Returns a single resolved constraint layer.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from api.schemas import ConstraintResultSchema, MetricStateSchema, SignalResultSchema, DataPointSchema
from api.routes.dashboard import _to_schema
from constraints.registry import get_constraint

router = APIRouter()
log = logging.getLogger(__name__)


@router.get("/constraints/{constraint_id}", response_model=ConstraintResultSchema)
async def get_constraint_by_id(constraint_id: str):
    """Resolve and return a single constraint layer by ID."""
    try:
        constraint = get_constraint(constraint_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))

    try:
        result = await constraint.resolve()
    except Exception as e:
        log.exception("Constraint resolve failed: %s", constraint_id)
        raise HTTPException(status_code=502, detail=f"Failed to resolve constraint '{constraint_id}': {e}")

    return _to_schema(result)
