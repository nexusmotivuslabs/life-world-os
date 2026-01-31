/**
 * Blog API Service
 *
 * Fetches and manages blog posts from the blog directory.
 * Uses shared request() so API URL and auth token are applied correctly.
 */

import { request } from './api'

export interface BlogPost {
  slug: string
  title: string
  category: string
  subcategory?: string
  tags: string[]
  date: string
  content: string
  path: string
}

export interface BlogCategory {
  name: string
  path: string
  posts: BlogPost[]
}

/**
 * Fetch all blog posts metadata (requires auth)
 */
export async function getAllBlogPosts(): Promise<Omit<BlogPost, 'content'>[]> {
  try {
    return await request<Omit<BlogPost, 'content'>[]>('/api/blog/posts')
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string }
    if (err?.status === 401 || err?.status === 403 || err?.message?.includes?.('Authentication')) {
      throw new Error('Authentication required to access blog')
    }
    throw error
  }
}

/**
 * Fetch blog post by slug (requires auth)
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    return await request<BlogPost>(`/api/blog/posts/${slug}`)
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string }
    if (err?.status === 404) return null
    if (err?.status === 401 || err?.status === 403) {
      throw new Error('Authentication required to access blog')
    }
    throw error
  }
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(category: string): Promise<Omit<BlogPost, 'content'>[]> {
  const allPosts = await getAllBlogPosts()
  return allPosts.filter(p => p.category === category)
}

/**
 * Get blog categories (requires auth)
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    return await request<BlogCategory[]>('/api/blog/categories')
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string }
    if (err?.status === 401 || err?.status === 403 || err?.message?.includes?.('Authentication')) {
      throw new Error('Authentication required to access blog')
    }
    throw error
  }
}

