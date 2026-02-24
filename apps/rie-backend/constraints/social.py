"""
Social Constraint Layer — Layer 5.

Metrics:
  1. UK crime rate (offences per 1,000 population) — high_is_bad (ONS static seed)
  2. UK unemployment rate (% of labour force) — high_is_bad (World Bank)

Sources:
  ONS static CSV (crime rate)
  World Bank API (unemployment)
"""
from __future__ import annotations

import pandas as pd

from constraints.base import BaseConstraint, ConstraintResult, MetricState
from data.ingesters.ons_static import crime_rate_ingester
from data.ingesters.world_bank import unemployment_ingester
from engine.signal import compute_signals
from engine.warning import score, aggregate_warning
from engine.thesis import build_thesis


class SocialConstraint(BaseConstraint):
    id = "social"
    name = "Social"
    layer = 5

    async def resolve(self) -> ConstraintResult:
        crime_ing = crime_rate_ingester()
        unemp_ing = unemployment_ingester()

        crime_df = await crime_ing.get_or_fetch()
        unemp_df = await unemp_ing.get_or_fetch()

        crime_series = pd.Series(crime_df["value"].values, index=crime_df["year"].values) if not crime_df.empty else pd.Series(dtype=float)
        unemp_series = pd.Series(unemp_df["value"].values, index=unemp_df["year"].values) if not unemp_df.empty else pd.Series(dtype=float)

        crime_signals = compute_signals(crime_series)
        unemp_signals = compute_signals(unemp_series)

        crime_warning = score(crime_signals, pressure_direction="high_is_bad")
        unemp_warning = score(unemp_signals, pressure_direction="high_is_bad")
        combined_warning = aggregate_warning([crime_warning, unemp_warning])

        all_descriptions = crime_signals.descriptions + unemp_signals.descriptions
        thesis_result = build_thesis("social", combined_warning, all_descriptions)

        metrics = [
            MetricState(
                indicator=crime_ing.indicator,
                name="UK Crime Rate",
                latest_value=crime_signals.latest_value,
                units=crime_ing.units,
                source=crime_ing.source_name,
                last_updated=str(crime_signals.latest_year) if crime_signals.latest_year else None,
                series=self.series_to_list(crime_df),
                signals=crime_signals,
                pressure_direction="high_is_bad",
            ),
            MetricState(
                indicator=unemp_ing.indicator,
                name="UK Unemployment Rate",
                latest_value=unemp_signals.latest_value,
                units=unemp_ing.units,
                source=unemp_ing.source_name,
                last_updated=str(unemp_signals.latest_year) if unemp_signals.latest_year else None,
                series=self.series_to_list(unemp_df),
                signals=unemp_signals,
                pressure_direction="high_is_bad",
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
