# API Keys for National Constraint Intelligence (UK)

The RIE uses the following data sources. Only **FRED** requires an API key for current ingesters.

## Summary: what’s missing and what’s required

| Requirement | Status | Notes |
|-------------|--------|--------|
| **FRED_API_KEY** | **Required** | Only key used by current code. Used for Physical (Brent Crude). |
| **ONS_API_KEY** | Not used yet | Optional in the metric spec; no ingester reads it. Use only if you add ONS API ingesters. |
| **Other API keys** | None | World Bank, BoE, ONS static do not use any key. |
| **Network** | Required | Outbound HTTPS to FRED, World Bank, Bank of England. No proxy config in code. |
| **Database** | Auto-created | SQLite at `DATABASE_PATH` or default `data/rie.db` under rie-backend. |
| **Seed file** | Required for Social | `data/seeds/uk_crime_ons.csv` (year, value). Must exist for Social constraint. |

## Required: FRED (Physical constraint)

| Key | Used for | Get it |
|-----|----------|--------|
| **`FRED_API_KEY`** | Physical constraint: Brent Crude (DCOILBRENTEU) | [FRED API](https://fred.stlouisfed.org/docs/api/api_key.html) — free registration. |

**Fix "502" or "Failed to load this constraint" for Physical:**

1. In `apps/rie-backend/`, copy `.env.example` to `.env` if you don’t have one:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and set your real key (no quotes):
   ```bash
   FRED_API_KEY=your_actual_fred_key_here
   ```
3. Restart the RIE backend. The app loads `.env` from the `rie-backend` directory on startup, so the key is used for all requests.
4. If you still see 502, check the backend terminal for the full error (e.g. invalid key, rate limit, or network). The UI now shows the server’s error message under “Failed to load this constraint”.

## Optional

| Key | Used for | Get it |
|-----|----------|--------|
| **`ONS_API_KEY`** | Higher rate limits when using ONS time-series API. Many ONS datasets are available without a key. | [ONS Developer](https://developer.ons.gov.uk/) |

## No key required

- **World Bank API** — fertility, dependency ratio, debt, broadband, R&D, unemployment (GB).
- **Bank of England** — official bank rate (IUDBEDR) via public CSV/statistical dataset.
- **ONS static / CSV** — e.g. crime seed data; bulk downloads often do not require a key.

If you add ingesters that use Ofgem, Ofcom, UKHSA, or Home Office APIs, check their developer docs; some offer keys for automated access.

---

## If you add more data sources (from uk_constraint_metrics.json)

The spec in `data/uk_constraint_metrics.json` lists more metrics than are currently implemented. If you add ingesters for them:

| Source | API key? | Notes |
|--------|----------|--------|
| **ONS** (time-series API) | Optional | [developer.ons.gov.uk](https://developer.ons.gov.uk/) — higher rate limits with a key; many datasets also via public CSV. |
| **Ofgem** | Check docs | Often PDF/Excel; no standard API key in public docs. |
| **Ofcom** | Check docs | Connected Nations etc.; bulk data often without key. |
| **UKHSA / NHS** | Check docs | Some feeds are public; APIs may require registration. |
| **DWP / Home Office** | Check docs | Stat-Xplore and ONS-style releases; keys if you use official APIs. |

**Current implementation uses only:** FRED (key), World Bank (no key), Bank of England (no key), ONS static CSV (no key). No other keys are missing for the five constraints as implemented today.
