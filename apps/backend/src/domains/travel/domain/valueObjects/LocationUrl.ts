/**
 * LocationUrl Value Object
 * 
 * Value object for location URLs with validation.
 */

export class LocationUrl {
  private constructor(
    public readonly value: string
  ) {
    if (!this.isValidUrl(value)) {
      throw new Error('Invalid URL format')
    }
  }

  static create(value: string): LocationUrl {
    return new LocationUrl(value.trim())
  }

  static fromPersistence(value: string | null): LocationUrl | null {
    if (!value) return null
    return new LocationUrl(value)
  }

  private isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }

  getDomain(): string {
    try {
      const urlObj = new URL(this.value)
      return urlObj.hostname
    } catch {
      return ''
    }
  }

  isSecure(): boolean {
    try {
      const urlObj = new URL(this.value)
      return urlObj.protocol === 'https:'
    } catch {
      return false
    }
  }
}





