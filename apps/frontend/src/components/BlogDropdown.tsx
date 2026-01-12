/**
 * Blog Dropdown Component
 * 
 * Dropdown menu in header for accessing blog posts with category filtering
 */

import { useState, useRef, useEffect, useMemo } from 'react'
import { BookOpen, ChevronDown, Filter, X } from 'lucide-react'
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
    // Check authentication before loading blog posts
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([
      getAllBlogPosts(),
      getBlogCategories()
    ])
      .then(([postsData, categoriesData]) => {
        setPosts(postsData)
        setCategories(categoriesData)
      })
      .catch((error) => {
        console.error('Error loading blog data:', error)
        // If authentication error, clear posts
        if (error instanceof Error && error.message.includes('Authentication required')) {
          setPosts([])
          setCategories([])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Filter posts by selected category
  const filteredPosts = useMemo(() => {
    if (!selectedCategory) {
      return posts
    }
    return posts.filter(post => post.category === selectedCategory)
  }, [posts, selectedCategory])

  const handlePostClick = (slug: string) => {
    onPostSelect(slug)
    setIsOpen(false)
    setSelectedCategory(null) // Reset filter when closing
  }

  const handleCategoryClick = (categoryName: string | null) => {
    setSelectedCategory(categoryName)
  }

  // Get unique categories from posts
  const uniqueCategories = useMemo(() => {
    const categorySet = new Set(posts.map(post => post.category))
    return Array.from(categorySet).sort()
  }, [posts])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm font-medium transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <BookOpen className="w-4 h-4" />
        <span>Blog</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            <div className="p-4">
              {/* Category Filter Section */}
              {!loading && uniqueCategories.length > 0 && (
                <div className="mb-4 pb-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-300">Categories</span>
                    </div>
                    {selectedCategory && (
                      <button
                        onClick={() => handleCategoryClick(null)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                        title="Clear filter"
                      >
                        <X className="w-3 h-3" />
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleCategoryClick(null)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        !selectedCategory
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      All ({posts.length})
                    </button>
                    {uniqueCategories.map((category) => {
                      const count = posts.filter(p => p.category === category).length
                      return (
                        <button
                          key={category}
                          onClick={() => handleCategoryClick(category)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                            selectedCategory === category
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {category} ({count})
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Posts List */}
              {loading ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  Loading blog posts...
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  {selectedCategory 
                    ? `No posts in "${selectedCategory}" category`
                    : 'No blog posts available'
                  }
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {filteredPosts.map((post) => (
                    <button
                      key={post.slug}
                      onClick={() => handlePostClick(post.slug)}
                      className="w-full text-left p-3 hover:bg-gray-700 rounded-md transition-colors group mb-2 last:mb-0"
                    >
                      <div className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {post.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-blue-400 font-medium">
                          {post.category}
                        </span>
                        {post.subcategory && (
                          <>
                            <span className="text-xs text-gray-500">→</span>
                            <span className="text-xs text-gray-400">
                              {post.subcategory}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

