/**
 * Data Validation Layer
 * 
 * Provides type-safe data validation and safe data accessors for API responses.
 * Uses Zod for schema validation and provides default values for missing data.
 */

import { z } from 'zod'

/**
 * Type guard to check if a value matches a Zod schema
 */
export function isValidData<T>(schema: z.ZodSchema<T>, data: unknown): data is T {
  try {
    schema.parse(data)
    return true
  } catch {
    return false
  }
}

/**
 * Validate data against a schema, returning the validated data or throwing an error
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data)
}

/**
 * Validate data against a schema, returning the validated data or a default value
 */
export function validateDataWithDefault<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  defaultValue: T
): T {
  try {
    return schema.parse(data)
  } catch {
    return defaultValue
  }
}

/**
 * Safe data accessor - gets a value from an object with a fallback
 */
export function safeGet<T>(obj: any, path: string, defaultValue: T): T {
  const keys = path.split('.')
  let current = obj

  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return defaultValue
    }
    current = current[key]
  }

  return current !== undefined && current !== null ? current : defaultValue
}

/**
 * Safe array accessor - ensures the value is an array
 */
export function safeArray<T>(value: unknown, defaultValue: T[] = []): T[] {
  if (Array.isArray(value)) {
    return value as T[]
  }
  return defaultValue
}

/**
 * Safe object accessor - ensures the value is an object
 */
export function safeObject<T extends Record<string, any>>(
  value: unknown,
  defaultValue: T
): T {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as T
  }
  return defaultValue
}

/**
 * Safe string accessor
 */
export function safeString(value: unknown, defaultValue: string = ''): string {
  if (typeof value === 'string') {
    return value
  }
  if (value != null) {
    return String(value)
  }
  return defaultValue
}

/**
 * Safe number accessor
 */
export function safeNumber(value: unknown, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (!isNaN(parsed)) {
      return parsed
    }
  }
  return defaultValue
}

/**
 * Safe boolean accessor
 */
export function safeBoolean(value: unknown, defaultValue: boolean = false): boolean {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true'
  }
  return defaultValue
}

/**
 * Common Zod schemas for API responses
 */

// Agent schema
export const AgentSchema = z.object({
  id: z.string(),
  type: z.string(),
  name: z.string(),
  description: z.string(),
  expertise: z.string(),
  avatar: z.string().optional(),
  order: z.number().default(0),
  metadata: z.any().optional(),
})

export type ValidatedAgent = z.infer<typeof AgentSchema>

// Team schema
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  order: z.number().default(0),
  agentCount: z.number().optional(),
})

export type ValidatedTeam = z.infer<typeof TeamSchema>

// Product schema
export const ProductSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.string(),
  icon: z.string().optional(),
  features: z.array(z.any()).optional(),
  integrationPoints: z.array(z.any()).optional(),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
  url: z.string().optional(),
  accessUrl: z.string().optional(),
  securityLevel: z.string().optional(),
  requiresAuth: z.boolean().optional(),
  security: z
    .object({
      complianceStandards: z.array(z.string()).optional(),
      encryptionAtRest: z.boolean().optional(),
      encryptionInTransit: z.boolean().optional(),
      authenticationMethod: z.string().optional(),
      lastSecurityReview: z.string().optional(),
      nextSecurityReview: z.string().optional(),
    })
    .optional(),
})

export type ValidatedProduct = z.infer<typeof ProductSchema>

// Guide schema
export const GuideSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  difficulty: z.number(),
  estimatedTime: z.number().optional(),
})

export type ValidatedGuide = z.infer<typeof GuideSchema>

// Array response schemas
export const AgentsResponseSchema = z.object({
  agents: z.array(AgentSchema).default([]),
})

export const TeamsResponseSchema = z.object({
  teams: z.array(TeamSchema).default([]),
})

export const ProductsResponseSchema = z.object({
  products: z.array(ProductSchema).default([]),
})

export const GuidesResponseSchema = z.object({
  guides: z.array(GuideSchema).default([]),
})

/**
 * Validate and normalize API response
 */
export function validateApiResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  defaultValue: T
): T {
  try {
    return schema.parse(data)
  } catch (error) {
    console.warn('API response validation failed, using default:', error)
    return defaultValue
  }
}


