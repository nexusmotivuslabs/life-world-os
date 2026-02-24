"""
Informational Constraint Layer — Layer 4.

Metrics:
  1. UK fixed broadband penetration (subscriptions per 100 people) — low_is_bad
  2. UK R&D expenditure (% of GDP) — low_is_bad

Sources: World Bank API (free, no auth)
"""
from __future__ import annotations

import pandas as pd

from constraints.base import BaseConstraint, ConstraintResult, MetricState
from data.ingesters.world_bank import broadband_ingester, rd_spend_ingester
from engine.signal import compute_signals
from engine.warning import score, aggregate_warning
from engine.thesis import build_thesis


class InformationalConstraint(BaseConstraint):
    id = "informational"
    name = "Informational"
    layer = 4

    async def resolve(self) -> ConstraintResult:
        bb_ingester = broadband_ingester()
        rd_ingester = rd_spend_ingester()

        bb_df = await bb_ingester.get_or_fetch()
        rd_df = await rd_ingester.get_or_fetch()

        bb_series = pd.Series(bb_df["value"].values, index=bb_df["year"].values) if not bb_df.empty else pd.Series(dtype=float)
        rd_series = pd.Series(rd_df["value"].values, index=rd_df["year"].values) if not rd_df.empty else pd.Series(dtype=float)

        bb_signals = compute_signals(bb_series)
        rd_signals = compute_signals(rd_series)

        bb_warning = score(bb_signals, pressure_direction="low_is_bad")
        rd_warning = score(rd_signals, pressure_direction="low_is_bad")
        combined_warning = aggregate_warning([bb_warning, rd_warning])

        all_descriptions = bb_signals.descriptions + rd_signals.descriptions
        thesis_result = build_thesis("informational", combined_warning, all_descriptions)

        metrics = [
            MetricState(
                indicator=bb_ingester.indicator,
                name="UK Broadband Penetration",
                latest_value=bb_signals.latest_value,
                units=bb_ingester.units,
                source=bb_ingester.source_name,
                last_updated=str(bb_signals.latest_year) if bb_signals.latest_year else None,
                series=self.series_to_list(bb_df),
                signals=bb_signals,
                pressure_direction="low_is_bad",
            ),
            MetricState(
                indicator=rd_ingester.indicator,
                name="UK R&D Expenditure (% of GDP)",
                latest_value=rd_signals.latest_value,
                units=rd_ingester.units,
                source=rd_ingester.source_name,
                last_updated=str(rd_signals.latest_year) if rd_signals.latest_year else None,
                series=self.series_to_list(rd_df),
                signals=rd_signals,
                pressure_direction="low_is_bad",
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
