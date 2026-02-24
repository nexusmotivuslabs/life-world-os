"""
Early Warning Level scoring.

Levels (ascending severity):
  GREEN  — within normal range, no significant signals
  YELLOW — mild elevation: YoY > threshold OR small MA divergence
  ORANGE — significant: Z-score > 1.5 OR inflection + directional slope
  RED    — critical: Z-score > 2.5 AND sustained slope in pressure direction

Each metric supplies a `pressure_direction`:
  "high_is_bad" — rising values increase pressure (e.g. debt/GDP)
  "low_is_bad"  — falling values increase pressure (e.g. fertility rate)
  "neutral"     — absolute magnitude determines pressure
"""
from __future__ import annotations

from enum import Enum
from typing import Optional

from engine.signal import SignalResult


class WarningLevel(str, Enum):
    GREEN = "green"
    YELLOW = "yellow"
    ORANGE = "orange"
    RED = "red"


# ── Thresholds ───────────────────────────────────────────────────────────────

ZSCORE_RED = 2.0
ZSCORE_ORANGE = 1.2
YOY_YELLOW_PCT = 3.0      # absolute % change triggers yellow
MA_DIV_SIGMA = 1.0         # MA divergence as multiple of recent std


def score(
    signals: SignalResult,
    pressure_direction: str = "neutral",
    yoy_yellow_threshold: float = YOY_YELLOW_PCT,
) -> WarningLevel:
    """
    Compute the warning level for a single metric.

    Parameters
    ----------
    signals : SignalResult
        Output of engine.signal.compute_signals()
    pressure_direction : str
        "high_is_bad" | "low_is_bad" | "neutral"
    yoy_yellow_threshold : float
        Absolute YoY % change required to trigger YELLOW (default 3%)
    """
    in_pressure = _is_in_pressure_direction(signals, pressure_direction)

    # RED: Z-score > threshold AND slope moving in pressure direction
    if (
        signals.zscore_vs_10yr is not None
        and abs(signals.zscore_vs_10yr) >= ZSCORE_RED
        and in_pressure
    ):
        return WarningLevel.RED

    # ORANGE: Z-score > threshold OR (inflection detected AND in pressure direction)
    if signals.zscore_vs_10yr is not None and abs(signals.zscore_vs_10yr) >= ZSCORE_ORANGE:
        return WarningLevel.ORANGE

    if signals.inflection_detected and in_pressure:
        return WarningLevel.ORANGE

    # YELLOW: Meaningful YoY change OR MA divergence in pressure direction
    if (
        signals.yoy_change is not None
        and abs(signals.yoy_change) >= yoy_yellow_threshold
        and in_pressure
    ):
        return WarningLevel.YELLOW

    if signals.ma_divergence is not None and _ma_in_pressure(signals, pressure_direction):
        return WarningLevel.YELLOW

    return WarningLevel.GREEN


def aggregate_warning(levels: list[WarningLevel]) -> WarningLevel:
    """Return the highest warning level from a list of metric-level scores."""
    order = [WarningLevel.GREEN, WarningLevel.YELLOW, WarningLevel.ORANGE, WarningLevel.RED]
    if not levels:
        return WarningLevel.GREEN
    return max(levels, key=lambda l: order.index(l))


# ── Private helpers ──────────────────────────────────────────────────────────

def _is_in_pressure_direction(signals: SignalResult, direction: str) -> bool:
    """Returns True if the current slope is moving in the pressure direction."""
    slope = signals.rolling_slope
    if slope is None:
        return False
    if direction == "high_is_bad":
        return slope > 0
    if direction == "low_is_bad":
        return slope < 0
    return abs(slope) > 0   # neutral — any movement counts


def _ma_in_pressure(signals: SignalResult, direction: str) -> bool:
    """Returns True if MA divergence is meaningful in the pressure direction."""
    ma_div = signals.ma_divergence
    if ma_div is None:
        return False
    if direction == "high_is_bad":
        return ma_div > 0
    if direction == "low_is_bad":
        return ma_div < 0
    return True
