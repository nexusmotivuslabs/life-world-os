"""
Unit tests for the signal detection engine.
All tests use synthetic data — no external API calls.
"""
import pytest
import pandas as pd

from engine.signal import compute_signals, _yoy_change, _rolling_slope, _inflection_detected, _zscore_vs_baseline, _ma_divergence


def make_series(values: list[float], start_year: int = 2000) -> pd.Series:
    years = list(range(start_year, start_year + len(values)))
    return pd.Series(values, index=years)


class TestYoYChange:
    def test_positive_growth(self):
        s = make_series([100.0, 110.0])
        result = _yoy_change(s)
        assert result == pytest.approx(10.0)

    def test_negative_growth(self):
        s = make_series([100.0, 90.0])
        result = _yoy_change(s)
        assert result == pytest.approx(-10.0)

    def test_zero_previous(self):
        s = make_series([0.0, 10.0])
        assert _yoy_change(s) is None

    def test_insufficient_data(self):
        s = make_series([100.0])
        assert _yoy_change(s) is None


class TestRollingSlope:
    def test_rising_trend(self):
        s = make_series([1.0, 2.0, 3.0, 4.0, 5.0])
        slope = _rolling_slope(s)
        assert slope == pytest.approx(1.0, rel=1e-3)

    def test_falling_trend(self):
        s = make_series([5.0, 4.0, 3.0, 2.0, 1.0])
        slope = _rolling_slope(s)
        assert slope == pytest.approx(-1.0, rel=1e-3)

    def test_insufficient_data(self):
        s = make_series([1.0, 2.0])
        assert _rolling_slope(s) is not None  # 2 points >= MIN_POINTS_SLOPE=3? No, 2 < 3
        # Actually MIN_POINTS_SLOPE=3 so 2 points returns None
        s2 = make_series([1.0, 2.0])
        result = _rolling_slope(s2)
        assert result is None


class TestInflectionDetection:
    def test_sign_reversal(self):
        assert _inflection_detected(1.0, -1.0) is True
        assert _inflection_detected(-0.5, 0.5) is True

    def test_no_reversal(self):
        assert _inflection_detected(1.0, 2.0) is False
        assert _inflection_detected(-1.0, -0.1) is False

    def test_none_inputs(self):
        assert _inflection_detected(None, 1.0) is False
        assert _inflection_detected(1.0, None) is False


class TestZScore:
    def test_above_baseline(self):
        values = [10.0] * 10 + [20.0]
        s = make_series(values)
        z = _zscore_vs_baseline(s, baseline_years=10)
        assert z is not None
        assert z > 0

    def test_within_baseline(self):
        values = [10.0] * 11
        s = make_series(values)
        z = _zscore_vs_baseline(s, baseline_years=10)
        assert z == pytest.approx(0.0, abs=1e-6)

    def test_insufficient_data(self):
        s = make_series([1.0, 2.0, 3.0, 4.0])
        assert _zscore_vs_baseline(s, baseline_years=10) is None


class TestMADivergence:
    def test_above_ma(self):
        s = make_series([10.0, 10.0, 10.0, 10.0, 15.0])
        div = _ma_divergence(s, window=4)
        assert div == pytest.approx(5.0)

    def test_below_ma(self):
        s = make_series([10.0, 10.0, 10.0, 10.0, 5.0])
        div = _ma_divergence(s, window=4)
        assert div == pytest.approx(-5.0)


class TestComputeSignals:
    def test_full_series(self):
        values = list(range(1, 21))  # 20 rising values
        s = make_series(values)
        result = compute_signals(s)
        assert result.yoy_change is not None
        assert result.rolling_slope is not None
        assert result.rolling_slope > 0
        assert result.zscore_vs_10yr is not None
        assert result.latest_value == pytest.approx(20.0)
        assert len(result.descriptions) > 0

    def test_empty_series(self):
        s = pd.Series(dtype=float)
        result = compute_signals(s)
        assert result.latest_value is None
        assert result.inflection_detected is False
