/**
 * BlogsPage Unit Tests
 *
 * Verifies blog page renders correctly: loading, empty state, post list,
 * category filtering, and search.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import BlogsPage from '../BlogsPage'

const getAllBlogPosts = vi.fn()

vi.mock('../../services/blogApi', () => ({
  getAllBlogPosts: (...args: unknown[]) => getAllBlogPosts(...args),
  getBlogCategories: vi.fn().mockResolvedValue([]),
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
    localStorage.setItem('token', 'test-token')
  })

  afterEach(() => {
    localStorage.removeItem('token')
  })

  it('shows loading skeleton initially', () => {
    vi.mocked(getAllBlogPosts).mockImplementation(() => new Promise(() => {}))

    renderBlogsPage()

    // Loading skeleton renders divs, not text — just check posts aren't visible yet
    expect(screen.queryByText('GitOps vs Git Flow')).not.toBeInTheDocument()
  })

  it('renders blog header and Back link', async () => {
    renderBlogsPage()

    await waitFor(() => {
      expect(getAllBlogPosts).toHaveBeenCalled()
    })

    expect(screen.getAllByText(/Life World OS Blog/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument()
  })

  it('renders post list when posts exist', async () => {
    renderBlogsPage()

    await waitFor(() => {
      expect(getAllBlogPosts).toHaveBeenCalled()
    })

    expect(screen.getByText('GitOps vs Git Flow')).toBeInTheDocument()
    expect(screen.getByText('React Performance')).toBeInTheDocument()
  })

  it('displays latest post as featured (largest card first)', async () => {
    renderBlogsPage()

    await waitFor(() => {
      expect(getAllBlogPosts).toHaveBeenCalled()
    })

    // Posts are sorted by date descending; React Performance (2025-01-20) is latest, so it appears first (featured)
    const headings = screen.getAllByRole('heading', { level: 2 })
    expect(headings.length).toBeGreaterThanOrEqual(1)
    expect(headings[0]).toHaveTextContent('React Performance')
  })

  it('renders category filter pills', async () => {
    renderBlogsPage()

    await waitFor(() => {
      expect(getAllBlogPosts).toHaveBeenCalled()
    })

    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Systems' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tech' })).toBeInTheDocument()
  })

  it('shows "No blog posts yet" when posts are empty', async () => {
    vi.mocked(getAllBlogPosts).mockResolvedValue([])

    renderBlogsPage()

    await waitFor(() => {
      expect(getAllBlogPosts).toHaveBeenCalled()
    })

    expect(screen.getByText(/no blog posts yet/i)).toBeInTheDocument()
  })

  it('filters posts by category when category pill is clicked', async () => {
    const user = userEvent.setup()
    renderBlogsPage()

    await waitFor(() => {
      expect(getAllBlogPosts).toHaveBeenCalled()
    })

    expect(screen.getByText('GitOps vs Git Flow')).toBeInTheDocument()
    expect(screen.getByText('React Performance')).toBeInTheDocument()

    // Category pills: "All", "Systems", "Tech" — click "Systems" to filter
    const systemsPill = screen.getByRole('button', { name: 'Systems' })
    await user.click(systemsPill)

    await waitFor(() => {
      expect(screen.getByText('GitOps vs Git Flow')).toBeInTheDocument()
      expect(screen.queryByText('React Performance')).not.toBeInTheDocument()
    })
  })

  it('filters posts by search query', async () => {
    const user = userEvent.setup()
    renderBlogsPage()

    await waitFor(() => {
      expect(getAllBlogPosts).toHaveBeenCalled()
    })

    const searchInput = screen.getByRole('textbox', { name: /search/i })
    await user.type(searchInput, 'GitOps')

    await waitFor(() => {
      expect(screen.getByText('GitOps vs Git Flow')).toBeInTheDocument()
      expect(screen.queryByText('React Performance')).not.toBeInTheDocument()
    })
  })

  it('does not fetch when no token', async () => {
    localStorage.removeItem('token')
    renderBlogsPage()

    await waitFor(() => {
      expect(screen.queryByText('GitOps vs Git Flow')).not.toBeInTheDocument()
    }, { timeout: 500 })

    expect(getAllBlogPosts).not.toHaveBeenCalled()
  })
})
