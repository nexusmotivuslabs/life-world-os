/**
 * LocationDescription Value Object
 * 
 * Value object for location descriptions with validation.
 */

export class LocationDescription {
  private constructor(
    public readonly value: string
  ) {
    if (!value || value.trim().length === 0) {
      throw new Error('Location description cannot be empty')
    }

    if (value.length > 5000) {
      throw new Error('Location description cannot exceed 5000 characters')
    }
  }

  static create(value: string): LocationDescription {
    return new LocationDescription(value.trim())
  }

  static fromPersistence(value: string | null): LocationDescription | null {
    if (!value) return null
    return new LocationDescription(value)
  }

  isEmpty(): boolean {
    return this.value.trim().length === 0
  }

  getWordCount(): number {
    return this.value.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  extractKeywords(): string[] {
    // Simple keyword extraction - remove common words
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'])
    const words = this.value.toLowerCase().split(/\s+/)
    return words
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 10) // Limit to top 10 keywords
  }
}


