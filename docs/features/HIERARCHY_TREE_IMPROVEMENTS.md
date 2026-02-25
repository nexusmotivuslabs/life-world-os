# Hierarchy Tree Improvements (feature/hierarchy-tree-improvements)

## Goals

1. **Always readable on all devices** – Tree and node details must be fully usable on mobile, tablet, and desktop (responsive layout, touch-friendly, no essential content cut off).
2. **All data available** – No truncation of labels or descriptions; full text visible or accessible (expand, tooltip, or scroll). Long content should wrap or scroll, not be ellipsized.
3. **Sentiment analysis and advice** – For concepts that represent states or traits (e.g. Rage, Cynicism):
   - **Positive / “good” terms** → Offer advice on how to do more of it or reinforce it.
   - **Negative / “bad” terms** → Offer advice on ways to avoid, reduce, or manage (e.g. cynicism).
   - UI: Show sentiment (e.g. positive/negative/neutral) and a short “Advice” or “How to engage” section in the node detail panel.

## Scope

- **Components:** `HierarchyTreeView.tsx`, node detail modal (selected node panel), `RootNodeModal.tsx` if used for the same nodes.
- **Data:** Reality nodes (laws, principles, universal concepts). Extend node metadata or seed data to support optional `sentiment` and `advice` (or `adviceToReinforce` / `adviceToAvoid`) for applicable nodes.
- **Responsive:** Tree row layout, font sizes, padding, and modal width/scroll already use responsive classes; audit and fix any remaining truncation (e.g. row description `truncate`, `line-clamp`) and ensure tree container and modals work on small viewports.

## Implementation notes

- **Truncation:** Remove or replace `truncate` on node label and description in tree rows; use `break-words` + wrap, or show full text in detail panel only and keep row short with “View details” for full content.
- **Detail panel:** Ensure Description and all template fields (law, principle, framework) render full content with scroll if needed; add optional **Sentiment** and **Advice** sections when `node.data.sentiment` / `node.data.advice` (or equivalent) exist.
- **Sentiment data:** Backend or seed data must provide, per node, at least: sentiment (e.g. `positive` | `negative` | `neutral`) and advice text (or separate “advice to reinforce” vs “advice to avoid”). Start with a few concepts (e.g. Rage, Cynicism) as examples.

## Acceptance criteria

- [x] Tree and detail panel are readable and usable on narrow viewports (e.g. 320px width).
- [x] No critical content (node title, description) is permanently hidden by truncation; full text is visible in the detail panel or via expand/tooltip.
- [x] For nodes with sentiment data: detail panel shows sentiment and advice (e.g. “Ways to avoid” for negative, “How to do more” for positive).
- [x] Existing behaviour (expand/collapse, navigation, artifacts) is preserved.

## Done

- **Tree rows:** Node label uses `line-clamp-2` + `break-words` (no single-line truncate); description snippet uses `line-clamp-2` and is visible from `sm` up.
- **Detail modal:** Description uses `break-words`; optional **Sentiment & advice** section shows when `sentiment`, `advice`, `adviceToReinforce`, or `adviceToAvoid` exist (positive → green "How to do more", negative → amber "Ways to avoid").
- **Seed data:** `seedEnergyStates` adds `sentiment` and `adviceToReinforce` / `adviceToAvoid` for Rage, Cynicism, Focus, Calm, Burnout, Flow State, Deep Work. Re-run seed (or re-seed energy states) to populate existing DBs.
- **Special terms (specialist advice):** Key terms (e.g. Flow State, Focus) can have optional metadata for a dedicated **Specialist advice** block in the detail panel:
  - **What it is** – `specialTermWhatItIs` (string)
  - **Key facts** – `specialTermKeyFacts` (array of strings, or string)
  - **How it contributes to life** – `specialTermHowItContributesToLife` (string)
  - Seeded for **Flow State** and **Focus** in `seedEnergyStates`. Add more by setting these fields on any reality node’s metadata.
