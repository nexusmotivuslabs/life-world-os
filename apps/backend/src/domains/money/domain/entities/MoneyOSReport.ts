/**
 * MoneyOSReport Domain Entity
 * 
 * Represents a Money OS intelligence report.
 * Reports explain behavior, not recommend action.
 * Pure business logic entity - no infrastructure dependencies.
 */

export interface ReportSection {
  title: string
  content: string
  order: number
}

export enum ReportType {
  OVERVIEW = 'OVERVIEW',
  FIXED_INCOME_INTELLIGENCE = 'FIXED_INCOME_INTELLIGENCE',
  GROWTH_VS_INCOME = 'GROWTH_VS_INCOME',
  INFLATION_PURCHASING_POWER = 'INFLATION_PURCHASING_POWER',
  SCENARIO_RESPONSE = 'SCENARIO_RESPONSE',
}

export class MoneyOSReport {
  private constructor(
    public readonly id: string,
    public readonly type: ReportType,
    public readonly title: string,
    public readonly executiveSummary: string,
    public readonly sections: ReportSection[],
    public readonly keyTakeaways: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    // Validate executive summary (one page, plain language)
    if (!executiveSummary || executiveSummary.trim().length === 0) {
      throw new Error('Executive summary cannot be empty')
    }

    // Validate key takeaways (3-5 decision insights)
    if (keyTakeaways.length < 3 || keyTakeaways.length > 5) {
      throw new Error('Key takeaways must be between 3 and 5 items')
    }

    // Validate sections have required structure
    const requiredSections = ['System Context', 'Pillar Impact Table', 'Trade-Offs', 'Failure Modes']
    const sectionTitles = sections.map((s) => s.title)
    const hasRequiredSections = requiredSections.every((required) =>
      sectionTitles.some((title) => title.includes(required))
    )

    if (!hasRequiredSections) {
      throw new Error(`Report must include sections: ${requiredSections.join(', ')}`)
    }
  }

  /**
   * Create a new MoneyOSReport entity
   */
  static create(
    id: string,
    type: ReportType,
    title: string,
    executiveSummary: string,
    sections: ReportSection[],
    keyTakeaways: string[]
  ): MoneyOSReport {
    if (!id || id.trim().length === 0) {
      throw new Error('Report ID cannot be empty')
    }

    if (!title || title.trim().length === 0) {
      throw new Error('Report title cannot be empty')
    }

    const now = new Date()

    return new MoneyOSReport(
      id,
      type,
      title,
      executiveSummary,
      sections,
      keyTakeaways,
      now,
      now
    )
  }

  /**
   * Create MoneyOSReport from persisted data
   */
  static fromPersistence(data: {
    id: string
    type: ReportType
    title: string
    executiveSummary: string
    sections: ReportSection[]
    keyTakeaways: string[]
    createdAt: Date
    updatedAt: Date
  }): MoneyOSReport {
    return new MoneyOSReport(
      data.id,
      data.type,
      data.title,
      data.executiveSummary,
      data.sections,
      data.keyTakeaways,
      data.createdAt,
      data.updatedAt
    )
  }

  /**
   * Get report preview (first section or executive summary)
   */
  getPreview(maxLength: number = 500): string {
    if (this.executiveSummary.length <= maxLength) {
      return this.executiveSummary
    }

    return this.executiveSummary.substring(0, maxLength) + '...'
  }

  /**
   * Get section by title
   */
  getSection(title: string): ReportSection | null {
    return this.sections.find((section) => section.title === title) ?? null
  }

  /**
   * Check if report explains behavior (not just recommends action)
   */
  explainsBehavior(): boolean {
    // Reports must explain what is happening, why it happens, and what breaks
    const behaviorKeywords = ['explains', 'behaves', 'responds', 'fails', 'breaks', 'why', 'how']
    const content = this.executiveSummary + ' ' + this.sections.map((s) => s.content).join(' ')

    return behaviorKeywords.some((keyword) => content.toLowerCase().includes(keyword))
  }
}


