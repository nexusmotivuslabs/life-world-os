'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'

export default function ContentManagementPage() {
  const { isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/')
    }
  }, [isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link
              href="/admin"
              className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
            >
              ← Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Content Management</h1>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Content files are stored in the{' '}
            <code className="bg-yellow-100 px-2 py-1 rounded">content/</code>{' '}
            directory. To manage files, edit them directly in the file system or
            use the Notion integration to sync content.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Content Directories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ContentDirectoryCard
                title="00. Principles"
                path="/00-principles"
                description="Core development principles"
              />
              <ContentDirectoryCard
                title="10. Developer Contracts"
                path="/10-developer-contracts"
                description="Agreements and responsibilities"
              />
              <ContentDirectoryCard
                title="20. Workflows"
                path="/20-workflows"
                description="Development workflows"
              />
              <ContentDirectoryCard
                title="30. Tooling"
                path="/30-tooling"
                description="Development tools"
              />
              <ContentDirectoryCard
                title="40. Reference"
                path="/40-reference"
                description="Architecture and reference"
              />
              <ContentDirectoryCard
                title="Domains"
                path="/domains"
                description="Domain-specific documentation"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContentDirectoryCard({
  title,
  path,
  description,
}: {
  title: string
  path: string
  description: string
}) {
  return (
    <Link href={path}>
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-blue-600 mt-2">View content →</p>
      </div>
    </Link>
  )
}
