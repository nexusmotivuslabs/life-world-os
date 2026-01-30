/**
 * Set First Name
 *
 * Shown after Google Sign-In when Google didn't provide a name and the user has none.
 * User can enter a first name, use their username, or skip.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { userApi } from '../services/api'

type User = { id: string; email: string; username: string; firstName?: string | null; lastName?: string | null }

export default function SetFirstName() {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        loadProfile()
      }
    } else {
      loadProfile()
    }
  }, [])

  const loadProfile = async () => {
    try {
      const profile = await userApi.getProfile()
      setUser(profile)
    } catch {
      setError('Could not load profile. Try signing in again.')
    }
  }

  const handleSubmit = async (e: React.FormEvent, useUsername = false, skip = false) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const value = skip ? undefined : useUsername && user?.username ? user.username : firstName.trim()
      if (value !== undefined) {
        await userApi.updateProfile({ firstName: value || undefined })
      }
      navigate('/choose-plane', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 p-8 bg-gray-800 rounded-lg border border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white text-center">Add your first name</h2>
            <p className="mt-2 text-gray-400 text-center text-sm">
              Google didn’t share a name. You can set one here, use your username, or skip.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                First name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Alex"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={100}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                disabled={loading || !firstName.trim()}
                className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition"
              >
                {loading ? 'Saving…' : 'Save first name'}
              </button>

              {user?.username && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className="w-full py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-500 disabled:opacity-50 text-gray-200 font-medium transition"
                >
                  Use my username: {user.username}
                </button>
              )}

              <button
                type="button"
                onClick={(e) => handleSubmit(e, false, true)}
                disabled={loading}
                className="w-full py-2 px-4 rounded-lg border border-gray-500 text-gray-400 hover:bg-gray-700 hover:text-gray-300 disabled:opacity-50 transition"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
