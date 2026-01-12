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
    const checkAuth = async () => {
      // No token means not authenticated
      if (!token) {
        setIsChecking(false)
        return
      }

      // If we have a token but no dashboard, try to fetch it
      // This validates the token is still valid
      if (token && !dashboard) {
        try {
          await fetchDashboard()
          // If fetchDashboard succeeds but sets isDemo, that means token was invalid
          // and it fell back to demo mode - we should redirect
          const currentState = useGameStore.getState()
          if (currentState.isDemo) {
            // Token was invalid, remove it
            localStorage.removeItem('token')
            setIsChecking(false)
            return
          }
        } catch (error) {
          // If fetch fails, token might be invalid
          console.error('Failed to fetch dashboard:', error)
          localStorage.removeItem('token')
          setIsChecking(false)
          return
        }
      }
      setIsChecking(false)
    }

    checkAuth()
  }, [token, dashboard, fetchDashboard])

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
