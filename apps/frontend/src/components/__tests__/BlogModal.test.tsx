/**
 * BlogModal Component Tests
 * 
 * Tests for blog modal authentication and UX features.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import BlogModal from '../BlogModal'
import * as blogApi from '../../services/blogApi'

vi.mock('../../services/blogApi')
vi.mock('react-markdown', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}))
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('BlogModal', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not render when not open', () => {
    render(
      <BlogModal slug="test-post" isOpen={false} onClose={mockOnClose} />
    )

    expect(screen.queryByText('Blog Post')).not.toBeInTheDocument()
  })

  it.skip('should show loading state when fetching post', async () => {
    vi.mocked(blogApi.getBlogPost).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    render(
      <BlogModal slug="test-post" isOpen={true} onClose={mockOnClose} />
    )

    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  })

  it('should display post title and body content when loaded', async () => {
    const mockPost = {
      slug: 'test-post',
      title: 'Test Post',
      category: 'Systems',
      date: '2025-01-15',
      tags: ['test'],
      content: 'This is a test post with multiple words. '.repeat(50),
    }

    vi.mocked(blogApi.getBlogPost).mockResolvedValue(mockPost as any)

    render(
      <BlogModal slug="test-post" isOpen={true} onClose={mockOnClose} />
    )

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument()
      expect(screen.getByText(/This is a test post with multiple words/)).toBeInTheDocument()
    })
  })

  it.skip('should show error message on authentication failure', async () => {
    vi.mocked(blogApi.getBlogPost).mockRejectedValue(
      new Error('Authentication required to access blog')
    )

    render(
      <BlogModal slug="test-post" isOpen={true} onClose={mockOnClose} />
    )

    await waitFor(() => {
      expect(screen.getByText(/Please log in/i)).toBeInTheDocument()
    })
  })

  it('should display post content when loaded', async () => {
    const mockPost = {
      slug: 'test-post',
      title: 'Test Post',
      category: 'Systems',
      date: '2025-01-15',
      tags: ['test'],
      content: '# Test Post\n\nThis is test content.',
    }

    vi.mocked(blogApi.getBlogPost).mockResolvedValue(mockPost as any)

    render(
      <BlogModal slug="test-post" isOpen={true} onClose={mockOnClose} />
    )

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument()
    })
  })
})
