/**
 * CreateMoneyOSReportUseCase
 * 
 * Use case for creating a new Money OS report.
 * Reports are stored as KnowledgeArticles for searchability.
 */

import { MoneyOSReport, ReportType } from '../../domain/entities/MoneyOSReport'
import { KnowledgeBasePort } from '../../application/ports/KnowledgeBasePort'
import { TeamRepositoryPort } from '../../application/ports/TeamRepositoryPort'

export interface CreateMoneyOSReportRequest {
  type: ReportType
  title: string
  executiveSummary: string
  sections: Array<{
    title: string
    content: string
    order: number
  }>
  keyTakeaways: string[]
  teamId: string
}

export class CreateMoneyOSReportUseCase {
  constructor(
    private knowledgeBase: KnowledgeBasePort,
    private teamRepository: TeamRepositoryPort
  ) {}

  async execute(request: CreateMoneyOSReportRequest): Promise<MoneyOSReport> {
    // Validate team exists
    const team = await this.teamRepository.findById(request.teamId)
    if (!team) {
      throw new Error(`Team with ID ${request.teamId} not found`)
    }

    // Create report entity
    const reportId = `report-${request.type.toLowerCase()}-${Date.now()}`
    const report = MoneyOSReport.create(
      reportId,
      request.type,
      request.title,
      request.executiveSummary,
      request.sections,
      request.keyTakeaways
    )

    // Validate report explains behavior
    if (!report.explainsBehavior()) {
      throw new Error('Report must explain behavior, not just recommend action')
    }

    // Convert report to knowledge article content
    const content = this.formatReportAsContent(report)

    // Store as knowledge article (vector-embedded for searchability)
    await this.knowledgeBase.createArticle({
      id: reportId,
      teamId: request.teamId,
      title: report.title,
      content,
      metadata: {
        reportType: request.type,
        reportId: report.id,
        keyTakeaways: report.keyTakeaways,
      },
    })

    return report
  }

  /**
   * Format report as content for knowledge article
   */
  private formatReportAsContent(report: MoneyOSReport): string {
    let content = `# ${report.title}\n\n`
    content += `## Executive Summary\n\n${report.executiveSummary}\n\n`

    // Sort sections by order
    const sortedSections = [...report.sections].sort((a, b) => a.order - b.order)

    sortedSections.forEach((section) => {
      content += `## ${section.title}\n\n${section.content}\n\n`
    })

    content += `## Key Takeaways\n\n`
    report.keyTakeaways.forEach((takeaway, index) => {
      content += `${index + 1}. ${takeaway}\n`
    })

    return content
  }
}


