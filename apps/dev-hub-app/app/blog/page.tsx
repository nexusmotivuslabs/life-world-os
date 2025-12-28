'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  category?: string
}

export default function BlogPage() {
  const { isPaid, isLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !isPaid) {
      router.push('/')
      return
    }

    if (isPaid) {
      loadPosts()
    }
  }, [isPaid, isLoading, router])

  const loadPosts = async () => {
    try {
      // In a real app, this would fetch from an API
      // For now, we'll use mock data
      const mockPosts: BlogPost[] = [
        {
          id: '1',
          title: 'Getting Started with Life World OS',
          slug: 'getting-started',
          excerpt: 'Learn the basics of using Life World OS to manage your life systems.',
          content: 'Full content here...',
          author: 'Admin',
          publishedAt: '2025-01-25',
          category: 'Getting Started',
        },
        {
          id: '2',
          title: 'Advanced Energy Management',
          slug: 'advanced-energy',
          excerpt: 'Deep dive into managing your energy systems effectively.',
          content: 'Full content here...',
          author: 'Admin',
          publishedAt: '2025-01-24',
          category: 'Energy',
        },
      ]
      setPosts(mockPosts)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  if (!isPaid) {
    return null // Will redirect
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-gray-600">
          Exclusive content for paid members. Learn about Life World OS features,
          best practices, and advanced techniques.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading posts...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-600">No blog posts available yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <article className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-2xl font-semibold">{post.title}</h2>
                  {post.category && (
                    <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {post.category}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>By {post.author}</span>
                  <span className="mx-2">•</span>
                  <time>{new Date(post.publishedAt).toLocaleDateString()}</time>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

