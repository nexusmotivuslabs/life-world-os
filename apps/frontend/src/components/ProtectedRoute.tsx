/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication.
 * Redirects to login if user is not authenticated.
 */

import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useGameStore } from '../store/useGameStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { fetchDashboard, dashboard, isDemo } = useGameStore()
  const [isChecking, setIsChecking] = useState(true)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    let cancelled = false

    const checkAuth = async () => {
      if (!token) {
        if (!cancelled) setIsChecking(false)
        return
      }

      // Already have dashboard – stop checking quickly
      if (token && dashboard && !isDemo) {
        if (!cancelled) setIsChecking(false)
        return
      }

      if (token && !dashboard) {
        try {
          const timeoutMs = 8000
          await Promise.race([
            fetchDashboard(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Auth check timeout')), timeoutMs)
            ),
          ])
          if (cancelled) return
          const currentState = useGameStore.getState()
          if (currentState.isDemo) {
            localStorage.removeItem('token')
            if (!cancelled) setIsChecking(false)
            return
          }
        } catch (error) {
          console.error('Failed to fetch dashboard:', error)
          localStorage.removeItem('token')
          if (!cancelled) setIsChecking(false)
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

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // If in demo mode (token was invalid), redirect to login
  if (isDemo) {
    return <Navigate to="/login" replace />
  }

  // If we have a token but dashboard fetch failed or no dashboard, redirect to login
  if (token && !dashboard) {
    return <Navigate to="/login" replace />
  }

  // User is authenticated, render the protected content
  return <>{children}</>
}
