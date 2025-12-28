import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function GET(request: NextRequest) {
  // Check authentication and admin role
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

  if (!process.env.NOTION_DATABASE_ID) {
    return NextResponse.json(
      { error: 'NOTION_DATABASE_ID not configured' },
      { status: 500 }
    )
  }

  if (!process.env.NOTION_API_KEY) {
    return NextResponse.json(
      { error: 'NOTION_API_KEY not configured' },
      { status: 500 }
    )
  }

  try {
    let allPages: any[] = []
    let cursor: string | undefined = undefined

    do {
      const response = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID!,
        start_cursor: cursor,
        page_size: 100,
      })

      allPages = [...allPages, ...response.results]
      cursor = response.next_cursor || undefined
    } while (cursor)

    // Format pages for UI
    const formattedPages = allPages.map((page: any) => {
      const props = page.properties || {}
      return {
        id: page.id,
        title:
          props.Title?.title?.[0]?.plain_text ||
          props.Name?.title?.[0]?.plain_text ||
          'Untitled',
        slug: props.Slug?.rich_text?.[0]?.plain_text,
        category:
          props.Category?.select?.name ||
          props.Type?.select?.name ||
          props.category?.select?.name,
        url: page.url,
        lastEdited: page.last_edited_time,
        created: page.created_time,
      }
    })

    return NextResponse.json({ pages: formattedPages })
  } catch (error) {
    console.error('Error fetching Notion pages:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unknown error',
        details: error,
      },
      { status: 500 }
    )
  }
}

