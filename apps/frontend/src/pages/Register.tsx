import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import Header from '../components/Header'
import { useNavigation } from '../hooks/useNavigation'
import { routes } from '../config/routes'

declare global {
  interface Window {
    google: any
  }
}

export default function Register() {
  const { navigateTo } = useNavigation()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { token } = await authApi.register(email, username, password, firstName || undefined)
      localStorage.setItem('token', token)
      navigateTo('/choose-plane')
    } catch (err) {
      let errorMessage = 'Registration failed'
      
      if (err instanceof Error) {
        errorMessage = err.message
        // Handle specific error cases
        if (err.message.includes('already exists')) {
          errorMessage = 'Email or username already exists. Please use different credentials.'
        } else if (err.message.includes('Database connection')) {
          errorMessage = 'Unable to connect to server. Please try again in a moment.'
        } else if (err.message.includes('email')) {
          errorMessage = 'Please enter a valid email address.'
        } else if (err.message.includes('username')) {
          errorMessage = 'Username must be at least 3 characters long.'
        } else if (err.message.includes('password')) {
          errorMessage = 'Password must be at least 8 characters long.'
        }
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async (credential: string) => {
    setError('')
    setLoading(true)

    try {
      const { token, user, requiresFirstName } = await authApi.googleLogin(credential)
      localStorage.setItem('token', token)
      if (user) localStorage.setItem('user', JSON.stringify(user))
      if (requiresFirstName) {
        navigate('/set-first-name', { replace: true })
        return
      }
      navigate('/choose-plane', { replace: true })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google sign-in failed'
      setError(errorMessage)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return

    // Wait for Google Identity Services to load
    const initGoogleSignIn = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => {
            if (response.credential) {
              handleGoogleSignIn(response.credential)
            }
          },
        })

        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signup_with',
            width: '100%',
          }
        )
      }
    }

    // Check if Google Identity Services is already loaded
    if (window.google) {
      initGoogleSignIn()
    } else {
      // Wait for script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle)
          initGoogleSignIn()
        }
      }, 100)

      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkGoogle), 10000)
    }
  }, [googleClientId])

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg">
          <div>
            <h2 className="text-3xl font-bold text-white text-center">Create Account</h2>
            <p className="mt-2 text-gray-400 text-center">Create your account</p>
          </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">
                First Name (Optional)
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John"
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                minLength={3}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>

          {/* Divider */}
          {googleClientId && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <div ref={googleButtonRef} className="w-full flex justify-center"></div>
            </>
          )}

          <p className="text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 underline">
              Sign in
            </Link>
          </p>
        </form>
        </div>
      </div>
    </div>
  )
}

