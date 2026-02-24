"""
Economic Constraint Layer — Layer 3.

Metrics:
  1. UK central government debt (% of GDP) — high_is_bad
  2. Bank of England official bank rate (%) — neutral (both extremes are problematic)

Sources:
  World Bank API — debt/GDP
  Bank of England statistical dataset — bank rate
"""
from __future__ import annotations

import pandas as pd

from constraints.base import BaseConstraint, ConstraintResult, MetricState
from data.ingesters.world_bank import debt_gdp_ingester
from data.ingesters.bank_of_england import boe_rate_ingester
from engine.signal import compute_signals
from engine.warning import score, aggregate_warning
from engine.thesis import build_thesis


class EconomicConstraint(BaseConstraint):
    id = "economic"
    name = "Economic"
    layer = 3

    async def resolve(self) -> ConstraintResult:
        debt_ingester = debt_gdp_ingester()
        rate_ingester = boe_rate_ingester()

        debt_df = await debt_ingester.get_or_fetch()
        rate_df = await rate_ingester.get_or_fetch()

        debt_series = pd.Series(debt_df["value"].values, index=debt_df["year"].values) if not debt_df.empty else pd.Series(dtype=float)
        rate_series = pd.Series(rate_df["value"].values, index=rate_df["year"].values) if not rate_df.empty else pd.Series(dtype=float)

        debt_signals = compute_signals(debt_series)
        rate_signals = compute_signals(rate_series)

        debt_warning = score(debt_signals, pressure_direction="high_is_bad")
        rate_warning = score(rate_signals, pressure_direction="high_is_bad", yoy_yellow_threshold=25.0)
        combined_warning = aggregate_warning([debt_warning, rate_warning])

        all_descriptions = debt_signals.descriptions + rate_signals.descriptions
        thesis_result = build_thesis("economic", combined_warning, all_descriptions)

        metrics = [
            MetricState(
                indicator=debt_ingester.indicator,
                name="UK Government Debt (% of GDP)",
                latest_value=debt_signals.latest_value,
                units=debt_ingester.units,
                source=debt_ingester.source_name,
                last_updated=str(debt_signals.latest_year) if debt_signals.latest_year else None,
                series=self.series_to_list(debt_df),
                signals=debt_signals,
                pressure_direction="high_is_bad",
            ),
            MetricState(
                indicator=rate_ingester.indicator,
                name="Bank of England Policy Rate",
                latest_value=rate_signals.latest_value,
                units=rate_ingester.units,
                source=rate_ingester.source_name,
                last_updated=str(rate_signals.latest_year) if rate_signals.latest_year else None,
                series=self.series_to_list(rate_df),
                signals=rate_signals,
                pressure_direction="neutral",
            ),
        ]

        return ConstraintResult(
            id=self.id,
            name=self.name,
            layer=self.layer,
            metrics=metrics,
            structural_message=thesis_result.structural_message,
            warning_level=combined_warning,
            thesis=thesis_result.thesis,
            implications=thesis_result.implications,
            disconfirming_conditions=thesis_result.disconfirming_conditions,
        )
