# Loki Logs (CloudWatch-like)

Loki is the log aggregation backend for the observability stack. View backend and frontend logs in Grafana (Explore) like CloudWatch Logs.

## How It Works

1. **Backend / frontend** – When you run `npm run local`, the backend and frontend write logs to `/tmp/life-world-backend.log` and `/tmp/life-world-frontend.log` on the host.
2. **Promtail** – Runs in Docker, mounts host `/tmp` as `/var/log/host`, and tails those files. It ships log lines to Loki.
3. **Loki** – Stores logs (30-day retention). Grafana queries Loki via the **Loki** datasource.
4. **Grafana** – Use **Explore** (compass icon) → select datasource **Loki** → run LogQL queries to search and filter logs.

## Viewing Logs in Grafana

1. Open **http://localhost:3000** and log in (admin / admin).
2. Go to **Explore** (compass icon in the left sidebar).
3. Choose datasource **Loki** (top dropdown).
4. Use **LogQL** to query, for example:
   - `{job="backend"}` – all backend log lines
   - `{job="frontend"}` – all frontend log lines
   - `{job="backend"} |= "error"` – backend lines containing "error"
   - `{job="backend"} | json | level="error"` – if logs are JSON with a `level` field

5. Set the time range (top right) and run the query.

## When Logs Appear

- **Promtail** only sees logs from the files it tails. Those files are created when you run **`npm run local`** (or when the backend/frontend write to `/tmp/life-world-backend.log` and `/tmp/life-world-frontend.log`).
- If you start the app with a different command (e.g. only `npm run dev`), ensure the processes write to those paths or update `monitoring/promtail/promtail-config.yaml` to point at the actual log paths.

## Config and Services

| Item | Location |
|------|----------|
| Loki config | `monitoring/loki/loki-config.yaml` |
| Promtail config | `monitoring/promtail/promtail-config.yaml` |
| Grafana Loki datasource | `monitoring/grafana/datasources/loki.yml` (provisioned) |
| Compose | `docker-compose.observability.local.yml` (services: `loki`, `promtail`) |

## Start/Stop

- **Start (with rest of observability):** `npm run dev:observability` or `npm run local` (Step 3 starts Loki + Promtail).
- **Stop:** `npm run observability:down` or `docker-compose -f docker-compose.observability.local.yml down`

Logs are stored in the `loki_data` Docker volume (30-day retention in config).
