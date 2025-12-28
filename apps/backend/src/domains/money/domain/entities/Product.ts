/**
 * Product Domain Entity
 * 
 * Pure business logic entity representing a product/tool owned by an organization.
 * Products are owned by organizations (e.g., Nexus Motivus), not teams.
 * Teams reference products via associations.
 * No infrastructure dependencies - pure TypeScript class.
 */

import { TeamProductType } from '@prisma/client'

export interface ProductFeature {
  name: string
  description: string
  enabled: boolean
}

export interface IntegrationPoint {
  system: string // e.g., 'Resources', 'Engines', 'Investments'
  dataType: string // e.g., 'gold', 'income', 'portfolio'
  direction: 'read' | 'write' | 'both'
}

export class Product {
  private constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly type: TeamProductType,
    public readonly icon: string | null,
    public readonly features: ProductFeature[],
    public readonly integrationPoints: IntegrationPoint[],
    public readonly isActive: boolean,
    public readonly order: number,
    public readonly url: string | null,
    public readonly accessUrl: string | null,
    public readonly securityLevel: string | null,
    public readonly requiresAuth: boolean
  ) {}

  /**
   * Create a new Product entity
   */
  static create(
    id: string,
    organizationId: string,
    name: string,
    description: string,
    type: TeamProductType,
    icon: string | null = null,
    features: ProductFeature[] = [],
    integrationPoints: IntegrationPoint[] = [],
    isActive: boolean = true,
    order: number = 0,
    url: string | null = null,
    accessUrl: string | null = null,
    securityLevel: string | null = null,
    requiresAuth: boolean = true
  ): Product {
    return new Product(
      id,
      organizationId,
      name,
      description,
      type,
      icon,
      features,
      integrationPoints,
      isActive,
      order,
      url,
      accessUrl,
      securityLevel,
      requiresAuth
    )
  }

  /**
   * Create Product from persisted data
   */
  static fromPersistence(data: {
    id: string
    organizationId: string
    name: string
    description: string
    type: TeamProductType
    icon: string | null
    features: unknown // JSON from database
    integrationPoints: unknown // JSON from database
    isActive: boolean
    order: number
    url?: string | null
    accessUrl?: string | null
    securityLevel?: string | null
    requiresAuth?: boolean
  }): Product {
    // Parse features from JSON
    const features = Array.isArray(data.features)
      ? (data.features as ProductFeature[])
      : (data.features
          ? JSON.parse(data.features as string) as ProductFeature[]
          : [])

    // Parse integration points from JSON
    const integrationPoints = Array.isArray(data.integrationPoints)
      ? (data.integrationPoints as IntegrationPoint[])
      : (data.integrationPoints
          ? JSON.parse(data.integrationPoints as string) as IntegrationPoint[]
          : [])

    return new Product(
      data.id,
      data.organizationId,
      data.name,
      data.description,
      data.type,
      data.icon,
      features,
      integrationPoints,
      data.isActive,
      data.order,
      data.url ?? null,
      data.accessUrl ?? null,
      data.securityLevel ?? null,
      data.requiresAuth ?? true
    )
  }

  /**
   * Check if product has a specific feature
   */
  hasFeature(featureName: string): boolean {
    return this.features.some(
      feature => feature.name === featureName && feature.enabled
    )
  }

  /**
   * Get enabled features only
   */
  getEnabledFeatures(): ProductFeature[] {
    return this.features.filter(feature => feature.enabled)
  }

  /**
   * Check if product integrates with a specific system
   */
  integratesWith(system: string): boolean {
    return this.integrationPoints.some(point => point.system === system)
  }

  /**
   * Get integration points for a specific system
   */
  getIntegrationPointsForSystem(system: string): IntegrationPoint[] {
    return this.integrationPoints.filter(point => point.system === system)
  }

  /**
   * Check if product can read from a system
   */
  canReadFrom(system: string, dataType: string): boolean {
    return this.integrationPoints.some(
      point =>
        point.system === system &&
        point.dataType === dataType &&
        (point.direction === 'read' || point.direction === 'both')
    )
  }

  /**
   * Check if product can write to a system
   */
  canWriteTo(system: string, dataType: string): boolean {
    return this.integrationPoints.some(
      point =>
        point.system === system &&
        point.dataType === dataType &&
        (point.direction === 'write' || point.direction === 'both')
    )
  }

  /**
   * Get product category description
   */
  getTypeDescription(): string {
    const typeDescriptions: Record<TeamProductType, string> = {
      CALCULATOR: 'Financial calculator tool',
      TRACKER: 'Tracking and monitoring tool',
      TEMPLATE: 'Template or framework',
      DASHBOARD: 'Dashboard and visualization',
      TOOL: 'General utility tool',
      ANALYZER: 'Analysis and reporting tool',
      PLANNER: 'Planning and projection tool',
    }

    return typeDescriptions[this.type] || 'Financial product'
  }
}

