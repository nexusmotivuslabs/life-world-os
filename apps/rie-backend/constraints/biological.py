"""
Biological Constraint Layer — Layer 2.

Metrics:
  1. UK fertility rate (births per woman) — low_is_bad
  2. UK age dependency ratio (% of working-age population) — high_is_bad

Sources: World Bank API (free, no auth)
"""
from __future__ import annotations

import pandas as pd

from constraints.base import BaseConstraint, ConstraintResult, MetricState
from data.ingesters.world_bank import fertility_ingester, dependency_ratio_ingester
from engine.signal import compute_signals
from engine.warning import score, aggregate_warning, WarningLevel
from engine.thesis import build_thesis


class BiologicalConstraint(BaseConstraint):
    id = "biological"
    name = "Biological"
    layer = 2

    async def resolve(self) -> ConstraintResult:
        fert_ingester = fertility_ingester()
        dep_ingester = dependency_ratio_ingester()

        fert_df = await fert_ingester.get_or_fetch()
        dep_df = await dep_ingester.get_or_fetch()

        fert_series = pd.Series(fert_df["value"].values, index=fert_df["year"].values) if not fert_df.empty else pd.Series(dtype=float)
        dep_series = pd.Series(dep_df["value"].values, index=dep_df["year"].values) if not dep_df.empty else pd.Series(dtype=float)

        fert_signals = compute_signals(fert_series)
        dep_signals = compute_signals(dep_series)

        fert_warning = score(fert_signals, pressure_direction="low_is_bad")
        dep_warning = score(dep_signals, pressure_direction="high_is_bad")
        combined_warning = aggregate_warning([fert_warning, dep_warning])

        all_descriptions = fert_signals.descriptions + dep_signals.descriptions
        thesis_result = build_thesis("biological", combined_warning, all_descriptions)

        metrics = [
            MetricState(
                indicator=fert_ingester.indicator,
                name="UK Fertility Rate",
                latest_value=fert_signals.latest_value,
                units=fert_ingester.units,
                source=fert_ingester.source_name,
                last_updated=str(fert_signals.latest_year) if fert_signals.latest_year else None,
                series=self.series_to_list(fert_df),
                signals=fert_signals,
                pressure_direction="low_is_bad",
            ),
            MetricState(
                indicator=dep_ingester.indicator,
                name="UK Age Dependency Ratio",
                latest_value=dep_signals.latest_value,
                units=dep_ingester.units,
                source=dep_ingester.source_name,
                last_updated=str(dep_signals.latest_year) if dep_signals.latest_year else None,
                series=self.series_to_list(dep_df),
                signals=dep_signals,
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
