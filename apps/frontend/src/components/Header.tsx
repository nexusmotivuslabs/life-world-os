/**
 * Header Component
 * 
 * Consistent header across all pages (root to all).
 * Shows "Life World OS" link, login/logout/signup buttons, and user greeting.
 */

import { Link } from 'react-router-dom'
import { Settings, LogOut, LogIn, UserPlus } from 'lucide-react'
import { useGameStore } from '../store/useGameStore'
import { routes } from '../config/routes'
import { useEffect, useState } from 'react'
import BlogDropdown from './BlogDropdown'
import BlogModal from './BlogModal'

export default function Header() {
  const { isDemo, dashboard, fetchDashboard } = useGameStore()
  const [selectedBlogSlug, setSelectedBlogSlug] = useState<string | null>(null)
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false)
  
  // Check if user is authenticated
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const isAuthenticated = !isDemo && token && dashboard
  
  // Get display name - priority: firstName > username > email
  const displayName = dashboard?.user.firstName || dashboard?.user.username || dashboard?.user.email || ''
  
  // Fetch dashboard on mount if token exists
  useEffect(() => {
    if (token && !dashboard && !isDemo) {
      fetchDashboard()
    }
  }, [token, dashboard, isDemo, fetchDashboard])

  const handleLogout = () => {
    localStorage.removeItem('token')
    // Clear any cached dashboard data
    useGameStore.setState({ dashboard: null, isDemo: false })
    // Use window.location to ensure full page reload and clear state
    window.location.href = '/login'
  }

  const handleBlogPostSelect = (slug: string) => {
    setSelectedBlogSlug(slug)
    setIsBlogModalOpen(true)
  }

  const handleCloseBlogModal = () => {
    setIsBlogModalOpen(false)
    setSelectedBlogSlug(null)
  }

  return (
    <header className="border-b border-gray-800 bg-gray-900/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              to={isAuthenticated ? "/choose-plane" : routes.home.path}
              className="text-2xl font-bold hover:text-blue-400 transition-colors"
            >
              Life World OS
            </Link>
            {isAuthenticated && displayName && (
              <p className="text-gray-400 text-sm">
                Hello {displayName}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && token && !isDemo && dashboard ? (
              <>
                <BlogDropdown onPostSelect={handleBlogPostSelect} />
                <Link
                  to={routes.configuration.path}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm font-medium flex items-center gap-2 transition-colors"
                  title="Settings & Configuration"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                {dashboard?.user.isAdmin && (
                  <Link
                    to={routes.admin.path}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to={routes.login.path}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to={routes.register.path}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>
          
          {/* Blog Modal - only show when authenticated */}
          {isAuthenticated && token && !isDemo && dashboard && (
            <BlogModal
              slug={selectedBlogSlug}
              isOpen={isBlogModalOpen}
              onClose={handleCloseBlogModal}
            />
          )}
        </div>
      </div>
    </header>
  )
}

