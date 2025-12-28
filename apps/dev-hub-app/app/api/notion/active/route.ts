import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const ACTIVE_PAGES_FILE = join(process.cwd(), 'data', 'active-pages.json')

interface ActivePage {
  id: string
  title: string
  slug?: string
  category?: string
  notionUrl?: string
  selectedAt: string
  lastSynced?: string
  active: boolean
}

async function readActivePages(): Promise<{
  pages: ActivePage[]
  lastUpdated: string
}> {
  try {
    const content = await readFile(ACTIVE_PAGES_FILE, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    // File doesn't exist, return empty
    return { pages: [], lastUpdated: new Date().toISOString() }
  }
}

async function writeActivePages(data: {
  pages: ActivePage[]
  lastUpdated: string
}) {
  // Ensure directory exists
  await mkdir(join(process.cwd(), 'data'), { recursive: true })

  await writeFile(ACTIVE_PAGES_FILE, JSON.stringify(data, null, 2), 'utf8')
}

// GET: Fetch active pages
export async function GET(request: NextRequest) {
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
    const data = await readActivePages()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST: Add/update active pages
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
    const body = await request.json()
    const { pages } = body

    if (!Array.isArray(pages)) {
      return NextResponse.json(
        { error: 'Pages must be an array' },
        { status: 400 }
      )
    }

    const data = await readActivePages()

    // Update or add pages
    pages.forEach((page: ActivePage) => {
      const existingIndex = data.pages.findIndex((p) => p.id === page.id)

      if (existingIndex >= 0) {
        // Update existing
        data.pages[existingIndex] = {
          ...data.pages[existingIndex],
          ...page,
          lastSynced: page.active
            ? new Date().toISOString()
            : data.pages[existingIndex].lastSynced,
        }
      } else {
        // Add new
        data.pages.push({
          ...page,
          selectedAt: new Date().toISOString(),
          active: true,
        })
      }
    })

    // Remove pages that are no longer selected
    const selectedIds = new Set(pages.map((p: ActivePage) => p.id))
    data.pages = data.pages.map((p) => {
      if (!selectedIds.has(p.id)) {
        return { ...p, active: false }
      }
      return p
    })

    data.lastUpdated = new Date().toISOString()
    await writeActivePages(data)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove pages
export async function DELETE(request: NextRequest) {
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
    const { searchParams } = new URL(request.url)
    const pageIds = searchParams.get('ids')?.split(',') || []

    if (pageIds.length === 0) {
      return NextResponse.json(
        { error: 'No page IDs provided' },
        { status: 400 }
      )
    }

    const data = await readActivePages()
    data.pages = data.pages.filter((p) => !pageIds.includes(p.id))
    data.lastUpdated = new Date().toISOString()

    await writeActivePages(data)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

