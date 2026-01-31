/**
 * Load .env.local and .env before any Prisma or app code runs.
 * Import this first in seed.ts so DATABASE_URL is set when Prisma client loads.
 * Tries cwd and backend dir so seed works from apps/backend or repo root.
 */
import { config } from 'dotenv'
import { resolve } from 'path'

const cwd = process.cwd()
const paths = [
  resolve(cwd, '.env.local'),
  resolve(cwd, '.env'),
  resolve(cwd, 'apps/backend/.env.local'),
  resolve(cwd, 'apps/backend/.env'),
]
for (const p of paths) {
  config({ path: p })
}
