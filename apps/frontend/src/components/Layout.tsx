/**
 * Layout Component
 * 
 * Shared layout wrapper for authenticated pages.
 * Provides breadcrumb navigation and consistent header.
 */

import { ReactNode } from 'react'
import Breadcrumbs from './Breadcrumbs'
import Header from './Header'
import { useSystemHealth } from '../hooks/useSystemHealth'

interface LayoutProps {
  children: ReactNode
  showHeader?: boolean
  showBreadcrumbs?: boolean
}

export default function Layout({ children, showHeader = true, showBreadcrumbs = true }: LayoutProps) {
  // Initialize system health monitoring
  useSystemHealth(true)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {showHeader && <Header />}
      
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          {showBreadcrumbs && <Breadcrumbs />}
          {children}
        </div>
      </main>
    </div>
  )
}

