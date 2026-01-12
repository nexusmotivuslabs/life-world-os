/**
 * GetMoneyOSReportUseCase
 * 
 * Use case for retrieving a Money OS report.
 * Reports are retrieved from knowledge articles.
 */

import { MoneyOSReport, ReportType } from '../../domain/entities/MoneyOSReport'
import { KnowledgeBasePort } from '../../application/ports/KnowledgeBasePort'

export interface GetMoneyOSReportRequest {
  reportId: string
}

export class GetMoneyOSReportUseCase {
  constructor(private knowledgeBase: KnowledgeBasePort) {}

  async execute(request: GetMoneyOSReportRequest): Promise<MoneyOSReport | null> {
    // Retrieve from knowledge base
    const article = await this.knowledgeBase.findArticleById(request.reportId)

    if (!article) {
      return null
    }

    // Parse report from article content
    return this.parseReportFromContent(article.content, article.metadata)
  }

  /**
   * Parse report from knowledge article content
   */
  private parseReportFromContent(
    content: string,
    metadata: Record<string, unknown>
  ): MoneyOSReport {
    // Extract sections from markdown content
    const sections: Array<{ title: string; content: string; order: number }> = []
    const lines = content.split('\n')
    let currentSection: { title: string; content: string; order: number } | null = null
    let order = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check for section header (##)
      if (line.startsWith('## ') && !line.startsWith('###')) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection)
        }

        // Start new section
        const title = line.substring(3).trim()
        currentSection = {
          title,
          content: '',
          order: order++,
        }
      } else if (currentSection && line.trim() !== '') {
        // Add to current section content
        currentSection.content += line + '\n'
      }
    }

    // Save last section
    if (currentSection) {
      sections.push(currentSection)
    }

    // Extract executive summary (first section after title)
    const executiveSummarySection = sections.find((s) => s.title === 'Executive Summary')
    const executiveSummary = executiveSummarySection?.content.trim() || ''

    // Extract key takeaways
    const keyTakeawaysSection = sections.find((s) => s.title === 'Key Takeaways')
    const keyTakeaways: string[] = []
    if (keyTakeawaysSection) {
      const takeawayLines = keyTakeawaysSection.content.split('\n')
      takeawayLines.forEach((line) => {
        const match = line.match(/^\d+\.\s*(.+)$/)
        if (match) {
          keyTakeaways.push(match[1].trim())
        }
      })
    }

    // Get report type from metadata
    const reportType = (metadata.reportType as ReportType) || ReportType.OVERVIEW
    const title = (metadata.title as string) || 'Money OS Report'

    // Create report entity
    return MoneyOSReport.fromPersistence({
      id: (metadata.reportId as string) || 'unknown',
      type: reportType,
      title,
      executiveSummary,
      sections: sections.filter((s) => s.title !== 'Executive Summary' && s.title !== 'Key Takeaways'),
      keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : (metadata.keyTakeaways as string[]) || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }
}





