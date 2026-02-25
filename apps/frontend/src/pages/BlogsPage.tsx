/**
 * Blogs Page
 *
 * Luno-style layout: latest posts are largest. Featured hero (latest), secondary
 * cards, category filters, then a grid of smaller cards. Clean, minimal design.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllBlogPosts, type BlogPost } from '../services/blogApi'
import BlogModal from '../components/BlogModal'

type BlogPostMeta = Omit<BlogPost, 'content'>

// Map app semantic categories to their theme colors (for placeholders and tags)
const CATEGORY_COLORS: Record<string, string> = {
  capacity: '#10b981',
  engines: '#3b82f6',
  oxygen: '#06b6d4',
  meaning: '#8b5cf6',
  optionality: '#f59e0b',
  systems: '#3b82f6',
  tech: '#06b6d4',
  career: '#f59e0b',
  'life world os': '#8b5cf6',
}

function getCategoryColor(category: string): string {
  const key = category.toLowerCase()
  return CATEGORY_COLORS[key] ?? '#6b7280'
}

/** Format date for display (e.g. "23 days ago" or "Jan 15, 2025") */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays} days ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPostMeta[]>([])
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
    // Latest first (largest in layout)
    return [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [posts, selectedCategory, search])

  const featuredPost = filteredPosts[0] ?? null
  const secondaryPosts = filteredPosts.slice(1, 3)
  const gridPosts = filteredPosts.slice(3)

  const listKey = `${selectedCategory ?? 'all'}-${search}`

  const openPost = useCallback(
    (post: BlogPostMeta) => {
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
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500 shrink-0">
            Life World OS Blog
          </span>

          <div className="flex-1 flex items-center gap-2 max-w-md border border-neutral-300 rounded-md px-3 py-1.5 focus-within:border-neutral-500 focus-within:ring-1 focus-within:ring-neutral-400 transition-colors">
            <Search className="w-4 h-4 text-neutral-500 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={searchFocused || search ? '' : 'Search…'}
              className="flex-1 bg-transparent text-sm text-neutral-800 placeholder-neutral-500 outline-none"
              aria-label="Search posts"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch('')}
                  className="text-neutral-500 hover:text-neutral-700 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/choose-plane"
            className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors shrink-0"
          >
            ← Back
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 pb-16">
        {loading ? (
          <LoadingSkeleton />
        ) : filteredPosts.length === 0 ? (
          <p className="py-16 text-center text-neutral-500">
            {search
              ? `No posts matching "${search}".`
              : selectedCategory
              ? `No posts in "${selectedCategory}".`
              : 'No blog posts yet.'}
          </p>
        ) : (
          <>
            {/* Featured row: 1 large (latest) + 2 medium */}
            <motion.section
              key={listKey}
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              {featuredPost && (
                <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-2">
                  <BlogCard
                    post={featuredPost}
                    size="featured"
                    onClick={() => openPost(featuredPost)}
                  />
                </motion.div>
              )}
              {secondaryPosts.map((post) => (
                <motion.div key={post.slug} variants={itemVariants}>
                  <BlogCard post={post} size="secondary" onClick={() => openPost(post)} />
                </motion.div>
              ))}
            </motion.section>

            {/* Category filter pills */}
            {uniqueCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-8">
                <CategoryPill
                  label="All"
                  active={selectedCategory === null}
                  onClick={() => setSelectedCategory(null)}
                />
                {uniqueCategories.map((cat) => (
                  <CategoryPill
                    key={cat}
                    label={cat}
                    active={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                  />
                ))}
              </div>
            )}

            {/* Grid of smaller cards (remaining posts) */}
            {gridPosts.length > 0 && (
              <motion.section
                key={`grid-${listKey}`}
                variants={listVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {gridPosts.map((post) => (
                  <motion.div key={post.slug} variants={itemVariants}>
                    <BlogCard post={post} size="grid" onClick={() => openPost(post)} />
                  </motion.div>
                ))}
              </motion.section>
            )}
          </>
        )}

        <div className="mt-12 pt-8 border-t border-neutral-200 text-center text-sm text-neutral-500">
          Life World OS blog · Technical articles and insights
        </div>
      </main>

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

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active
          ? 'bg-neutral-900 text-white'
          : 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300'
      }`}
    >
      {label}
    </button>
  )
}

type CardSize = 'featured' | 'secondary' | 'grid'

function BlogCard({
  post,
  size,
  onClick,
}: {
  post: BlogPostMeta
  size: CardSize
  onClick: () => void
}) {
  const color = getCategoryColor(post.category)
  const isFeatured = size === 'featured'
  const isSecondary = size === 'secondary'

  const coverHeight =
    size === 'featured' ? 'min-h-[280px] sm:min-h-[320px]' : size === 'secondary' ? 'min-h-[140px]' : 'min-h-[120px]'

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl overflow-hidden border border-neutral-200 bg-white shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200 group"
    >
      {/* Placeholder cover (gradient by category) */}
      <div
        className={`w-full ${coverHeight} flex items-end p-4 sm:p-5 transition-transform group-hover:scale-[1.02]`}
        style={{
          background: `linear-gradient(135deg, ${color}22 0%, ${color}44 50%, ${color}22 100%)`,
        }}
      >
        <span
          className="inline-block px-2.5 py-0.5 rounded text-xs font-medium text-white/90"
          style={{ backgroundColor: `${color}dd` }}
        >
          {post.category}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <h2
          className={`font-semibold text-neutral-900 leading-snug group-hover:text-neutral-700 ${
            isFeatured ? 'text-xl sm:text-2xl' : isSecondary ? 'text-base sm:text-lg' : 'text-base'
          }`}
        >
          {post.title}
        </h2>
        {post.subcategory && (
          <p className="mt-1 text-sm text-neutral-500">{post.subcategory}</p>
        )}
        <p className="mt-2 text-xs text-neutral-500">
          {formatDate(post.date)}
        </p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs text-neutral-400">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 md:row-span-2 rounded-xl bg-neutral-200 animate-pulse min-h-[320px]" />
        <div className="rounded-xl bg-neutral-200 animate-pulse min-h-[140px]" />
        <div className="rounded-xl bg-neutral-200 animate-pulse min-h-[140px]" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-20 rounded-full bg-neutral-200 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl overflow-hidden border border-neutral-200">
            <div className="h-28 bg-neutral-200 animate-pulse" />
            <div className="p-4">
              <div className="h-5 bg-neutral-200 rounded w-4/5 mb-2 animate-pulse" />
              <div className="h-3 bg-neutral-200 rounded w-1/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
