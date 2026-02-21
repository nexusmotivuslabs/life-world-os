/**
 * Schema Parity Tests
 *
 * Ensures custom TypeScript enums stay in sync with Prisma schema.
 * Catches cases where we add values to our types (e.g. ActivityType.REST) but
 * forget to add them to the Prisma schema or run prisma generate.
 *
 * Also validates that any ActivityType values passed to Prisma queries exist
 * in the generated Prisma client (and thus in schema.prisma).
 *
 * Run: npm run test -- schemaParity
 */

import { describe, it, expect } from 'vitest'
import { ActivityType as PrismaActivityType } from '@prisma/client'
import { RECOVERY_ACTION_TYPES } from '../capacityRecoveryService'

const PRISMA_ACTIVITY_VALUES = Object.values(PrismaActivityType) as string[]

describe('Schema Parity - ActivityType', () => {
  it('RECOVERY_ACTION_TYPES only uses values that exist in Prisma ActivityType', () => {
    for (const value of RECOVERY_ACTION_TYPES) {
      expect(
        PRISMA_ACTIVITY_VALUES,
        `RECOVERY_ACTION_TYPES contains "${value}" which is not in Prisma schema. Add to schema.prisma, run prisma generate, then db push or migrate.`
      ).toContain(value)
    }
  })
})
