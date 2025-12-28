'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'

export default function SettingsPage() {
  const { isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/')
    }
  }, [isAdmin, isLoading, router])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link
              href="/admin"
              className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
            >
              ← Back to Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Notion Integration</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  NOTION_API_KEY
                </label>
                <input
                  type="text"
                  value={process.env.NEXT_PUBLIC_NOTION_API_KEY ? '***configured***' : 'Not configured'}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Configure in .env.local file
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  NOTION_DATABASE_ID
                </label>
                <input
                  type="text"
                  value={process.env.NEXT_PUBLIC_NOTION_DATABASE_ID ? '***configured***' : 'Not configured'}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Configure in .env.local file
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  JWT Secret
                </label>
                <input
                  type="text"
                  value={process.env.NEXT_PUBLIC_JWT_SECRET ? '***configured***' : 'Not configured'}
                  disabled
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Configure JWT_SECRET in .env.local file
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Settings are configured via environment
              variables. Edit the <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code> file
              to change these settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
