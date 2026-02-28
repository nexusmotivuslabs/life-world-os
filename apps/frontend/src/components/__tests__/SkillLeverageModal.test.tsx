import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SkillLeverageModal from '../SkillLeverageModal'
import type { SkillsMapSkill } from '../../config/skillsMapConfig'
import { SystemId } from '../../types'

describe('SkillLeverageModal', () => {
  const mockOnClose = vi.fn()
  const mockOnExploreInConcepts = vi.fn()
  const mockOnOpenNode = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when skill is null', () => {
    const { container } = render(
      <SkillLeverageModal
        skill={null}
        isOpen
        onClose={mockOnClose}
        onExploreInConcepts={mockOnExploreInConcepts}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing when not open', () => {
    const skill: SkillsMapSkill = { id: 'test-skill', label: 'Test Skill', x: 5, y: 5 }
    const { container } = render(
      <SkillLeverageModal
        skill={skill}
        isOpen={false}
        onClose={mockOnClose}
        onExploreInConcepts={mockOnExploreInConcepts}
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders skill label and all eight sections when open', () => {
    const skill: SkillsMapSkill = { id: 'test-skill', label: 'Test Skill', x: 5, y: 5, description: 'A test.' }
    render(
      <SkillLeverageModal
        skill={skill}
        isOpen
        onClose={mockOnClose}
        onExploreInConcepts={mockOnExploreInConcepts}
      />
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Skill')).toBeInTheDocument()
    expect(screen.getByText(/1\. What problem does this skill solve\?/)).toBeInTheDocument()
    expect(screen.getByText(/2\. Where does this skill sit structurally\?/)).toBeInTheDocument()
    expect(screen.getByText(/3\. Leverage profile/)).toBeInTheDocument()
    expect(screen.getByText(/4\. Compounding mechanism/)).toBeInTheDocument()
    expect(screen.getByText(/5\. Cost to mastery/)).toBeInTheDocument()
    expect(screen.getByText(/6\. Signal vs noise/)).toBeInTheDocument()
    expect(screen.getByText(/7\. Interaction effects/)).toBeInTheDocument()
    expect(screen.getByText(/8\. Observable metrics/)).toBeInTheDocument()
    expect(screen.getByText(/Decision/)).toBeInTheDocument()
  })

  it('shows skill with full leverage content (communication-career)', () => {
    const skill: SkillsMapSkill = { id: 'communication-career', label: 'Communication', x: 9, y: 8 }
    render(
      <SkillLeverageModal
        skill={skill}
        systemId={SystemId.CAREER}
        isOpen
        onClose={mockOnClose}
        onExploreInConcepts={mockOnExploreInConcepts}
      />
    )
    expect(screen.getByText('Communication')).toBeInTheDocument()
    expect(screen.getByText(/Misalignment and ambiguity/)).toBeInTheDocument()
    expect(screen.getByText('Invest', { selector: 'span' })).toBeInTheDocument()
  })

  it('calls onClose when Close button is clicked', async () => {
    const user = userEvent.setup()
    const skill: SkillsMapSkill = { id: 'test', label: 'Test', x: 5, y: 5 }
    render(
      <SkillLeverageModal
        skill={skill}
        isOpen
        onClose={mockOnClose}
        onExploreInConcepts={mockOnExploreInConcepts}
      />
    )
    const closeButtons = screen.getAllByRole('button', { name: /close/i })
    const closeBtn = closeButtons[0]
    await user.click(closeBtn)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onExploreInConcepts and onClose when Explore in Universal Concepts is clicked', async () => {
    const user = userEvent.setup()
    const skill: SkillsMapSkill = { id: 'test', label: 'Test', x: 5, y: 5 }
    render(
      <SkillLeverageModal
        skill={skill}
        isOpen
        onClose={mockOnClose}
        onExploreInConcepts={mockOnExploreInConcepts}
      />
    )
    const exploreBtn = screen.getByRole('button', { name: /Explore in Universal Concepts/i })
    await user.click(exploreBtn)
    expect(mockOnExploreInConcepts).toHaveBeenCalledTimes(1)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('shows Open node in tree when skill has realityNodeId and onOpenNode provided', async () => {
    const skill: SkillsMapSkill = {
      id: 'test',
      label: 'Test',
      x: 5,
      y: 5,
      realityNodeId: 'node-123',
    }
    render(
      <SkillLeverageModal
        skill={skill}
        isOpen
        onClose={mockOnClose}
        onExploreInConcepts={mockOnExploreInConcepts}
        onOpenNode={mockOnOpenNode}
      />
    )
    const openNodeBtn = screen.getByRole('button', { name: /Open node in tree/i })
    expect(openNodeBtn).toBeInTheDocument()
    await userEvent.setup().click(openNodeBtn)
    expect(mockOnOpenNode).toHaveBeenCalledWith('node-123')
  })

  it('does not show Open node in tree when skill has no realityNodeId', () => {
    const skill: SkillsMapSkill = { id: 'test', label: 'Test', x: 5, y: 5 }
    render(
      <SkillLeverageModal
        skill={skill}
        isOpen
        onClose={mockOnClose}
        onExploreInConcepts={mockOnExploreInConcepts}
        onOpenNode={mockOnOpenNode}
      />
    )
    expect(screen.queryByRole('button', { name: /Open node in tree/i })).not.toBeInTheDocument()
  })

  it('shows capability when skill has capability', () => {
    const skill: SkillsMapSkill = {
      id: 'test',
      label: 'Test',
      x: 5,
      y: 5,
      capability: 'Systems thinking',
    }
    render(
      <SkillLeverageModal
        skill={skill}
        isOpen
        onClose={mockOnClose}
        onExploreInConcepts={mockOnExploreInConcepts}
      />
    )
    expect(screen.getByText(/Capability → Systems thinking/)).toBeInTheDocument()
  })

  it('shows derived Decision (Invest) for high x+y skill without content', () => {
    const skill: SkillsMapSkill = { id: 'no-content', label: 'High Value', x: 9, y: 9 }
    render(
      <SkillLeverageModal
        skill={skill}
        isOpen
        onClose={mockOnClose}
        onExploreInConcepts={mockOnExploreInConcepts}
      />
    )
    expect(screen.getByText('Invest', { selector: 'span' })).toBeInTheDocument()
  })

  it('shows derived Decision (Avoid) for low x+y skill without content', () => {
    const skill: SkillsMapSkill = { id: 'no-content', label: 'Low Value', x: 1, y: 1 }
    render(
      <SkillLeverageModal
        skill={skill}
        isOpen
        onClose={mockOnClose}
        onExploreInConcepts={mockOnExploreInConcepts}
      />
    )
    expect(screen.getByText('Avoid', { selector: 'span' })).toBeInTheDocument()
  })
})
