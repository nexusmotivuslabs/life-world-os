/**
 * Blogs Page
 *
 * Full-page blog listing at /blogs. Engadget-style: Latest bar, tag filters, headline list.
 * Opens BlogModal when a post is clicked.
 */

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getAllBlogPosts, getBlogCategories, type BlogCategory } from '../services/blogApi'
import BlogModal from '../components/BlogModal'

export default function BlogsPage() {
  const [posts, setPosts] = useState<Awaited<ReturnType<typeof getAllBlogPosts>>>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      setPosts([])
      setCategories([])
      return
    }
    setLoading(true)
    Promise.all([getAllBlogPosts(), getBlogCategories()])
      .then(([postsData, categoriesData]) => {
        setPosts(Array.isArray(postsData) ? postsData : [])
        setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      })
      .catch((err) => {
        console.error('Error loading blog data:', err)
        setPosts([])
        setCategories([])
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return posts
    return posts.filter((p) => p.category === selectedCategory)
  }, [posts, selectedCategory])

  const uniqueCategories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category))
    return Array.from(set).sort()
  }, [posts])

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Engadget-style header bar */}
      <div className="bg-black text-white px-4 py-3 border-b border-black">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-white">
            Latest
          </span>
          <span className="text-neutral-400 text-xs">· Life World OS Blog</span>
          <Link
            to="/choose-plane"
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            ← Back
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tag bar */}
        {!loading && uniqueCategories.length > 0 && (
          <div className="mb-6 pb-4 border-b border-neutral-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mr-2">
              Categories
            </span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-black text-white'
                  : 'text-neutral-600 hover:bg-neutral-200 hover:text-black'
              }`}
            >
              All ({posts.length})
            </button>
            {uniqueCategories.map((cat) => {
              const count = posts.filter((p) => p.category === cat).length
              const active = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'bg-black text-white'
                      : 'text-neutral-600 hover:bg-neutral-200 hover:text-black'
                  }`}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>
        )}

        {/* Headlines list */}
        {loading ? (
          <div className="py-12 text-center text-neutral-500 text-sm">
            Loading…
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12 text-center text-neutral-500 text-sm">
            {selectedCategory ? `No posts in "${selectedCategory}".` : 'No blog posts yet.'}
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {filteredPosts.map((post) => (
              <li key={post.slug}>
                <button
                  type="button"
                  onClick={() => setSelectedSlug(post.slug)}
                  className="w-full text-left py-4 hover:bg-neutral-50 transition-colors px-2 -mx-2 rounded group"
                >
                  <span className="block font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors text-base sm:text-lg leading-snug">
                    {post.title}
                  </span>
                  <div className="flex items-center gap-2 mt-1.5 text-sm text-neutral-500">
                    <span>
                      {post.category}
                      {post.subcategory ? ` · ${post.subcategory}` : ''}
                    </span>
                    <span>
                      {new Date(post.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 pt-6 border-t border-neutral-200 text-center text-xs text-neutral-500">
          Life World OS blog · Technical articles and insights
        </div>
      </div>

      <BlogModal
        slug={selectedSlug}
        isOpen={!!selectedSlug}
        onClose={() => setSelectedSlug(null)}
      />
    </div>
  )
}
