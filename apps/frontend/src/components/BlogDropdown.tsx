/**
 * Blog Dropdown Component
 *
 * Engadget-style dropdown: "Latest" section, tag-style categories, headline list.
 * Reference: https://www.engadget.com/tag/uk/
 */

import { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, X } from 'lucide-react'
import { getAllBlogPosts, getBlogCategories, type BlogCategory } from '../services/blogApi'
import { motion, AnimatePresence } from 'framer-motion'

interface BlogDropdownProps {
  onPostSelect: (slug: string) => void
}

export default function BlogDropdown({ onPostSelect }: BlogDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [posts, setPosts] = useState<Awaited<ReturnType<typeof getAllBlogPosts>>>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([getAllBlogPosts(), getBlogCategories()])
      .then(([postsData, categoriesData]) => {
        setPosts(postsData)
        setCategories(categoriesData)
      })
      .catch((error) => {
        console.error('Error loading blog data:', error)
        if (error instanceof Error && error.message.includes('Authentication required')) {
          setPosts([])
          setCategories([])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return posts
    return posts.filter((post) => post.category === selectedCategory)
  }, [posts, selectedCategory])

  const handlePostClick = (slug: string) => {
    onPostSelect(slug)
    setIsOpen(false)
    setSelectedCategory(null)
  }

  const uniqueCategories = useMemo(() => {
    const set = new Set(posts.map((post) => post.category))
    return Array.from(set).sort()
  }, [posts])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-200 hover:text-white hover:bg-white/10 rounded transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span>Blog</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1 w-[420px] rounded-none shadow-2xl z-[100] overflow-hidden bg-white border border-neutral-300"
            style={{ background: '#ffffff' }}
          >
            {/* Black bar - Engadget "Latest" style */}
            <div className="px-4 py-2.5 bg-black text-white border-b border-black">
              <span className="text-xs font-bold uppercase tracking-widest text-white">
                Latest
              </span>
              <span className="ml-2 text-neutral-400 text-xs">· Life World OS Blog</span>
            </div>
            {/* Tag bar */}
            <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {!loading && uniqueCategories.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                        !selectedCategory
                          ? 'bg-black text-white'
                          : 'text-neutral-600 hover:text-black hover:bg-neutral-200'
                      }`}
                    >
                      All
                    </button>
                    {uniqueCategories.map((cat) => {
                      const count = posts.filter((p) => p.category === cat).length
                      const active = selectedCategory === cat
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                            active
                              ? 'bg-black text-white'
                              : 'text-neutral-600 hover:text-black hover:bg-neutral-200'
                          }`}
                        >
                          {cat}
                          {count > 0 && (
                            <span className="ml-1 opacity-70">({count})</span>
                          )}
                        </button>
                      )
                    })}
                    {selectedCategory && (
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="p-1 text-neutral-400 hover:text-black"
                        title="Clear filter"
                        aria-label="Clear filter"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Headlines list - Engadget style */}
            <div className="max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="px-4 py-8 text-center text-neutral-500 text-sm">
                  Loading…
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="px-4 py-8 text-center text-neutral-500 text-sm">
                  {selectedCategory ? `No posts in "${selectedCategory}"` : 'No posts yet.'}
                </div>
              ) : (
                <ul className="py-2">
                  {filteredPosts.map((post) => (
                    <li key={post.slug}>
                      <button
                        onClick={() => handlePostClick(post.slug)}
                        className="w-full text-left px-4 py-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0 group"
                      >
                        <span className="block font-semibold text-black group-hover:text-blue-600 transition-colors text-[15px] leading-snug" style={{ color: '#111' }}>
                          {post.title}
                        </span>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-neutral-500">
                            {post.category}
                            {post.subcategory ? ` · ${post.subcategory}` : ''}
                          </span>
                          <span className="text-xs text-neutral-400">
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
            </div>

            {/* Newsletter CTA - Engadget style footer hint */}
            {!loading && filteredPosts.length > 0 && (
              <div className="px-4 py-3 border-t border-neutral-200 bg-neutral-50">
                <p className="text-xs text-neutral-500">
                  Life World OS blog · Technical articles and insights
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
