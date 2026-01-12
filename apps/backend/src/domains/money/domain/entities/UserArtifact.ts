/**
 * UserArtifact Entity
 * 
 * Domain entity for user artifacts (recommendations, calculations, etc.)
 * saved from products.
 */

export type ArtifactType = 'RECOMMENDATION' | 'CALCULATION' | 'SCENARIO' | 'REPORT' | 'NOTE'

export interface UserArtifactData {
  [key: string]: any // Flexible structure for different artifact types
}

export class UserArtifact {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly productId: string | null,
    public readonly productName: string,
    public readonly type: ArtifactType,
    public readonly title: string,
    public readonly description: string | null,
    public readonly data: UserArtifactData,
    public readonly tags: string[],
    public readonly isFavorite: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    id: string,
    userId: string,
    productName: string,
    type: ArtifactType,
    title: string,
    data: UserArtifactData,
    productId?: string | null,
    description?: string | null,
    tags?: string[],
    isFavorite: boolean = false
  ): UserArtifact {
    return new UserArtifact(
      id,
      userId,
      productId || null,
      productName,
      type,
      title,
      description || null,
      data,
      tags || [],
      isFavorite,
      new Date(),
      new Date()
    )
  }

  static fromPersistence(data: {
    id: string
    userId: string
    productId: string | null
    productName: string
    type: string
    title: string
    description: string | null
    data: unknown
    tags: string[]
    isFavorite: boolean
    createdAt: Date
    updatedAt: Date
  }): UserArtifact {
    return new UserArtifact(
      data.id,
      data.userId,
      data.productId,
      data.productName,
      data.type as ArtifactType,
      data.title,
      data.description,
      data.data as UserArtifactData,
      data.tags,
      data.isFavorite,
      data.createdAt,
      data.updatedAt
    )
  }

  markAsFavorite(): UserArtifact {
    return new UserArtifact(
      this.id,
      this.userId,
      this.productId,
      this.productName,
      this.type,
      this.title,
      this.description,
      this.data,
      this.tags,
      true,
      this.createdAt,
      new Date()
    )
  }

  unmarkAsFavorite(): UserArtifact {
    return new UserArtifact(
      this.id,
      this.userId,
      this.productId,
      this.productName,
      this.type,
      this.title,
      this.description,
      this.data,
      this.tags,
      false,
      this.createdAt,
      new Date()
    )
  }

  updateTags(newTags: string[]): UserArtifact {
    return new UserArtifact(
      this.id,
      this.userId,
      this.productId,
      this.productName,
      this.type,
      this.title,
      this.description,
      this.data,
      newTags,
      this.isFavorite,
      this.createdAt,
      new Date()
    )
  }

  updateDescription(newDescription: string): UserArtifact {
    return new UserArtifact(
      this.id,
      this.userId,
      this.productId,
      this.productName,
      this.type,
      this.title,
      newDescription,
      this.data,
      this.tags,
      this.isFavorite,
      this.createdAt,
      new Date()
    )
  }
}





