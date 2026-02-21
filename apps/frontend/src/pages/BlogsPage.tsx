/**
 * Blogs Page
 *
 * Dark-themed, content-first blog listing. Interactive elements (search, category
 * filter) are quiet and embedded — titles are always the visual hero.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllBlogPosts, type BlogPost } from '../services/blogApi'
import BlogModal from '../components/BlogModal'

// Map app semantic categories to their theme colors
const CATEGORY_COLORS: Record<string, string> = {
  capacity: '#10b981',
  engines: '#3b82f6',
  oxygen: '#06b6d4',
  meaning: '#8b5cf6',
  optionality: '#f59e0b',
}

function getCategoryColor(category: string): string {
  const key = category.toLowerCase()
  return CATEGORY_COLORS[key] ?? '#6b7280'
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
}

export default function BlogsPage() {
  const [posts, setPosts] = useState<Omit<BlogPost, 'content'>[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      setPosts([])
      return
    }
    setLoading(true)
    getAllBlogPosts()
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Error loading blog data:', err)
        setPosts([])
      })
      .finally(() => setLoading(false))
  }, [])

  const uniqueCategories = useMemo(() => {
    const set = new Set(posts.map((p) => p.category))
    return Array.from(set).sort()
  }, [posts])

  const filteredPosts = useMemo(() => {
    let result = posts
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.subcategory ?? '').toLowerCase().includes(q) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
      )
    }
    return result
  }, [posts, selectedCategory, search])

  // Key changes whenever filter/search changes so stagger re-triggers
  const listKey = `${selectedCategory ?? 'all'}-${search}`

  const openPost = useCallback(
    (post: Omit<BlogPost, 'content'>) => {
      const idx = filteredPosts.findIndex((p) => p.slug === post.slug)
      setSelectedIndex(idx >= 0 ? idx : null)
    },
    [filteredPosts]
  )

  const navigatePost = useCallback(
    (newIndex: number) => {
      if (newIndex >= 0 && newIndex < filteredPosts.length) {
        setSelectedIndex(newIndex)
      }
    },
    [filteredPosts]
  )

  const selectedPost = selectedIndex !== null ? filteredPosts[selectedIndex] ?? null : null

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-400 shrink-0">
            Life World OS Blog
          </span>

          {/* Ghost search input */}
          <div className="flex-1 flex items-center gap-2 border-b border-gray-700 py-1 focus-within:border-gray-500 transition-colors">
            <Search className="w-3.5 h-3.5 text-gray-600 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={searchFocused || search ? '' : 'Search…'}
              className="flex-1 bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none"
              aria-label="Search posts"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch('')}
                  className="text-gray-600 hover:text-gray-400 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/choose-plane"
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors shrink-0"
          >
            ← Back
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-5 pb-12">
        {/* Category filter — color dot pattern */}
        {!loading && uniqueCategories.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <CategoryDot
              label="All"
              color="#6b7280"
              active={selectedCategory === null}
              count={posts.length}
              onClick={() => setSelectedCategory(null)}
            />
            {uniqueCategories.map((cat) => (
              <CategoryDot
                key={cat}
                label={cat}
                color={getCategoryColor(cat)}
                active={selectedCategory === cat}
                count={posts.filter((p) => p.category === cat).length}
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              />
            ))}
          </div>
        )}

        {/* Post list */}
        {loading ? (
          <LoadingSkeleton />
        ) : filteredPosts.length === 0 ? (
          <p className="py-16 text-center text-sm text-gray-600">
            {search
              ? `No posts matching "${search}".`
              : selectedCategory
              ? `No posts in "${selectedCategory}".`
              : 'No blog posts yet.'}
          </p>
        ) : (
          <motion.ul
            key={listKey}
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="divide-y divide-gray-800"
          >
            {filteredPosts.map((post, i) => (
              <PostRow
                key={post.slug}
                post={post}
                index={i}
                onClick={() => openPost(post)}
              />
            ))}
          </motion.ul>
        )}

        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-700">
          Life World OS blog · Technical articles and insights
        </div>
      </div>

      <BlogModal
        slug={selectedPost?.slug ?? null}
        isOpen={selectedPost !== null}
        onClose={() => setSelectedIndex(null)}
        posts={filteredPosts}
        currentIndex={selectedIndex ?? 0}
        onNavigate={navigatePost}
      />
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function CategoryDot({
  label,
  color,
  active,
  count,
  onClick,
}: {
  label: string
  color: string
  active: boolean
  count: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-xs transition-colors ${
        active ? 'text-white' : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full shrink-0 transition-opacity"
        style={{
          backgroundColor: color,
          opacity: active ? 1 : 0.4,
        }}
      />
      <span className="capitalize">{label}</span>
      <span className={`transition-colors ${active ? 'text-gray-400' : 'text-gray-700'}`}>
        {count}
      </span>
    </button>
  )
}

function PostRow({
  post,
  index,
  onClick,
}: {
  post: Omit<BlogPost, 'content'>
  index: number
  onClick: () => void
}) {
  const color = getCategoryColor(post.category)
  const [hovered, setHovered] = useState(false)

  return (
    <motion.li variants={itemVariants}>
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full text-left py-4 px-3 -mx-3 rounded transition-colors group relative"
        style={{ borderLeft: `2px solid ${hovered ? color : 'transparent'}` }}
      >
        <span className="block text-base sm:text-lg font-semibold text-white leading-snug group-hover:text-gray-100 transition-colors">
          {post.title}
        </span>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-medium" style={{ color }}>
            {post.category}
          </span>
          {post.subcategory && (
            <span className="text-xs text-gray-500">{post.subcategory}</span>
          )}
          <span className="text-xs text-gray-700">·</span>
          <span className="text-xs text-gray-400">
            {new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-gray-600">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </button>
    </motion.li>
  )
}

function LoadingSkeleton() {
  return (
    <div className="divide-y divide-gray-800 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="py-4 px-3">
          <div className="h-5 bg-gray-800 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-800 rounded w-1/4" />
        </div>
      ))}
    </div>
  )
}
