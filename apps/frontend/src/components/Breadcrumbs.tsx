/**
 * Breadcrumbs Component
 * 
 * Displays navigation breadcrumb trail as a chain with highlighting
 * Every page highlights its position in the breadcrumb chain
 */

import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useNavigation } from '../hooks/useNavigation'

export default function Breadcrumbs() {
  const { breadcrumbs } = useNavigation()
  const location = useLocation()

  // Always show breadcrumbs, even if only one item (current page)
  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <nav 
      className="flex items-center flex-wrap gap-1 mb-6 px-4 py-3 bg-gray-800/50 rounded-lg border border-gray-700/50" 
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1
        // Only highlight exact path match OR if it's the last breadcrumb and current path starts with it (for nested routes)
        // BUT: Prevent '/' from matching everything - require exact match for root
        const isActive = location.pathname === crumb.path || 
                        (isLast && crumb.path !== '/' && location.pathname.startsWith(crumb.path))
        const Icon = crumb.icon
        
        // Home should always be clickable, even when active
        const isHome = crumb.path === '/'
        const shouldBeLink = !isActive || isHome

        return (
          <div key={crumb.path || index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-gray-500 flex-shrink-0" />
            )}
            {shouldBeLink ? (
              <Link
                to={crumb.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 border border-blue-500/50 hover:bg-blue-700'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                <span>{crumb.label}</span>
              </Link>
            ) : (
              <span 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all bg-blue-600 text-white shadow-lg shadow-blue-600/20 border border-blue-500/50"
              >
                {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                <span>{crumb.label}</span>
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}

