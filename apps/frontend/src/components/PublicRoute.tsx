/**
 * Public Route Component
 * 
 * Wraps routes that should only be accessible when NOT authenticated.
 * Redirects authenticated users to /choose-plane.
 */

import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useGameStore } from '../store/useGameStore'

interface PublicRouteProps {
  children: React.ReactNode
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { fetchDashboard, dashboard, isDemo } = useGameStore()
  const [isChecking, setIsChecking] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    const checkAuth = async () => {
      // If no token, user is not authenticated - allow access
      if (!token) {
        setIsChecking(false)
        return
      }

      // If we have a token, validate it by fetching dashboard
      if (token && !dashboard && !isDemo) {
        try {
          await fetchDashboard()
          const currentState = useGameStore.getState()
          // If fetch succeeded and not in demo mode, user is authenticated
          if (!currentState.isDemo && currentState.dashboard) {
            setIsChecking(false)
            return
          }
        } catch (error) {
          // Token is invalid - allow access to public route
          localStorage.removeItem('token')
          setIsChecking(false)
          return
        }
      }
      
      setIsChecking(false)
    }

    checkAuth()
  }, [token, dashboard, isDemo, fetchDashboard])

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // If authenticated (has valid token and dashboard), redirect to choose-plane
  if (token && !isDemo && dashboard) {
    return <Navigate to="/choose-plane" replace />
  }

  // User is not authenticated, render the public content
  return <>{children}</>
}
