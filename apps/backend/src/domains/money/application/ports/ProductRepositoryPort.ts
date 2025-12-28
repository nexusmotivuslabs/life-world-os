/**
 * ProductRepositoryPort
 * 
 * Port (interface) for product repository operations.
 * Products are owned by organizations, teams reference them via associations.
 */

import { TeamProductType } from '@prisma/client'
import { Product } from '../../domain/entities/Product.js'

export interface ProductRepositoryPort {
  /**
   * Find product by ID
   */
  findById(id: string): Promise<Product | null>

  /**
   * Find products associated with a team (via TeamProductAssociation)
   */
  findByTeamId(teamId: string): Promise<Product[]>

  /**
   * Find products by organization ID
   */
  findByOrganizationId(organizationId: string): Promise<Product[]>

  /**
   * Find products by type
   */
  findByType(type: TeamProductType): Promise<Product[]>

  /**
   * Find active products (optionally filter by team via associations)
   */
  findActiveProducts(teamId?: string): Promise<Product[]>

  /**
   * Save product (create or update)
   */
  save(product: Product): Promise<Product>
}

