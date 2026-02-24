# Adding New Constraints and Countries

This guide explains how to extend the Reality Intelligence Engine with new constraint layers or country scopes.

---

## Adding a New Constraint Layer

### Step 1 — Create the constraint module

Create `apps/rie-backend/constraints/<name>.py`:

```python
from constraints.base import BaseConstraint, ConstraintResult, MetricState
from data.ingesters.world_bank import WorldBankIngester
from engine.signal import compute_signals
from engine.warning import score, aggregate_warning
from engine.thesis import build_thesis
import pandas as pd

class MyNewConstraint(BaseConstraint):
    id = "my_constraint"       # Must be URL-safe lowercase
    name = "My Constraint"     # Human-readable name
    layer = 6                  # Layer number (1–N)

    async def resolve(self) -> ConstraintResult:
        ingester = WorldBankIngester(
            wb_indicator="INDICATOR_CODE",
            indicator="WB_GB_MY_METRIC",
            source_name="World Bank — My Metric, GB",
            units="unit label",
        )
        df = await ingester.get_or_fetch()
        series = pd.Series(df["value"].values, index=df["year"].values)
        signals = compute_signals(series)
        warning = score(signals, pressure_direction="high_is_bad")  # or "low_is_bad" | "neutral"
        thesis_result = build_thesis("my_constraint", warning, signals.descriptions)

        metric = MetricState(
            indicator=ingester.indicator,
            name="My Metric Name",
            latest_value=signals.latest_value,
            units=ingester.units,
            source=ingester.source_name,
            last_updated=str(signals.latest_year) if signals.latest_year else None,
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
```

### Step 2 — Register the constraint

Open `constraints/registry.py` and add to `_get_registry()`:

```python
from constraints.my_constraint import MyNewConstraint

return {
    "physical": PhysicalConstraint,
    "biological": BiologicalConstraint,
    # ...
    "my_constraint": MyNewConstraint,   # <-- add this line
}
```

### Step 3 — Add structural message and thesis templates (optional but recommended)

Open `engine/thesis.py` and add entries to `_STRUCTURAL_TEMPLATES` and `_THESIS_TEMPLATES`:

```python
_STRUCTURAL_TEMPLATES[("my_constraint", "green")] = "..."
_STRUCTURAL_TEMPLATES[("my_constraint", "yellow")] = "..."
_STRUCTURAL_TEMPLATES[("my_constraint", "orange")] = "..."
_STRUCTURAL_TEMPLATES[("my_constraint", "red")] = "..."

_THESIS_TEMPLATES[("my_constraint", "green")] = {
    "thesis": "...",
    "implications": ["...", "...", "..."],
    "disconfirm": ["...", "..."],
}
# ... repeat for yellow, orange, red
```

That is all. The dashboard endpoint picks up all registered constraints automatically.

---

## Adding a New Country

### Step 1 — Use the `country` parameter on World Bank ingesters

`WorldBankIngester` accepts a `country` ISO2 code:

```python
WorldBankIngester(
    wb_indicator="SP.DYN.TFRT.IN",
    indicator="WB_DE_FERTILITY",
    source_name="World Bank — Fertility rate, DE",
    units="births per woman",
    country="DE",             # <-- change this
)
```

### Step 2 — Add a country-scoped constraint module

Create `constraints/physical_de.py` (or any name), following the same pattern as `constraints/physical.py` but with German-specific ingesters and indicator keys.

### Step 3 — Register the country-specific constraint

Register it with a scoped key in `registry.py`:

```python
"physical_de": PhysicalConstraintDE,
```

### Step 4 — Country-specific thesis templates (recommended)

Add `("physical_de", "green")` etc. entries to `engine/thesis.py` with language appropriate for the German context.

---

## Pressure Direction Guide

| `pressure_direction` | Interpretation |
|---|---|
| `high_is_bad` | Rising values increase constraint pressure (e.g. debt/GDP, unemployment, crime) |
| `low_is_bad` | Falling values increase constraint pressure (e.g. fertility, broadband penetration, R&D) |
| `neutral` | Both rising and falling extremes matter (e.g. interest rates, inflation) |

---

## Data Ingester Reference

| Ingester | Source | Requires Auth |
|---|---|---|
| `WorldBankIngester` | api.worldbank.org/v2 | No |
| `BankOfEnglandIngester` | BoE statistical dataset | No |
| `FREDIngester` | api.stlouisfed.org | Yes — free key |
| `ONSStaticIngester` | Local CSV in `data/seeds/` | No |

### Adding a new external API source

1. Create `data/ingesters/my_source.py` extending `BaseIngester`
2. Implement `async def fetch(self) -> pd.DataFrame` returning `year` + `value` columns
3. Call `await ingester.get_or_fetch()` in your constraint — the base class handles caching automatically

---

## Signal Engine Thresholds

Warning level thresholds are configurable per metric via `engine.warning.score()`:

```python
score(
    signals,
    pressure_direction="high_is_bad",
    yoy_yellow_threshold=5.0,  # override default 3%
)
```

The `ZSCORE_RED` (2.0) and `ZSCORE_ORANGE` (1.2) constants in `engine/warning.py` are global defaults and can be overridden per metric if needed by subclassing or by adding metric-specific thresholds to the constraint module.
