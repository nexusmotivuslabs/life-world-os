/**
 * Blog API Service
 * 
 * Fetches and manages blog posts from the blog directory
 */

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
 * Blog posts metadata
 * This would ideally be generated from the blog directory structure
 */
const BLOG_POSTS: Omit<BlogPost, 'content'>[] = [
  {
    slug: 'gitops-vs-gitflow',
    title: 'GitOps vs Git Flow: A Practical Comparison',
    category: 'Systems',
    subcategory: 'Version Control',
    tags: ['gitops', 'git-flow', 'ci-cd', 'devops', 'version-control', 'deployment'],
    date: '2025-01-15',
    path: '/blog/systems/version-control/gitops-vs-gitflow.md'
  }
]

/**
 * Get authentication headers
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

/**
 * Fetch all blog posts metadata
 */
export async function getAllBlogPosts(): Promise<Omit<BlogPost, 'content'>[]> {
  try {
    const response = await fetch('/api/blog/posts', {
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication required to access blog')
      }
      throw new Error('Failed to fetch blog posts')
    }
    const posts = await response.json()
    return posts as Omit<BlogPost, 'content'>[]
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    throw error
  }
}

/**
 * Fetch blog post by slug
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`/api/blog/posts/${slug}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication required to access blog')
      }
      throw new Error(`Failed to fetch blog post: ${response.statusText}`)
    }
    const post = await response.json()
    return post as BlogPost
  } catch (error) {
    console.error('Error fetching blog post:', error)
    throw error
  }
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(category: string): Promise<Omit<BlogPost, 'content'>[]> {
  try {
    const allPosts = await getAllBlogPosts()
    return allPosts.filter(p => p.category === category)
  } catch (error) {
    console.error('Error fetching blog posts by category:', error)
    return BLOG_POSTS.filter(p => p.category === category)
  }
}

/**
 * Get blog categories
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    const response = await fetch('/api/blog/categories', {
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Authentication required to access blog')
      }
      throw new Error('Failed to fetch blog categories')
    }
    const categories = await response.json()
    return categories as BlogCategory[]
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    throw error
  }
}

