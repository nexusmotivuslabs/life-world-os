"""
Signal detection engine — pure functions over a pandas Series.

All inputs are a pd.Series indexed by integer year, values are floats.
All outputs are deterministic and traceable to computed numbers.

No inference, no speculation, no LLM.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

import numpy as np
import pandas as pd


@dataclass
class SignalResult:
    """
    Computed signals for a single metric time series.
    All numeric fields are rounded to 4 decimal places.
    Human-readable descriptions reference the actual numbers.
    """
    yoy_change: Optional[float]             # % change year-over-year
    rolling_slope: Optional[float]          # OLS slope over last 5 data points
    inflection_detected: bool               # Sign change in rolling slope
    zscore_vs_10yr: Optional[float]         # Z-score vs 10-year baseline
    ma_divergence: Optional[float]          # current value − 4-period moving average
    latest_year: Optional[int]
    latest_value: Optional[float]
    descriptions: list[str] = field(default_factory=list)


MIN_POINTS_SLOPE = 3
MIN_POINTS_ZSCORE = 5
MA_WINDOW = 4
SLOPE_WINDOW = 5
BASELINE_YEARS = 10


def compute_signals(series: pd.Series) -> SignalResult:
    """
    Compute all signals for a time series.

    Parameters
    ----------
    series : pd.Series
        Index = year (int), values = float. Must be sorted ascending.
    """
    series = series.dropna().sort_index()

    if len(series) == 0:
        return SignalResult(
            yoy_change=None,
            rolling_slope=None,
            inflection_detected=False,
            zscore_vs_10yr=None,
            ma_divergence=None,
            latest_year=None,
            latest_value=None,
            descriptions=["Insufficient data"],
        )

    latest_year = int(series.index[-1])
    latest_value = round(float(series.iloc[-1]), 4)

    yoy = _yoy_change(series)
    slope = _rolling_slope(series, SLOPE_WINDOW)
    prev_slope = _rolling_slope(series.iloc[:-1], SLOPE_WINDOW) if len(series) > SLOPE_WINDOW else None
    inflection = _inflection_detected(slope, prev_slope)
    zscore = _zscore_vs_baseline(series, BASELINE_YEARS)
    ma_div = _ma_divergence(series, MA_WINDOW)

    descriptions = _build_descriptions(yoy, slope, inflection, zscore, ma_div, latest_value)

    return SignalResult(
        yoy_change=_r(yoy),
        rolling_slope=_r(slope),
        inflection_detected=inflection,
        zscore_vs_10yr=_r(zscore),
        ma_divergence=_r(ma_div),
        latest_year=latest_year,
        latest_value=latest_value,
        descriptions=descriptions,
    )


# ── Private helpers ──────────────────────────────────────────────────────────

def _r(v: Optional[float], decimals: int = 4) -> Optional[float]:
    return round(float(v), decimals) if v is not None else None


def _yoy_change(s: pd.Series) -> Optional[float]:
    if len(s) < 2:
        return None
    prev = s.iloc[-2]
    curr = s.iloc[-1]
    if prev == 0 or pd.isna(prev):
        return None
    return ((curr - prev) / abs(prev)) * 100


def _rolling_slope(s: pd.Series, window: int = SLOPE_WINDOW) -> Optional[float]:
    """OLS slope of value over year for the last `window` observations."""
    if len(s) < MIN_POINTS_SLOPE:
        return None
    tail = s.iloc[-window:] if len(s) >= window else s
    years = np.array(tail.index, dtype=float)
    values = np.array(tail.values, dtype=float)
    if np.any(np.isnan(values)):
        return None
    coeffs = np.polyfit(years, values, 1)
    return float(coeffs[0])


def _inflection_detected(
    current_slope: Optional[float],
    previous_slope: Optional[float],
) -> bool:
    """True if the sign of the slope has reversed between windows."""
    if current_slope is None or previous_slope is None:
        return False
    if abs(current_slope) < 1e-10 or abs(previous_slope) < 1e-10:
        return False
    return np.sign(current_slope) != np.sign(previous_slope)


def _zscore_vs_baseline(s: pd.Series, baseline_years: int = BASELINE_YEARS) -> Optional[float]:
    """Z-score of the latest value against the baseline window."""
    if len(s) < MIN_POINTS_ZSCORE:
        return None
    baseline = s.iloc[-baseline_years:] if len(s) >= baseline_years else s
    mean = float(baseline.mean())
    std = float(baseline.std(ddof=1))
    if std == 0 or pd.isna(std):
        return None
    return (s.iloc[-1] - mean) / std


def _ma_divergence(s: pd.Series, window: int = MA_WINDOW) -> Optional[float]:
    """latest value − rolling mean of last `window` periods (excluding latest)."""
    if len(s) < window + 1:
        return None
    ma = float(s.iloc[-(window + 1):-1].mean())
    return float(s.iloc[-1]) - ma


def _build_descriptions(
    yoy: Optional[float],
    slope: Optional[float],
    inflection: bool,
    zscore: Optional[float],
    ma_div: Optional[float],
    latest: float,
) -> list[str]:
    out: list[str] = []

    if yoy is not None:
        direction = "up" if yoy > 0 else "down"
        out.append(f"YoY: {yoy:+.2f}% ({direction})")

    if slope is not None:
        trend = "rising" if slope > 0 else "falling"
        out.append(f"Trend slope: {slope:+.4f} per year ({trend})")

    if inflection:
        out.append("Inflection detected: trend direction has reversed")

    if zscore is not None:
        sigma = "above" if zscore > 0 else "below"
        out.append(f"Z-score: {zscore:+.2f}σ {sigma} 10yr baseline")

    if ma_div is not None:
        direction = "above" if ma_div > 0 else "below"
        out.append(f"MA divergence: {ma_div:+.4f} {direction} 4-period average")

    return out
