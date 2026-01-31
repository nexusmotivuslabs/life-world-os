/**
 * blogApi Unit Tests
 *
 * Verifies blog API uses shared request and handles auth/404 correctly.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as blogApi from '../blogApi'
import * as api from '../api'

vi.mock('../api', () => ({
  request: vi.fn(),
}))

const mockRequest = vi.mocked(api.request)

describe('blogApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllBlogPosts', () => {
    it('calls request with correct endpoint and returns posts', async () => {
      const mockPosts = [
        { slug: 'test', title: 'Test', category: 'Tech', tags: [], date: '2025-01-01', path: 'tech/test.md' },
      ]
      mockRequest.mockResolvedValue(mockPosts)

      const result = await blogApi.getAllBlogPosts()

      expect(mockRequest).toHaveBeenCalledWith('/api/blog/posts')
      expect(result).toEqual(mockPosts)
    })

    it('throws on auth error', async () => {
      const authError = new Error('Unauthorized') as Error & { status?: number }
      authError.status = 401
      mockRequest.mockRejectedValue(authError)

      await expect(blogApi.getAllBlogPosts()).rejects.toThrow('Authentication required to access blog')
    })
  })

  describe('getBlogPost', () => {
    it('returns post when found', async () => {
      const mockPost = {
        slug: 'test',
        title: 'Test',
        category: 'Tech',
        tags: [],
        date: '2025-01-01',
        path: 'tech/test.md',
        content: '# Hello',
      }
      mockRequest.mockResolvedValue(mockPost)

      const result = await blogApi.getBlogPost('test')

      expect(mockRequest).toHaveBeenCalledWith('/api/blog/posts/test')
      expect(result).toEqual(mockPost)
    })

    it('returns null on 404', async () => {
      const err = new Error('Not found') as Error & { status?: number }
      err.status = 404
      mockRequest.mockRejectedValue(err)

      const result = await blogApi.getBlogPost('nonexistent')

      expect(result).toBeNull()
    })

    it('throws on auth error', async () => {
      const authError = new Error('Unauthorized') as Error & { status?: number }
      authError.status = 401
      mockRequest.mockRejectedValue(authError)

      await expect(blogApi.getBlogPost('test')).rejects.toThrow(
        'Authentication required to access blog'
      )
    })
  })

  describe('getBlogPostsByCategory', () => {
    it('filters posts by category', async () => {
      const allPosts = [
        { slug: 'a', title: 'A', category: 'Tech', tags: [], date: '2025-01-01', path: 'a.md' },
        { slug: 'b', title: 'B', category: 'Career', tags: [], date: '2025-01-02', path: 'b.md' },
      ]
      mockRequest.mockResolvedValue(allPosts)

      const result = await blogApi.getBlogPostsByCategory('Tech')

      expect(result).toHaveLength(1)
      expect(result[0].category).toBe('Tech')
      expect(result[0].slug).toBe('a')
    })
  })

  describe('getBlogCategories', () => {
    it('calls request and returns categories', async () => {
      const mockCategories = [
        { name: 'Tech', path: '/blog/tech', posts: [] },
        { name: 'Career', path: '/blog/career', posts: [] },
      ]
      mockRequest.mockResolvedValue(mockCategories)

      const result = await blogApi.getBlogCategories()

      expect(mockRequest).toHaveBeenCalledWith('/api/blog/categories')
      expect(result).toEqual(mockCategories)
    })
  })
})
