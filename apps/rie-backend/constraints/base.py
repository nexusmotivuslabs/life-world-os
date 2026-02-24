"""
Abstract base for constraint layers.

A Constraint owns one or more metrics and resolves them into a
ConstraintResult containing state data, computed signals, a structural
message, and a strategic thesis.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional

import pandas as pd

from engine.signal import SignalResult
from engine.warning import WarningLevel


@dataclass
class MetricState:
    """Snapshot of a single metric with its time series and computed signals."""
    indicator: str
    name: str
    latest_value: Optional[float]
    units: str
    source: str
    last_updated: Optional[str]
    series: list[dict]          # [{"year": int, "value": float}, ...]
    signals: Optional[SignalResult]
    pressure_direction: str     # "high_is_bad" | "low_is_bad" | "neutral"


@dataclass
class ConstraintResult:
    """Full resolved output for one constraint layer."""
    id: str                     # e.g. "physical"
    name: str                   # e.g. "Physical"
    layer: int                  # 1–5
    metrics: list[MetricState]
    structural_message: str
    warning_level: WarningLevel
    thesis: str
    implications: list[str]
    disconfirming_conditions: list[str]
    country: str = "GB"
    time_horizon: str = "1990–present"


class BaseConstraint(ABC):
    """
    Subclass must implement `resolve()`.
    The constraint orchestrates its ingesters, runs the signal engine,
    and returns a fully populated ConstraintResult.
    """

    id: str
    name: str
    layer: int

    @abstractmethod
    async def resolve(self) -> ConstraintResult:
        ...

    def series_to_list(self, df: Optional[pd.DataFrame]) -> list[dict]:
        if df is None or df.empty:
            return []
        return [{"year": int(r["year"]), "value": round(float(r["value"]), 4)} for _, r in df.iterrows()]
