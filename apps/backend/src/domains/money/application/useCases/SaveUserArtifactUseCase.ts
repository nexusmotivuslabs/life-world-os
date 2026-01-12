/**
 * SaveUserArtifactUseCase
 * 
 * Use case for saving user artifacts (recommendations, calculations, etc.)
 */

import { UserArtifact, ArtifactType } from '../../domain/entities/UserArtifact.js'
import { UserArtifactRepositoryPort } from '../ports/UserArtifactRepositoryPort.js'

export interface SaveArtifactInput {
  userId: string
  productId?: string
  productName: string
  type: ArtifactType
  title: string
  data: any
  description?: string
  tags?: string[]
}

export class SaveUserArtifactUseCase {
  constructor(
    private artifactRepository: UserArtifactRepositoryPort
  ) {}

  async execute(input: SaveArtifactInput): Promise<UserArtifact> {
    // Generate ID
    const id = `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create artifact entity
    const artifact = UserArtifact.create(
      id,
      input.userId,
      input.productName,
      input.type,
      input.title,
      input.data,
      input.productId,
      input.description,
      input.tags
    )

    // Save to repository
    return await this.artifactRepository.save(artifact)
  }
}





