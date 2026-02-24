/**
 * PlaneChoice Unit Tests
 *
 * Ensures the choose-plane page shows Available Now planes and that
 * Reality Intelligence is accessible from the correct plane (Available Now).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import PlaneChoice from '../PlaneChoice'

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
    dashboard: { user: { firstName: 'Test' } },
    fetchDashboard: vi.fn(),
    isDemo: false,
  }),
}))

vi.mock('../../services/loadoutApi', () => ({
  loadoutApi: { getActiveLoadout: vi.fn().mockResolvedValue(null) },
}))

vi.mock('../../lib/logger', () => ({
  logger: { error: vi.fn() },
}))

function renderPlaneChoice() {
  return render(
    <MemoryRouter>
      <PlaneChoice />
    </MemoryRouter>
  )
}

describe('PlaneChoice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'test-token')
  })

  it('shows Available Now section with Systems and Artifacts', () => {
    renderPlaneChoice()
    expect(screen.getByRole('heading', { name: 'Available Now' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Systems', exact: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Artifacts' })).toBeInTheDocument()
  })

  it('shows Reality Intelligence in Available Now (correct plane)', () => {
    renderPlaneChoice()
    const heading = screen.getByRole('heading', { name: 'Reality Intelligence' })
    expect(heading).toBeInTheDocument()
    // Card is in Available Now (same section as Systems, Artifacts) — ensure it has the Analyse badge
    expect(screen.getByText('Analyse')).toBeInTheDocument()
    expect(screen.getByText(/constraints of life/i)).toBeInTheDocument()
  })

  it('Reality Intelligence card navigates to /reality-intelligence when clicked', async () => {
    renderPlaneChoice()

    const rieCard = screen.getByRole('heading', { name: 'Reality Intelligence' }).closest('div[class*="cursor-pointer"]')
    expect(rieCard).toBeInTheDocument()
    await userEvent.click(rieCard!)

    expect(mockNavigate).toHaveBeenCalledWith('/reality-intelligence')
  })
})
