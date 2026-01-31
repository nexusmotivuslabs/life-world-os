/**
 * Header Component Tests
 *
 * Verifies Blog button navigates to /blogs, auth state renders correctly.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import Header from '../Header'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../store/useGameStore', () => ({
  useGameStore: () => ({
    isDemo: false,
    dashboard: { user: { firstName: 'Test', lastName: 'User', isAdmin: false } },
    fetchDashboard: vi.fn(),
  }),
}))

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  )
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'test-token')
  })

  afterEach(() => {
    localStorage.removeItem('token')
  })

  it('renders Blog button when authenticated', () => {
    renderHeader()
    const blogButton = screen.getByRole('button', { name: /go to blog/i })
    expect(blogButton).toBeInTheDocument()
    expect(blogButton).toHaveTextContent('Blog')
  })

  it('navigates to /blogs when Blog button is clicked', async () => {
    const user = userEvent.setup()
    renderHeader()
    const blogButton = screen.getByRole('button', { name: /go to blog/i })
    await user.click(blogButton)
    expect(mockNavigate).toHaveBeenCalledWith('/blogs')
  })

  it('renders Life World OS link', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: /life world os/i })).toBeInTheDocument()
  })
})
