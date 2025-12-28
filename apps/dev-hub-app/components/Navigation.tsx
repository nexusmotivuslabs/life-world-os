'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export function Navigation() {
  const { user, logout, isAdmin, isPaid } = useAuth()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Developer Hub
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <Link href="/00-principles" className="text-gray-600 hover:text-gray-900">
              Principles
            </Link>
            <Link href="/10-developer-contracts" className="text-gray-600 hover:text-gray-900">
              Contracts
            </Link>
            <Link href="/20-workflows" className="text-gray-600 hover:text-gray-900">
              Workflows
            </Link>
            <Link href="/30-tooling" className="text-gray-600 hover:text-gray-900">
              Tooling
            </Link>
            <Link href="/40-reference" className="text-gray-600 hover:text-gray-900">
              Reference
            </Link>
            <Link href="/domains" className="text-gray-600 hover:text-gray-900">
              Domains
            </Link>
            
            {/* Blog - Only for paid users */}
            {isPaid && (
              <Link href="/blog" className="text-gray-600 hover:text-gray-900">
                Blog
              </Link>
            )}

            {/* Admin - Only for admins */}
            {isAdmin && (
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 border-l border-gray-300 pl-6">
                Admin
              </Link>
            )}

            {/* Auth buttons */}
            <div className="border-l border-gray-300 pl-6">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {user.name || user.email}
                    {user.role !== 'regular' && (
                      <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {user.role}
                      </span>
                    )}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
