/**
 * ProtectedRoute Component Tests
 * 
 * Tests for authentication-based route protection.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute'
import { useGameStore } from '../../store/useGameStore'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.skip('should redirect to login when no token exists', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    const TestComponent = () => <div>Protected Content</div>
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })

  it.skip('should show loading state while checking authentication', () => {
    localStorageMock.getItem.mockReturnValue('valid-token')
    vi.mocked(useGameStore.getState).mockReturnValue({
      dashboard: null,
      isDemo: false,
      fetchDashboard: vi.fn(),
    } as any)

    const TestComponent = () => <div>Protected Content</div>
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it.skip('should render protected content when authenticated', async () => {
    localStorageMock.getItem.mockReturnValue('valid-token')
    vi.mocked(useGameStore.getState).mockReturnValue({
      dashboard: { user: { id: '1', username: 'test' } },
      isDemo: false,
      fetchDashboard: vi.fn(),
    } as any)

    const TestComponent = () => <div>Protected Content</div>
    
    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it.skip('should redirect to login when in demo mode', async () => {
    localStorageMock.getItem.mockReturnValue('token')
    vi.mocked(useGameStore.getState).mockReturnValue({
      dashboard: { user: { id: '1' } },
      isDemo: true,
      fetchDashboard: vi.fn(),
    } as any)

    const TestComponent = () => <div>Protected Content</div>
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })

  it.skip('should remove invalid token and redirect to login', async () => {
    localStorageMock.getItem.mockReturnValue('invalid-token')
    const fetchDashboard = vi.fn().mockRejectedValue(new Error('Unauthorized'))
    
    vi.mocked(useGameStore.getState).mockReturnValue({
      dashboard: null,
      isDemo: false,
      fetchDashboard,
    } as any)

    const TestComponent = () => <div>Protected Content</div>
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })
  })
})
