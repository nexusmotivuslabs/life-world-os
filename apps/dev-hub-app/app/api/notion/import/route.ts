import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { NotionToMarkdown } from 'notion-to-md'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const n2m = new NotionToMarkdown({ notionClient: notion })

const ACTIVE_PAGES_FILE = join(process.cwd(), 'data', 'active-pages.json')

function getContentPath(category?: string): string {
  const contentDir = join(process.cwd(), 'content')

  if (!category) return contentDir

  const categoryMap: Record<string, string> = {
    principle: '00-principles',
    contract: '10-developer-contracts',
    workflow: '20-workflows',
    tooling: '30-tooling',
    tool: '30-tooling',
    reference: '40-reference',
    architecture: '40-reference',
    adr: '40-reference',
    domain: 'domains',
  }

  const lowerCategory = category.toLowerCase()
  const dir = Object.keys(categoryMap).find((key) =>
    lowerCategory.includes(key)
  )

  return dir ? join(contentDir, categoryMap[dir]) : contentDir
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = authHeader.substring(7)
  const { verifyToken } = await import('@/lib/auth')
  const decoded = verifyToken(token)

  if (!decoded || decoded.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    // Read active pages
    const activePagesContent = await readFile(ACTIVE_PAGES_FILE, 'utf8')
    const { pages } = JSON.parse(activePagesContent)

    const activePages = pages.filter((p: any) => p.active)

    if (activePages.length === 0) {
      return NextResponse.json(
        { error: 'No active pages to import' },
        { status: 400 }
      )
    }

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []
    const updatedPages: any[] = []

    for (const page of activePages) {
      try {
        // Convert Notion page to markdown
        const mdBlocks = await n2m.pageToMarkdown(page.id)
        const markdown = n2m.toMarkdownString(mdBlocks)

        // Determine file path
        const contentPath = getContentPath(page.category)
        await mkdir(contentPath, { recursive: true })

        const slug = page.slug || generateSlug(page.title)
        const filename = slug.endsWith('.md') ? slug : `${slug}.md`
        const filePath = join(contentPath, filename)

        // Create frontmatter
        const frontmatter = `---
title: "${page.title}"
source: notion
importedAt: ${new Date().toISOString()}
${page.category ? `category: "${page.category}"` : ''}
${page.notionUrl ? `notionUrl: "${page.notionUrl}"` : ''}
---

`

        // Write file
        await writeFile(filePath, frontmatter + markdown.parent, 'utf8')

        // Update lastSynced
        const updatedPage = {
          ...page,
          lastSynced: new Date().toISOString(),
        }
        updatedPages.push(updatedPage)
        successCount++
      } catch (error) {
        errorCount++
        errors.push(
          `${page.title}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    // Update active pages file with new lastSynced timestamps
    const updatedData = {
      pages: pages.map((p: any) => {
        const updated = updatedPages.find((up) => up.id === p.id)
        return updated || p
      }),
      lastUpdated: new Date().toISOString(),
    }
    await writeFile(
      ACTIVE_PAGES_FILE,
      JSON.stringify(updatedData, null, 2),
      'utf8'
    )

    return NextResponse.json({
      success: true,
      imported: successCount,
      errors: errorCount,
      errorDetails: errors,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

