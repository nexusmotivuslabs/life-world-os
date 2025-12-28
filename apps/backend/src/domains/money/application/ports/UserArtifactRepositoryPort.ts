/**
 * UserArtifactRepositoryPort
 * 
 * Port (interface) for user artifact repository operations.
 */

import { UserArtifact, ArtifactType } from '../../domain/entities/UserArtifact.js'

export interface UserArtifactRepositoryPort {
  /**
   * Find artifact by ID
   */
  findById(id: string): Promise<UserArtifact | null>

  /**
   * Find all artifacts for a user
   */
  findByUserId(userId: string): Promise<UserArtifact[]>

  /**
   * Find artifacts by product
   */
  findByProductId(productId: string): Promise<UserArtifact[]>

  /**
   * Find artifacts by type
   */
  findByType(userId: string, type: ArtifactType): Promise<UserArtifact[]>

  /**
   * Find favorite artifacts
   */
  findFavorites(userId: string): Promise<UserArtifact[]>

  /**
   * Save artifact (create or update)
   */
  save(artifact: UserArtifact): Promise<UserArtifact>

  /**
   * Delete artifact
   */
  delete(id: string): Promise<void>

  /**
   * Search artifacts by query
   */
  search(userId: string, query: string): Promise<UserArtifact[]>
}


