# Redis cache (Life World OS)

Redis is used for **cache-aside** on read-heavy, rarely-changing data so the app stays fast when Redis is available and still works when it is not.

## When Redis is used

- **Optional:** If `REDIS_URL` is not set, all cache helpers no-op; data is read from the database only.
- **Used for:** Reality node by id (`GET /api/reality-nodes/:id`) and node children (`GET /api/reality-nodes/:id/children`). Data is captured on first read and stored with a 5-minute TTL.

## How data is captured

- **Cache-aside:** On a request, the backend tries Redis first. On cache miss it loads from Prisma, then writes the result to Redis with a TTL. The next request for the same key is served from Redis until expiry or invalidation.
- **Keys:** `lw:node:{id}` (single node), `lw:node:{id}:children` (children list). All keys are prefixed with `lw:`.
- **Invalidation:** Call `invalidateRealityNodeCaches()` from `lib/cache.js` after seed or admin updates that change the hierarchy, or rely on TTL (5 minutes).

## Running Redis locally

- **Docker (dev):** `docker-compose --profile db -f docker-compose.dev.yml up -d` starts Postgres and Redis. Backend in Docker gets `REDIS_URL=redis://redis-dev:6379`.
- **Local backend:** Set `REDIS_URL=redis://localhost:6379` in `apps/backend/.env.local` and start Redis (e.g. `docker run -p 6379:6379 redis:7-alpine` or use the dev compose Redis container).

## Configuration

| Env var     | Example                    | Description                    |
|------------|----------------------------|--------------------------------|
| `REDIS_URL` | `redis://localhost:6379`   | Redis connection URL (optional) |

## Files

- `src/lib/redis.ts` – Redis client and get/set/del helpers (no-op when `REDIS_URL` is unset).
- `src/lib/cache.ts` – Cache-aside helpers and key names; used by RealityNodeController.
