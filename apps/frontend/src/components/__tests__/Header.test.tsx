/**
 * Header Component Tests
 * 
 * Tests for header component including firstName display and authentication checks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from '../Header'
import { useGameStore } from '../../store/useGameStore'

vi.mock('../../store/useGameStore', () => ({
  useGameStore: vi.fn(),
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

describe('Header', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('should display firstName when available', () => {
    localStorageMock.getItem.mockReturnValue('token')
    vi.mocked(useGameStore).mockReturnValue({
      isDemo: false,
      dashboard: {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'John',
          lastName: null,
        },
      },
      fetchDashboard: vi.fn(),
    } as any)

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    expect(screen.getByText(/Hello John/i)).toBeInTheDocument()
  })

  it('should display firstName and lastName when both available', () => {
    localStorageMock.getItem.mockReturnValue('token')
    vi.mocked(useGameStore).mockReturnValue({
      isDemo: false,
      dashboard: {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Smith',
        },
      },
      fetchDashboard: vi.fn(),
    } as any)

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    expect(screen.getByText(/Hello John Smith/i)).toBeInTheDocument()
  })

  it('should fallback to username when firstName not available', () => {
    localStorageMock.getItem.mockReturnValue('token')
    vi.mocked(useGameStore).mockReturnValue({
      isDemo: false,
      dashboard: {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          firstName: null,
          lastName: null,
        },
      },
      fetchDashboard: vi.fn(),
    } as any)

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    expect(screen.getByText(/Hello testuser/i)).toBeInTheDocument()
  })

  it('should fallback to email when neither firstName nor username available', () => {
    localStorageMock.getItem.mockReturnValue('token')
    vi.mocked(useGameStore).mockReturnValue({
      isDemo: false,
      dashboard: {
        user: {
          id: '1',
          username: '',
          email: 'test@example.com',
          firstName: null,
          lastName: null,
        },
      },
      fetchDashboard: vi.fn(),
    } as any)

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    expect(screen.getByText(/Hello test@example.com/i)).toBeInTheDocument()
  })

  it('should not show blog/settings buttons when not authenticated', () => {
    localStorageMock.getItem.mockReturnValue(null)
    vi.mocked(useGameStore).mockReturnValue({
      isDemo: true,
      dashboard: null,
      fetchDashboard: vi.fn(),
    } as any)

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    expect(screen.queryByText('Blog')).not.toBeInTheDocument()
    expect(screen.queryByText('Settings')).not.toBeInTheDocument()
  })

  it('should show blog/settings buttons only when authenticated', () => {
    localStorageMock.getItem.mockReturnValue('token')
    vi.mocked(useGameStore).mockReturnValue({
      isDemo: false,
      dashboard: {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'John',
          lastName: null,
        },
      },
      fetchDashboard: vi.fn(),
    } as any)

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    expect(screen.getByText('Blog')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should clear dashboard on logout', () => {
    localStorageMock.getItem.mockReturnValue('token')
    const setStateSpy = vi.fn()
    vi.mocked(useGameStore).mockReturnValue({
      isDemo: false,
      dashboard: {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'John',
          lastName: null,
        },
      },
      fetchDashboard: vi.fn(),
    } as any)

    useGameStore.setState = setStateSpy

    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )

    const logoutButton = screen.getByText('Logout')
    logoutButton.click()

    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
    expect(setStateSpy).toHaveBeenCalledWith({ dashboard: null, isDemo: false })
  })
})
