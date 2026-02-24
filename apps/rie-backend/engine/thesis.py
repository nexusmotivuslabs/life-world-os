"""
Deterministic structural message and strategic thesis builder.

All output is generated from computed signal values — no LLM, no speculation.
Templates are selected from a matrix keyed on (constraint_layer, warning_level, pressure_direction)
and populated with actual computed numbers from SignalResult.

Each constraint layer has custom language tuned to its domain.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from engine.signal import SignalResult
from engine.warning import WarningLevel


@dataclass
class ThesisResult:
    structural_message: str
    warning_level: WarningLevel
    thesis: str
    implications: list[str]
    disconfirming_conditions: list[str]


# ── Structural message templates ─────────────────────────────────────────────
# Keys: (constraint_layer, warning_level)
# Placeholders: {signals}, {metric}, {direction}

_STRUCTURAL_TEMPLATES: dict[tuple[str, str], str] = {
    # Physical
    ("physical", "green"): (
        "UK energy price proxy is tracking within normal historical range. "
        "{signals} "
        "No material tightening of physical resource costs detected. "
        "Current trajectory does not indicate supply-side constraint pressure."
    ),
    ("physical", "yellow"): (
        "UK energy price proxy shows mild elevation above recent baseline. "
        "{signals} "
        "Constraint pressure is beginning to tighten. "
        "Second-order effects may include marginal increases in household and industrial operating costs."
    ),
    ("physical", "orange"): (
        "UK energy price proxy is diverging meaningfully from its historical baseline. "
        "{signals} "
        "Physical constraint pressure is tightening. "
        "Likely second-order effects: compression of real disposable income, "
        "upward pressure on producer costs, and increased energy security risk."
    ),
    ("physical", "red"): (
        "UK energy price proxy has reached a statistically significant deviation from its 10-year baseline. "
        "{signals} "
        "Physical constraint pressure is at elevated structural risk. "
        "Second-order effects: sustained energy cost inflation, potential industrial output contraction, "
        "and possible policy intervention in energy markets."
    ),
    # Biological
    ("biological", "green"): (
        "UK demographic indicators are within their long-run historical range. "
        "{signals} "
        "Biological constraint pressure is stable. "
        "No significant shifts in fertility or dependency structure detected."
    ),
    ("biological", "yellow"): (
        "UK demographic indicators are showing mild directional movement. "
        "{signals} "
        "Biological constraint pressure is beginning to build. "
        "Continued trajectory may begin to affect labour supply and social care costs over a 10–15 year horizon."
    ),
    ("biological", "orange"): (
        "UK demographic indicators have diverged from their historical baseline. "
        "{signals} "
        "Biological constraint pressure is tightening. "
        "Likely second-order effects: rising dependency ratios, increasing NHS and pension system strain, "
        "and reduced natural labour force growth."
    ),
    ("biological", "red"): (
        "UK demographic indicators have reached a statistically elevated deviation from their 10-year baseline. "
        "{signals} "
        "Biological constraint pressure is at structural risk. "
        "Second-order effects: acute labour shortages in key sectors, "
        "unsustainable pension and care cost trajectories, and demographic-driven fiscal pressure."
    ),
    # Economic
    ("economic", "green"): (
        "UK fiscal and monetary indicators are within their recent historical range. "
        "{signals} "
        "Economic constraint pressure is not elevated. "
        "No structural stress signal detected in debt levels or monetary policy stance."
    ),
    ("economic", "yellow"): (
        "UK fiscal or monetary indicators are showing directional movement. "
        "{signals} "
        "Economic constraint pressure is beginning to tighten. "
        "Continued trajectory may reduce fiscal headroom or increase borrowing costs."
    ),
    ("economic", "orange"): (
        "UK fiscal or monetary indicators have diverged from their historical baseline. "
        "{signals} "
        "Economic constraint pressure is tightening. "
        "Likely second-order effects: constrained government spending capacity, "
        "higher debt servicing costs, and reduced policy flexibility in a future downturn."
    ),
    ("economic", "red"): (
        "UK fiscal or monetary indicators have reached a statistically elevated deviation from their 10-year baseline. "
        "{signals} "
        "Economic constraint pressure is at structural risk. "
        "Second-order effects: potential sovereign credit risk re-pricing, "
        "forced fiscal consolidation, and reduced capacity to absorb external shocks."
    ),
    # Informational
    ("informational", "green"): (
        "UK informational infrastructure metrics are within their historical growth trend. "
        "{signals} "
        "Informational constraint pressure is not elevated. "
        "Broadband penetration and R&D investment are tracking expected trajectories."
    ),
    ("informational", "yellow"): (
        "UK informational infrastructure metrics are showing mild divergence from trend. "
        "{signals} "
        "Informational constraint pressure is beginning to build. "
        "Slowing investment in knowledge infrastructure may begin to affect long-run productivity."
    ),
    ("informational", "orange"): (
        "UK informational infrastructure metrics have diverged meaningfully from their historical baseline. "
        "{signals} "
        "Informational constraint pressure is tightening. "
        "Likely second-order effects: widening productivity gap with comparable economies, "
        "reduced capacity for technological adaptation, and weaker innovation pipeline."
    ),
    ("informational", "red"): (
        "UK informational infrastructure metrics have reached a statistically significant deviation. "
        "{signals} "
        "Informational constraint pressure is at structural risk. "
        "Second-order effects: structural competitiveness erosion, "
        "talent retention risk, and long-run GDP growth constraint."
    ),
    # Social
    ("social", "green"): (
        "UK social stability indicators are within their historical range. "
        "{signals} "
        "Social constraint pressure is not elevated. "
        "No significant structural shifts detected in crime or labour market conditions."
    ),
    ("social", "yellow"): (
        "UK social stability indicators are showing directional movement. "
        "{signals} "
        "Social constraint pressure is beginning to build. "
        "Continued trajectory may reflect underlying economic or demographic stress."
    ),
    ("social", "orange"): (
        "UK social stability indicators have diverged from their historical baseline. "
        "{signals} "
        "Social constraint pressure is tightening. "
        "Likely second-order effects: increased public service demand, "
        "reduced social cohesion, and higher costs of policing and justice."
    ),
    ("social", "red"): (
        "UK social stability indicators have reached a statistically elevated deviation from their 10-year baseline. "
        "{signals} "
        "Social constraint pressure is at structural risk. "
        "Second-order effects: erosion of institutional trust, "
        "potential civil disruption risk, and compounding strain on public finances."
    ),
}

# ── Thesis templates ─────────────────────────────────────────────────────────
# Keys: (constraint_layer, warning_level)

_THESIS_TEMPLATES: dict[tuple[str, str], dict] = {
    ("physical", "green"): {
        "thesis": "UK physical resource constraints are stable and do not represent a near-term structural risk.",
        "implications": [
            "Energy cost assumptions in financial models can use recent trend as baseline.",
            "No immediate energy-driven inflationary impulse anticipated.",
            "Physical operating environment is permissive for investment and expansion.",
        ],
        "disconfirm": [
            "A sustained rise in Brent crude above 3σ from the 10yr mean.",
            "A structural break in UK electricity prices driven by grid or supply disruption.",
        ],
    },
    ("physical", "yellow"): {
        "thesis": "UK energy costs are trending upward and warrant monitoring for pass-through effects.",
        "implications": [
            "Build a modest energy cost buffer into operating cost projections.",
            "Watch for second-round effects on CPI and real wage growth.",
            "Energy-intensive businesses face margin compression risk.",
        ],
        "disconfirm": [
            "YoY energy price change reverting below 3% for two consecutive periods.",
            "A structural demand reduction or supply increase stabilising the index.",
        ],
    },
    ("physical", "orange"): {
        "thesis": "UK physical constraint pressure is tightening and represents an active risk to cost structures.",
        "implications": [
            "Adjust financial models to reflect elevated energy cost baseline.",
            "Assess supply chain exposure to energy-intensive inputs.",
            "Monitor BoE response — energy-driven CPI may constrain rate flexibility.",
        ],
        "disconfirm": [
            "Z-score falling below 1.5σ for two consecutive periods.",
            "A supply-side intervention (e.g. North Sea expansion, new capacity) materially reducing the index.",
        ],
    },
    ("physical", "red"): {
        "thesis": "UK physical resource costs are at a historically elevated level and represent a structural constraint on growth.",
        "implications": [
            "Treat elevated energy costs as a baseline assumption, not a transient shock.",
            "Assess resilience of consumer and business balance sheets to sustained high energy prices.",
            "Policy intervention risk is elevated — watch for price caps, windfall taxes, or emergency supply measures.",
        ],
        "disconfirm": [
            "Z-score returning below 2.0σ and sustained for more than two periods.",
            "A structural shift in energy mix (e.g. rapid renewables scaling) fundamentally repricing the index.",
        ],
    },
    ("biological", "green"): {
        "thesis": "UK demographic structure is stable and does not pose a near-term constraint on labour supply or social systems.",
        "implications": [
            "Labour market models can use current demographic trajectory as baseline.",
            "Pension and healthcare cost projections remain on trend — no step-change risk.",
            "Natural population dynamics support moderate organic economic activity.",
        ],
        "disconfirm": [
            "Fertility rate falling below 1.5 for two consecutive periods.",
            "Dependency ratio rising above 3σ from the 10yr mean.",
        ],
    },
    ("biological", "yellow"): {
        "thesis": "UK demographic indicators are trending in a direction that warrants monitoring over a 10–20 year horizon.",
        "implications": [
            "Factor demographic headwinds into long-run labour supply projections.",
            "NHS and pension system cost trajectories should be stress-tested.",
            "Immigration policy becomes a meaningful swing variable for workforce growth.",
        ],
        "disconfirm": [
            "Fertility rate stabilising or recovering above the 10yr mean.",
            "Net migration inflows sustaining working-age population growth.",
        ],
    },
    ("biological", "orange"): {
        "thesis": "UK demographic constraint pressure is building and will materially affect labour, healthcare, and pension systems within 15 years.",
        "implications": [
            "Incorporate demographic drag into GDP growth forecasts beyond 2035.",
            "Productivity growth becomes critical to offset labour supply constraints.",
            "Social care and NHS funding gaps will widen without structural reform.",
        ],
        "disconfirm": [
            "Z-score falling below 1.5σ for two consecutive periods.",
            "A policy-driven increase in fertility support or managed migration restoring trend.",
        ],
    },
    ("biological", "red"): {
        "thesis": "UK demographic structure has reached a historically significant deviation representing a structural constraint on long-run economic capacity.",
        "implications": [
            "Treat demographic headwinds as a permanent feature of the UK macro environment.",
            "Fiscal sustainability of the welfare state requires urgent structural reassessment.",
            "Automation and productivity investment are no longer optional — they are load-bearing.",
        ],
        "disconfirm": [
            "Z-score returning below 2.0σ sustained over two or more periods.",
            "A demographic policy shock (e.g. large managed migration programme) materially shifting the dependency ratio.",
        ],
    },
    ("economic", "green"): {
        "thesis": "UK fiscal and monetary conditions are stable and do not represent a near-term structural constraint.",
        "implications": [
            "Current debt and rate levels are consistent with continued borrowing capacity.",
            "Monetary policy has room to respond to shocks in either direction.",
            "No immediate sovereign risk premium uplift anticipated.",
        ],
        "disconfirm": [
            "Debt-to-GDP rising above 3σ from the 10yr mean.",
            "BoE rate moving more than 2σ from baseline in either direction.",
        ],
    },
    ("economic", "yellow"): {
        "thesis": "UK fiscal or monetary indicators are drifting and warrant monitoring for constraint accumulation.",
        "implications": [
            "Begin stress-testing financial plans against a higher debt servicing cost scenario.",
            "Fiscal headroom is narrowing — contingency budget assumptions should be conservative.",
            "Watch for gilt yield spreads widening as a leading indicator.",
        ],
        "disconfirm": [
            "YoY debt/GDP change stabilising below 3% for two consecutive periods.",
            "BoE rate returning to within 1σ of its 5yr average.",
        ],
    },
    ("economic", "orange"): {
        "thesis": "UK economic constraint pressure is tightening and fiscal flexibility is being materially reduced.",
        "implications": [
            "Assume reduced government capacity to respond to future shocks with fiscal stimulus.",
            "Higher structural borrowing costs should be built into long-term financial models.",
            "Corporate exposure to public sector contracts or subsidies faces greater political risk.",
        ],
        "disconfirm": [
            "Z-score falling below 1.5σ for two consecutive periods.",
            "A credible medium-term fiscal consolidation plan materially stabilising debt trajectory.",
        ],
    },
    ("economic", "red"): {
        "thesis": "UK economic constraint pressure is at a historically elevated level representing a structural risk to fiscal sustainability.",
        "implications": [
            "Sovereign risk is an active consideration — monitor gilt spreads and credit default swap pricing.",
            "Forced fiscal consolidation is a plausible base scenario — model public spending cuts.",
            "Business and investment planning should account for a potential period of fiscal austerity.",
        ],
        "disconfirm": [
            "Z-score returning below 2.0σ sustained over two or more periods.",
            "A structural improvement in the UK's primary fiscal balance reducing the debt trajectory.",
        ],
    },
    ("informational", "green"): {
        "thesis": "UK informational infrastructure is on trend and does not pose a near-term constraint on productivity or innovation.",
        "implications": [
            "Digital infrastructure can be treated as an enabler rather than a constraint.",
            "R&D pipeline is consistent with maintaining competitive parity with comparable economies.",
            "No immediate informational gap risk.",
        ],
        "disconfirm": [
            "R&D spend falling below 2σ from comparable economy benchmarks.",
            "Broadband penetration stalling below 3σ of the EU average.",
        ],
    },
    ("informational", "yellow"): {
        "thesis": "UK informational infrastructure metrics are drifting and may begin to constrain productivity growth.",
        "implications": [
            "Monitor R&D investment trends against G7 peers as a leading indicator.",
            "Assess whether current broadband rollout pace supports anticipated demand growth.",
            "Knowledge economy businesses should factor digital infrastructure risk into site selection.",
        ],
        "disconfirm": [
            "R&D spend recovering to above the 10yr mean for two consecutive periods.",
            "Broadband penetration growth rate returning to or exceeding the prior 5yr trend.",
        ],
    },
    ("informational", "orange"): {
        "thesis": "UK informational constraint pressure is building and represents a meaningful productivity and competitiveness risk.",
        "implications": [
            "Factor informational infrastructure gaps into long-run TFP projections.",
            "Talent and investment may begin shifting to better-connected economies.",
            "Digital public services face a widening capacity gap.",
        ],
        "disconfirm": [
            "Z-score falling below 1.5σ for two consecutive periods.",
            "A major public or private R&D investment programme materially changing the trajectory.",
        ],
    },
    ("informational", "red"): {
        "thesis": "UK informational constraint pressure is at a historically significant level representing a structural drag on economic competitiveness.",
        "implications": [
            "Treat informational infrastructure underinvestment as a baseline constraint on growth.",
            "Assess exposure to sectors reliant on cutting-edge R&D or high-bandwidth infrastructure.",
            "Policy risk is elevated — expect political pressure for emergency digital investment programmes.",
        ],
        "disconfirm": [
            "Z-score returning below 2.0σ sustained over two or more periods.",
            "A step-change increase in both broadband coverage and R&D spending closing the gap to comparable economies.",
        ],
    },
    ("social", "green"): {
        "thesis": "UK social stability indicators are within normal range and do not represent a near-term constraint.",
        "implications": [
            "No near-term social disruption premium in UK operating environment.",
            "Labour market and social system assumptions can use current trend as baseline.",
            "Civil stability supports normal commercial and investment activity.",
        ],
        "disconfirm": [
            "Crime rate rising above 2σ from the 10yr mean.",
            "Unemployment rate spiking above 3σ from the 5yr average.",
        ],
    },
    ("social", "yellow"): {
        "thesis": "UK social indicators are trending and warrant monitoring as leading signals of underlying economic stress.",
        "implications": [
            "Social stress metrics often lead economic deterioration — monitor alongside macro data.",
            "Public service demand may be increasing — factor into fiscal sustainability models.",
            "Consumer confidence and discretionary spending are potential early casualties.",
        ],
        "disconfirm": [
            "Social indicators reverting to within 1σ of their 10yr mean for two consecutive periods.",
            "A robust labour market recovery absorbing unemployment pressure.",
        ],
    },
    ("social", "orange"): {
        "thesis": "UK social constraint pressure is tightening and reflects meaningful stress in the underlying social fabric.",
        "implications": [
            "Elevated social risk increases the cost of doing business in affected regions.",
            "Government fiscal priority may shift toward social stabilisation, crowding out productive investment.",
            "Social instability risk should be factored into real estate and long-horizon capital deployment decisions.",
        ],
        "disconfirm": [
            "Z-score falling below 1.5σ for two consecutive periods.",
            "A sustained improvement in employment and a reduction in crime rates over 4+ quarters.",
        ],
    },
    ("social", "red"): {
        "thesis": "UK social constraint pressure is at a historically elevated level representing an active structural risk to stability and institutional trust.",
        "implications": [
            "Treat social instability as a baseline operating risk for UK-focused businesses.",
            "Political risk is elevated — populist policy responses may reshape the regulatory environment.",
            "Long-horizon capital allocation should account for a potentially disruptive adjustment period.",
        ],
        "disconfirm": [
            "Z-score returning below 2.0σ sustained over two or more periods.",
            "A structural improvement in both employment and safety metrics reducing the composite social pressure.",
        ],
    },
}


def build_thesis(
    constraint_layer: str,
    warning_level: WarningLevel,
    signal_descriptions: list[str],
) -> ThesisResult:
    """
    Build a deterministic structural message and strategic thesis.

    Parameters
    ----------
    constraint_layer : str
        One of: physical, biological, economic, informational, social
    warning_level : WarningLevel
        Computed warning level from engine.warning.score()
    signal_descriptions : list[str]
        Human-readable signal strings from SignalResult.descriptions (reference actual numbers)
    """
    level_key = warning_level.value
    struct_template = _STRUCTURAL_TEMPLATES.get(
        (constraint_layer, level_key),
        _STRUCTURAL_TEMPLATES.get(("physical", "green"), "No structural message available.")
    )

    signals_text = " ".join(signal_descriptions) if signal_descriptions else "No signal data available."
    structural_message = struct_template.format(signals=signals_text)

    thesis_data = _THESIS_TEMPLATES.get(
        (constraint_layer, level_key),
        {
            "thesis": "Insufficient data to generate a thesis.",
            "implications": [],
            "disconfirm": [],
        },
    )

    return ThesisResult(
        structural_message=structural_message,
        warning_level=warning_level,
        thesis=thesis_data["thesis"],
        implications=thesis_data["implications"],
        disconfirming_conditions=thesis_data["disconfirm"],
    )
