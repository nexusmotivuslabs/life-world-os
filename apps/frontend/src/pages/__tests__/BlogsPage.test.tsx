/**
 * BlogsPage Unit Tests
 *
 * Verifies blog page renders correctly: loading, empty state, post list.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import BlogsPage from '../BlogsPage'

const getAllBlogPosts = vi.fn()
const getBlogCategories = vi.fn()

vi.mock('../../services/blogApi', () => ({
  getAllBlogPosts: (...args: unknown[]) => getAllBlogPosts(...args),
  getBlogCategories: (...args: unknown[]) => getBlogCategories(...args),
}))

const mockPosts = [
  {
    slug: 'gitops-vs-gitflow',
    title: 'GitOps vs Git Flow',
    category: 'Systems',
    subcategory: 'Version Control',
    tags: ['gitops'],
    date: '2025-01-15',
    path: 'systems/version-control/gitops-vs-gitflow.md',
  },
  {
    slug: 'react-performance',
    title: 'React Performance',
    category: 'Tech',
    subcategory: 'Frontend',
    tags: ['react'],
    date: '2025-01-20',
    path: 'tech/react-performance.md',
  },
]

const mockCategories = [
  { name: 'Systems', path: '/blog/systems', posts: [] },
  { name: 'Tech', path: '/blog/tech', posts: [] },
]

function renderBlogsPage() {
  return render(
    <MemoryRouter>
      <BlogsPage />
    </MemoryRouter>
  )
}

describe('BlogsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAllBlogPosts).mockResolvedValue(mockPosts)
    vi.mocked(getBlogCategories).mockResolvedValue(mockCategories)
    localStorage.setItem('token', 'test-token')
  })

  afterEach(() => {
    localStorage.removeItem('token')
  })

  it('shows loading state initially', () => {
    vi.mocked(getAllBlogPosts).mockImplementation(() => new Promise(() => {}))
    vi.mocked(getBlogCategories).mockImplementation(() => new Promise(() => {}))

    renderBlogsPage()

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders blog header with Latest and Back link', async () => {
    renderBlogsPage()

    await waitFor(() => {
      expect(getAllBlogPosts).toHaveBeenCalled()
    })

    expect(screen.getByText('Latest')).toBeInTheDocument()
    expect(screen.getByText(/Life World OS Blog/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument()
  })

  it('renders post list when posts exist', async () => {
    renderBlogsPage()

    await waitFor(() => {
      expect(getAllBlogPosts).toHaveBeenCalled()
    })

    expect(screen.getByText('GitOps vs Git Flow')).toBeInTheDocument()
    expect(screen.getByText('React Performance')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Systems \(1\)/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tech \(1\)/ })).toBeInTheDocument()
  })

  it('shows "No blog posts yet" when posts are empty', async () => {
    vi.mocked(getAllBlogPosts).mockResolvedValue([])
    vi.mocked(getBlogCategories).mockResolvedValue([])

    renderBlogsPage()

    await waitFor(() => {
      expect(getAllBlogPosts).toHaveBeenCalled()
    })

    expect(screen.getByText(/no blog posts yet/i)).toBeInTheDocument()
  })

  it('renders category filter buttons', async () => {
    renderBlogsPage()

    await waitFor(() => {
      expect(getAllBlogPosts).toHaveBeenCalled()
    })

    expect(screen.getByRole('button', { name: /all \(2\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /systems \(1\)/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tech \(1\)/i })).toBeInTheDocument()
  })

  it('filters posts by category when category button is clicked', async () => {
    const user = userEvent.setup()
    renderBlogsPage()

    await waitFor(() => {
      expect(getAllBlogPosts).toHaveBeenCalled()
    })

    expect(screen.getByText('GitOps vs Git Flow')).toBeInTheDocument()
    expect(screen.getByText('React Performance')).toBeInTheDocument()

    const systemsButton = screen.getByRole('button', { name: /Systems \(1\)/ })
    await user.click(systemsButton)

    await waitFor(() => {
      expect(screen.getByText('GitOps vs Git Flow')).toBeInTheDocument()
      expect(screen.queryByText('React Performance')).not.toBeInTheDocument()
    })
  })

  it('does not fetch when no token', async () => {
    localStorage.removeItem('token')
    renderBlogsPage()

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    }, { timeout: 500 })

    expect(getAllBlogPosts).not.toHaveBeenCalled()
  })
})
