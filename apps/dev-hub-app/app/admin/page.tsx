'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminDashboard() {
  const { user, isAdmin, isLoading } = useAuth()
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
    return null // Will redirect
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Manage dev hub content and settings
            </p>
          </div>
          <div className="text-sm text-gray-600">
            Logged in as: <span className="font-semibold">{user?.email}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminCard
          title="Notion Integration"
          description="Manage Notion pages and sync content to dev hub"
          href="/admin/notion"
          icon="📝"
        />
        <AdminCard
          title="Content Management"
          description="View and manage dev hub content files"
          href="/admin/content"
          icon="📚"
        />
        <AdminCard
          title="Settings"
          description="Configure dev hub settings and preferences"
          href="/admin/settings"
          icon="⚙️"
        />
      </div>
    </div>
  )
}

function AdminCard({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: string
}) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  )
}
