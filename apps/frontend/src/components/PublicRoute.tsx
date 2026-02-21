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
    let cancelled = false

    const checkAuth = async () => {
      // If no token, user is not authenticated - allow access
      if (!token) {
        if (!cancelled) setIsChecking(false)
        return
      }

      // If we already have dashboard (e.g. from previous load), stop checking quickly
      if (token && dashboard && !isDemo) {
        if (!cancelled) setIsChecking(false)
        return
      }

      // If we have a token, validate it by fetching dashboard
      if (token && !dashboard && !isDemo) {
        try {
          // Don't hang forever if backend is down: race with a timeout
          const timeoutMs = 8000
          await Promise.race([
            fetchDashboard(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Auth check timeout')), timeoutMs)
            ),
          ])
          if (cancelled) return
          const currentState = useGameStore.getState()
          if (!currentState.isDemo && currentState.dashboard) {
            setIsChecking(false)
            return
          }
        } catch (error) {
          // Token invalid or timeout - allow access to public route
          if (!cancelled) {
            localStorage.removeItem('token')
            setIsChecking(false)
          }
          return
        }
      }

      if (!cancelled) setIsChecking(false)
    }

    checkAuth()
    return () => {
      cancelled = true
    }
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
