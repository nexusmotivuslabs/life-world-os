/**
 * PublicRoute Component Tests
 * 
 * Tests for public routes that redirect authenticated users.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import PublicRoute from '../PublicRoute'
import { useGameStore } from '../../store/useGameStore'

vi.mock('../../store/useGameStore', () => ({
  useGameStore: {
    getState: vi.fn(),
  },
}))

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

describe('PublicRoute', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should render public content when not authenticated', async () => {
    localStorageMock.getItem.mockReturnValue(null)
    
    const TestComponent = () => <div>Public Content</div>
    
    render(
      <MemoryRouter>
        <PublicRoute>
          <TestComponent />
        </PublicRoute>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Public Content')).toBeInTheDocument()
    })
  })

  it('should redirect authenticated users to choose-plane', async () => {
    localStorageMock.getItem.mockReturnValue('valid-token')
    vi.mocked(useGameStore.getState).mockReturnValue({
      dashboard: { user: { id: '1', username: 'test' } },
      isDemo: false,
      fetchDashboard: vi.fn(),
    } as any)

    const TestComponent = () => <div>Public Content</div>
    
    render(
      <MemoryRouter>
        <PublicRoute>
          <TestComponent />
        </PublicRoute>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Public Content')).not.toBeInTheDocument()
    })
  })

  it('should allow access when token is invalid', async () => {
    localStorageMock.getItem.mockReturnValue('invalid-token')
    const fetchDashboard = vi.fn().mockRejectedValue(new Error('Unauthorized'))
    
    vi.mocked(useGameStore.getState).mockReturnValue({
      dashboard: null,
      isDemo: false,
      fetchDashboard,
    } as any)

    const TestComponent = () => <div>Public Content</div>
    
    render(
      <MemoryRouter>
        <PublicRoute>
          <TestComponent />
        </PublicRoute>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(screen.getByText('Public Content')).toBeInTheDocument()
    })
  })

  it('should show loading state while checking authentication', () => {
    localStorageMock.getItem.mockReturnValue('token')
    vi.mocked(useGameStore.getState).mockReturnValue({
      dashboard: null,
      isDemo: false,
      fetchDashboard: vi.fn(),
    } as any)

    const TestComponent = () => <div>Public Content</div>
    
    render(
      <MemoryRouter>
        <PublicRoute>
          <TestComponent />
        </PublicRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
