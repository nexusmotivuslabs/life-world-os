/**
 * BlogDropdown Component Tests
 * 
 * Tests for blog dropdown authentication and functionality.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BlogDropdown from '../BlogDropdown'
import * as blogApi from '../../services/blogApi'

vi.mock('../../services/blogApi')
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('BlogDropdown', () => {
  const mockOnPostSelect = vi.fn()

  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('should not load posts when no token exists', async () => {
    localStorageMock.getItem.mockReturnValue(null)

    render(<BlogDropdown onPostSelect={mockOnPostSelect} />)

    await waitFor(() => {
      expect(blogApi.getAllBlogPosts).not.toHaveBeenCalled()
    })
  })

  it('should load posts when authenticated', async () => {
    localStorageMock.getItem.mockReturnValue('token')
    vi.mocked(blogApi.getAllBlogPosts).mockResolvedValue([
      {
        slug: 'test-post',
        title: 'Test Post',
        category: 'Systems',
        date: '2025-01-15',
        tags: ['test'],
      },
    ])
    vi.mocked(blogApi.getBlogCategories).mockResolvedValue([
      { name: 'Systems', count: 1 },
    ])

    render(<BlogDropdown onPostSelect={mockOnPostSelect} />)

    await waitFor(() => {
      expect(blogApi.getAllBlogPosts).toHaveBeenCalled()
    })
  })

  it('should clear posts on authentication error', async () => {
    localStorageMock.getItem.mockReturnValue('token')
    vi.mocked(blogApi.getAllBlogPosts).mockRejectedValue(
      new Error('Authentication required to access blog')
    )

    render(<BlogDropdown onPostSelect={mockOnPostSelect} />)

    await waitFor(() => {
      expect(blogApi.getAllBlogPosts).toHaveBeenCalled()
    })
  })

  it('should call onPostSelect when post is clicked', async () => {
    localStorageMock.getItem.mockReturnValue('token')
    vi.mocked(blogApi.getAllBlogPosts).mockResolvedValue([
      {
        slug: 'test-post',
        title: 'Test Post',
        category: 'Systems',
        date: '2025-01-15',
        tags: ['test'],
      },
    ])
    vi.mocked(blogApi.getBlogCategories).mockResolvedValue([])

    render(<BlogDropdown onPostSelect={mockOnPostSelect} />)

    await waitFor(() => {
      const blogButton = screen.getByText('Blog')
      fireEvent.click(blogButton)
    })

    await waitFor(() => {
      const postButton = screen.getByText('Test Post')
      fireEvent.click(postButton)
      expect(mockOnPostSelect).toHaveBeenCalledWith('test-post')
    })
  })
})
