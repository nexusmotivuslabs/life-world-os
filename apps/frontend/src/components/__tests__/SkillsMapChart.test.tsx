import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SkillsMapChart from '../SkillsMapChart'
import type { SkillsMapSystemConfig } from '../../config/skillsMapConfig'

const minimalConfig: SkillsMapSystemConfig = {
  axisLabels: { x: 'System Leverage', y: 'Compounding Power' },
  skills: [
    { id: 'skill-1', label: 'Skill One', x: 8, y: 7 },
    { id: 'skill-2', label: 'Skill Two', x: 3, y: 2 },
  ],
}

describe('SkillsMapChart', () => {
  it('renders chart title', () => {
    render(
      <SkillsMapChart config={minimalConfig} onSkillClick={vi.fn()} />
    )
    expect(screen.getByText(/System Leverage × Compounding Power/)).toBeInTheDocument()
  })

  it('renders without crashing with default color', () => {
    const { container } = render(
      <SkillsMapChart config={minimalConfig} onSkillClick={vi.fn()} />
    )
    expect(container.firstChild).toBeInTheDocument()
    expect(screen.getByText(/System Leverage/)).toBeInTheDocument()
  })

  it('renders with custom color', () => {
    const { container } = render(
      <SkillsMapChart config={minimalConfig} color="text-emerald-400" onSkillClick={vi.fn()} />
    )
    expect(container.firstChild).toBeInTheDocument()
  })

  it('uses config skills count for chart data', () => {
    const configWithTen = {
      ...minimalConfig,
      skills: Array.from({ length: 10 }, (_, i) => ({
        id: `s-${i}`,
        label: `Skill ${i}`,
        x: 5,
        y: 5,
      })),
    }
    render(<SkillsMapChart config={configWithTen} onSkillClick={vi.fn()} />)
    expect(screen.getByText(/System Leverage/)).toBeInTheDocument()
  })

  it('shows Quadrant and Spectrum view toggle', () => {
    render(<SkillsMapChart config={minimalConfig} onSkillClick={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Quadrant/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Spectrum/i })).toBeInTheDocument()
  })

  it('shows skill names on the chart in quadrant view', () => {
    render(<SkillsMapChart config={minimalConfig} onSkillClick={vi.fn()} />)
    expect(screen.getByText('Skill One')).toBeInTheDocument()
    expect(screen.getByText('Skill Two')).toBeInTheDocument()
  })

  it('shows Skills by impact zone list with zone labels in quadrant view', () => {
    render(<SkillsMapChart config={minimalConfig} onSkillClick={vi.fn()} />)
    expect(screen.getByText(/Skills by impact zone/i)).toBeInTheDocument()
    expect(screen.getByText('Focus here')).toBeInTheDocument()
    expect(screen.getByText('Later')).toBeInTheDocument()
  })

  it('calls onSkillClick with correct skill when clicking a skill in the zone list', async () => {
    const user = userEvent.setup()
    const onSkillClick = vi.fn()
    render(<SkillsMapChart config={minimalConfig} onSkillClick={onSkillClick} />)
    const skillOneButton = screen.getByRole('button', { name: /Skill One/i })
    await user.click(skillOneButton)
    expect(onSkillClick).toHaveBeenCalledTimes(1)
    expect(onSkillClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'skill-1', label: 'Skill One', x: 8, y: 7 })
    )
  })

  it('switches to Spectrum view and shows skill names', async () => {
    const user = userEvent.setup()
    render(<SkillsMapChart config={minimalConfig} onSkillClick={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /Spectrum/i }))
    expect(screen.getByText(/Impact spectrum \(Radio → Gamma\)/)).toBeInTheDocument()
    expect(screen.getAllByText('Skill One').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Skill Two').length).toBeGreaterThanOrEqual(1)
  })

  it('calls onSkillClick when clicking a skill in Spectrum view', async () => {
    const user = userEvent.setup()
    const onSkillClick = vi.fn()
    render(<SkillsMapChart config={minimalConfig} onSkillClick={onSkillClick} />)
    await user.click(screen.getByRole('button', { name: /Spectrum/i }))
    const skillTwoButton = screen.getByRole('button', { name: /Skill Two/i })
    await user.click(skillTwoButton)
    expect(onSkillClick).toHaveBeenCalledTimes(1)
    expect(onSkillClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'skill-2', label: 'Skill Two', x: 3, y: 2 })
    )
  })

  it('shows Radio and Gamma labels in Spectrum view', async () => {
    const user = userEvent.setup()
    render(<SkillsMapChart config={minimalConfig} onSkillClick={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /Spectrum/i }))
    expect(screen.getByText(/Radio — low impact/)).toBeInTheDocument()
    expect(screen.getByText(/Gamma — high impact/)).toBeInTheDocument()
  })
})
