/**
 * HierarchyTreeView tests
 *
 * Covers hierarchy tree improvements: readability (labels, no truncation),
 * sentiment & advice section, special terms (specialist advice), and fallback for missing titles.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HierarchyTreeView from '../HierarchyTreeView'
import { hierarchyCache } from '../../../lib/hierarchyCache'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('../../../lib/hierarchyCache', () => ({
  hierarchyCache: {
    get: vi.fn(),
    set: vi.fn(),
    invalidate: vi.fn(),
    getFromMemory: vi.fn(),
    calculateChecksum: vi.fn(() => 'mock-checksum'),
  },
}))

const mockGetNode = vi.fn()
const mockGetChildren = vi.fn()
const mockEnsureNode = vi.fn()
vi.mock('../../../services/financeApi', () => ({
  realityNodeApi: {
    getNode: (...args: any[]) => mockGetNode(...args),
    getChildren: (...args: any[]) => mockGetChildren(...args),
    ensureNode: (...args: any[]) => mockEnsureNode(...args),
    clearCache: vi.fn(),
  },
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Minimal tree: root + children with sentiment, special term, and empty-label nodes
const mockRootNode = {
  id: 'reality-root',
  label: 'REALITY',
  type: 'reality' as const,
  category: 'FOUNDATIONAL',
  immutable: true,
  children: [
    {
      id: 'node-rage',
      label: 'RAGE',
      type: 'principle' as const,
      category: 'FUNDAMENTAL',
      immutable: false,
      children: [],
      data: {
        description: 'Extreme anger with loss of control',
        sentiment: 'negative',
        adviceToAvoid: 'Pause before acting; take space.',
      },
    },
    {
      id: 'node-flow',
      label: 'FLOW_STATE',
      type: 'principle' as const,
      category: 'FUNDAMENTAL',
      immutable: false,
      children: [],
      data: {
        description: 'Optimal experience with full immersion',
        specialTermWhatItIs: 'Flow is full immersion and focused energy.',
        specialTermKeyFacts: ['Balance challenge and skill.', 'Clear goals help.'],
        specialTermHowItContributesToLife: 'Flow increases performance and well-being.',
      },
    },
    {
      id: 'node-unnamed',
      label: '',
      type: 'category' as const,
      category: 'FOUNDATIONAL',
      immutable: true,
      children: [],
      data: { description: 'A node with no title' },
    },
  ],
  data: { description: 'The single immutable root of all existence.' },
}

const mockCachedTree = {
  rootNode: mockRootNode,
  metadata: {
    version: '1.0.0',
    timestamp: Date.now(),
    nodeCount: 4,
    checksum: 'mock-checksum',
    rootNodeId: 'reality-root',
  },
  nodeMap: {},
}

function renderTree() {
  return render(
    <MemoryRouter>
      <HierarchyTreeView rootNodeId="reality" />
    </MemoryRouter>
  )
}

describe('HierarchyTreeView', () => {
  beforeEach(() => {
    vi.mocked(hierarchyCache.get).mockResolvedValue(mockCachedTree)
    // Background refresh builds tree from API; return same structure so refresh doesn't replace with empty children
    mockGetNode.mockImplementation((id: string) => {
      if (id === 'reality-root') {
        return Promise.resolve({
          node: {
            id: 'reality-root',
            title: 'REALITY',
            description: 'Root.',
            nodeType: 'REALITY',
            category: 'FOUNDATIONAL',
            parentId: null,
            orderIndex: 0,
            immutable: true,
            metadata: {},
          },
        })
      }
      if (id === 'node-rage') {
        return Promise.resolve({
          node: {
            id: 'node-rage',
            title: 'RAGE',
            description: 'Extreme anger with loss of control',
            nodeType: 'PRINCIPLE',
            category: 'FUNDAMENTAL',
            parentId: 'reality-root',
            orderIndex: 0,
            immutable: false,
            metadata: { sentiment: 'negative', adviceToAvoid: 'Pause before acting; take space.' },
          },
        })
      }
      if (id === 'node-flow') {
        return Promise.resolve({
          node: {
            id: 'node-flow',
            title: 'FLOW_STATE',
            description: 'Optimal experience with full immersion',
            nodeType: 'PRINCIPLE',
            category: 'FUNDAMENTAL',
            parentId: 'reality-root',
            orderIndex: 1,
            immutable: false,
            metadata: {
              specialTermWhatItIs: 'Flow is full immersion and focused energy.',
              specialTermKeyFacts: ['Balance challenge and skill.', 'Clear goals help.'],
              specialTermHowItContributesToLife: 'Flow increases performance and well-being.',
            },
          },
        })
      }
      if (id === 'node-unnamed') {
        return Promise.resolve({
          node: {
            id: 'node-unnamed',
            title: '',
            description: 'A node with no title',
            nodeType: 'CATEGORY',
            category: 'FOUNDATIONAL',
            parentId: 'reality-root',
            orderIndex: 2,
            immutable: true,
            metadata: {},
          },
        })
      }
      return Promise.resolve({ node: { id, title: id, nodeType: 'CATEGORY', parentId: null, orderIndex: 0, immutable: false, metadata: {} } })
    })
    mockGetChildren.mockImplementation((id: string) => {
      if (id === 'reality-root') {
        return Promise.resolve({
          children: [
            { id: 'node-rage', title: 'RAGE', description: null, nodeType: 'PRINCIPLE', category: 'FUNDAMENTAL', immutable: false, orderIndex: 0 },
            { id: 'node-flow', title: 'FLOW_STATE', description: null, nodeType: 'PRINCIPLE', category: 'FUNDAMENTAL', immutable: false, orderIndex: 1 },
            { id: 'node-unnamed', title: '', description: null, nodeType: 'CATEGORY', category: 'FOUNDATIONAL', immutable: true, orderIndex: 2 },
          ],
          count: 3,
        })
      }
      return Promise.resolve({ children: [], count: 0 })
    })
    // ensureNode returns same shape as getNode (node wrapper) for detail panel
    mockEnsureNode.mockImplementation((id: string) => {
      return mockGetNode(id).then((r: any) => (r?.node ? { node: r.node } : r))
    })
  })

  it('renders tree with ROOT and expands to show child labels', async () => {
    renderTree()

    await waitFor(() => {
      expect(screen.getByText('ROOT')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /Expand All/i }))

    await waitFor(() => {
      expect(screen.getByText('Rage')).toBeInTheDocument()
      expect(screen.getByText('Flow State')).toBeInTheDocument()
    })
  })

  it('shows sentiment and advice in detail modal when node has sentiment data', async () => {
    renderTree()

    await waitFor(() => expect(screen.getByText('ROOT')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Expand All/i }))

    await waitFor(() => expect(screen.getByText('Rage')).toBeInTheDocument())

    const rageRow = screen.getByText('Rage').closest('.cursor-pointer')
    expect(rageRow).toBeInTheDocument()
    await userEvent.click(rageRow!)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Sentiment & advice/i })).toBeInTheDocument()
      expect(screen.getByText(/Ways to avoid or reduce/i)).toBeInTheDocument()
      expect(screen.getByText(/Pause before acting; take space/i)).toBeInTheDocument()
    })
  })

  it('shows specialist advice in detail modal when node has special term data', async () => {
    renderTree()

    await waitFor(() => expect(screen.getByText('ROOT')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Expand All/i }))

    await waitFor(() => expect(screen.getByText('Flow State')).toBeInTheDocument())

    const flowRow = screen.getByText('Flow State').closest('.cursor-pointer')
    expect(flowRow).toBeInTheDocument()
    await userEvent.click(flowRow!)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Specialist advice/i })).toBeInTheDocument()
      expect(screen.getByText(/What it is/i)).toBeInTheDocument()
      expect(screen.getByText(/Flow is full immersion and focused energy/i)).toBeInTheDocument()
      expect(screen.getByText(/Key facts/i)).toBeInTheDocument()
      expect(screen.getByText(/How it contributes to life/i)).toBeInTheDocument()
      expect(screen.getByText(/Flow increases performance and well-being/i)).toBeInTheDocument()
    })
  })

  it('shows fallback label for node with empty title', async () => {
    renderTree()

    await waitFor(() => expect(screen.getByText('ROOT')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Expand All/i }))

    await waitFor(() => {
      // Empty label should fallback to 'Unnamed' (see HierarchyTreeView displayName fallback)
      expect(screen.getByText('Unnamed')).toBeInTheDocument()
    })
  })

  it('shows ROOT when cache is populated', async () => {
    renderTree()

    await waitFor(() => {
      expect(screen.getByText('ROOT')).toBeInTheDocument()
    })
  })
})
