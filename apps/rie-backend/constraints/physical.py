"""
Physical Constraint Layer — Layer 1.

Metric: UK energy price proxy (Brent Crude, USD/barrel, annual average).

Source: FRED — DCOILBRENTEU
Pressure direction: high_is_bad (rising energy prices tighten physical constraints)
"""
from __future__ import annotations

import pandas as pd

from constraints.base import BaseConstraint, ConstraintResult, MetricState
from data.ingesters.fred import brent_crude_ingester
from engine.signal import compute_signals
from engine.warning import score, WarningLevel
from engine.thesis import build_thesis


class PhysicalConstraint(BaseConstraint):
    id = "physical"
    name = "Physical"
    layer = 1

    async def resolve(self) -> ConstraintResult:
        ingester = brent_crude_ingester()
        df = await ingester.get_or_fetch()

        series = pd.Series(df["value"].values, index=df["year"].values) if not df.empty else pd.Series(dtype=float)
        signals = compute_signals(series)

        latest_value = signals.latest_value
        latest_year = signals.latest_year
        warning = score(signals, pressure_direction="high_is_bad")
        thesis_result = build_thesis("physical", warning, signals.descriptions)

        metric = MetricState(
            indicator=ingester.indicator,
            name="UK Energy Price Proxy (Brent Crude)",
            latest_value=latest_value,
            units=ingester.units,
            source=ingester.source_name,
            last_updated=str(latest_year) if latest_year else None,
            series=self.series_to_list(df),
            signals=signals,
            pressure_direction="high_is_bad",
        )

        return ConstraintResult(
            id=self.id,
            name=self.name,
            layer=self.layer,
            metrics=[metric],
            structural_message=thesis_result.structural_message,
            warning_level=warning,
            thesis=thesis_result.thesis,
            implications=thesis_result.implications,
            disconfirming_conditions=thesis_result.disconfirming_conditions,
        )
