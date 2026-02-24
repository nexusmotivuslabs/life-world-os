"""
Pydantic response schemas for the RIE API.

These mirror the internal dataclasses but are serialisation-safe
and provide the contract for the frontend TypeScript types.
"""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel

from engine.warning import WarningLevel


class SignalResultSchema(BaseModel):
    yoy_change: Optional[float]
    rolling_slope: Optional[float]
    inflection_detected: bool
    zscore_vs_10yr: Optional[float]
    ma_divergence: Optional[float]
    latest_year: Optional[int]
    latest_value: Optional[float]
    descriptions: list[str]


class DataPointSchema(BaseModel):
    year: int
    value: float


class MetricStateSchema(BaseModel):
    indicator: str
    name: str
    latest_value: Optional[float]
    units: str
    source: str
    last_updated: Optional[str]
    series: list[DataPointSchema]
    signals: Optional[SignalResultSchema]
    pressure_direction: str


class ConstraintResultSchema(BaseModel):
    id: str
    name: str
    layer: int
    country: str
    time_horizon: str
    metrics: list[MetricStateSchema]
    structural_message: str
    warning_level: WarningLevel
    thesis: str
    implications: list[str]
    disconfirming_conditions: list[str]


class DashboardSchema(BaseModel):
    country: str
    constraints: list[ConstraintResultSchema]
    overall_warning: WarningLevel
    generated_at: str


class RefreshResponseSchema(BaseModel):
    status: str
    refreshed: list[str]
    errors: dict[str, str]
