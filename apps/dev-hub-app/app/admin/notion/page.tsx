'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

interface NotionPage {
  id: string
  title: string
  slug?: string
  category?: string
  url: string
  lastEdited: string
  created: string
}

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

export default function NotionAdminPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading, token } = useAuth()
  const [notionPages, setNotionPages] = useState<NotionPage[]>([])
  const [activePages, setActivePages] = useState<ActivePage[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/')
      return
    }

    if (isAdmin && token) {
      loadData()
    }
  }, [isAdmin, isLoading, token, router])

  const loadData = async () => {
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      // Fetch Notion pages
      const pagesRes = await fetch('/api/notion/pages', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!pagesRes.ok) {
        const errorData = await pagesRes.json()
        throw new Error(errorData.error || 'Failed to fetch Notion pages')
      }

      const pagesData = await pagesRes.json()
      setNotionPages(pagesData.pages || [])

      // Fetch active pages
      const activeRes = await fetch('/api/notion/active', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (activeRes.ok) {
        const activeData = await activeRes.json()
        setActivePages(activeData.pages || [])

        // Pre-select active pages
        const activeIds = new Set(
          activeData.pages
            .filter((p: ActivePage) => p.active)
            .map((p: ActivePage) => p.id)
        )
        setSelectedIds(activeIds)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Error loading data')
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (pageId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(pageId)) {
      newSelected.delete(pageId)
    } else {
      newSelected.add(pageId)
    }
    setSelectedIds(newSelected)
  }

  const saveSelection = async () => {
    if (!token) return

    setLoading(true)
    setError(null)
    try {
      const pagesToSave = notionPages
        .filter(p => selectedIds.has(p.id))
        .map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug || generateSlug(p.title),
          category: p.category,
          notionUrl: p.url,
          active: true,
        }))

      const res = await fetch('/api/notion/active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ pages: pagesToSave }),
      })

      if (res.ok) {
        alert('Selection saved successfully!')
        loadData()
      } else {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save selection')
      }
    } catch (err) {
      console.error('Error saving selection:', err)
      setError(err instanceof Error ? err.message : 'Error saving selection')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!token) return

    const activeCount = activePages.filter(p => p.active).length
    if (activeCount === 0) {
      alert('No active pages to import. Please select pages first.')
      return
    }

    if (!confirm(`Import ${activeCount} active pages?`)) {
      return
    }

    setImporting(true)
    setImportResult(null)
    setError(null)

    try {
      const res = await fetch('/api/notion/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await res.json()

      if (res.ok) {
        setImportResult(
          `✅ Successfully imported ${result.imported} pages${
            result.errors > 0 ? ` (${result.errors} errors)` : ''
          }`
        )
        if (result.errorDetails && result.errorDetails.length > 0) {
          console.error('Import errors:', result.errorDetails)
        }
        loadData()
      } else {
        throw new Error(result.error || 'Import failed')
      }
    } catch (err) {
      setImportResult(
        `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setImporting(false)
    }
  }

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link
              href="/admin"
              className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
            >
              ← Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Notion Page Manager</h1>
          </div>
        </div>

        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh Pages'}
          </button>
          <button
            onClick={saveSelection}
            disabled={loading || selectedIds.size === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Save Selection ({selectedIds.size})
          </button>
          <button
            onClick={handleImport}
            disabled={importing || activePages.filter(p => p.active).length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {importing
              ? 'Importing...'
              : `Import Active (${activePages.filter(p => p.active).length})`}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {importResult && (
          <div
            className={`mb-4 p-4 rounded-lg border ${
              importResult.startsWith('✅')
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {importResult}
          </div>
        )}

        <div className="mb-4 text-sm text-gray-600">
          <p>
            Active Pages: {activePages.filter(p => p.active).length} | Total
            Notion Pages: {notionPages.length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <h2 className="text-2xl font-semibold mb-4">Notion Pages</h2>

        {loading && notionPages.length === 0 ? (
          <div className="text-center py-8">Loading pages...</div>
        ) : notionPages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pages found. Make sure NOTION_API_KEY and NOTION_DATABASE_ID are
            configured.
          </div>
        ) : (
          <div className="space-y-2">
            {notionPages.map((page) => {
              const isSelected = selectedIds.has(page.id)
              const isActive = activePages.some(
                (p) => p.id === page.id && p.active
              )

              return (
                <div
                  key={page.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50 border-gray-200'
                  } ${isActive ? 'ring-2 ring-green-300' : ''}`}
                  onClick={() => toggleSelection(page.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelection(page.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1"
                        />
                        <h3 className="font-semibold">{page.title}</h3>
                        {isActive && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-600 space-x-4">
                        {page.category && (
                          <span>Category: {page.category}</span>
                        )}
                        {page.slug && <span>Slug: {page.slug}</span>}
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-blue-600 hover:underline"
                        >
                          View in Notion →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
