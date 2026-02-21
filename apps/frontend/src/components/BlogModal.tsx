/**
 * Blog Modal Component
 *
 * Dark-themed, content-first article reader. Includes:
 *  - Category-colored reading progress bar
 *  - Auto-generated collapsible Table of Contents (3+ headings)
 *  - Prev / Next navigation via plain text links
 *  - Tags as quiet comma-separated metadata
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronDown } from 'lucide-react'
import { getBlogPost, type BlogPost } from '../services/blogApi'
import ReactMarkdown from 'react-markdown'

const CATEGORY_COLORS: Record<string, string> = {
  capacity: '#10b981',
  engines: '#3b82f6',
  oxygen: '#06b6d4',
  meaning: '#8b5cf6',
  optionality: '#f59e0b',
}

function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category?.toLowerCase()] ?? '#6b7280'
}

interface TocEntry {
  level: 2 | 3
  text: string
  id: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function extractToc(markdown: string): TocEntry[] {
  const lines = markdown.split('\n')
  const entries: TocEntry[] = []
  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)/)
    const h3 = line.match(/^###\s+(.+)/)
    if (h3) {
      const text = h3[1].trim()
      entries.push({ level: 3, text, id: slugify(text) })
    } else if (h2) {
      const text = h2[1].trim()
      entries.push({ level: 2, text, id: slugify(text) })
    }
  }
  return entries
}

interface BlogModalProps {
  slug: string | null
  isOpen: boolean
  onClose: () => void
  posts?: Omit<BlogPost, 'content'>[]
  currentIndex?: number
  onNavigate?: (index: number) => void
}

export default function BlogModal({
  slug,
  isOpen,
  onClose,
  posts = [],
  currentIndex = 0,
  onNavigate,
}: BlogModalProps) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [tocOpen, setTocOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load post when slug changes
  useEffect(() => {
    if (isOpen && slug) {
      setLoading(true)
      setError(null)
      setProgress(0)
      setTocOpen(false)
      getBlogPost(slug)
        .then((postData) => {
          if (postData) setPost(postData)
          else setError('Blog post not found')
          setLoading(false)
        })
        .catch((err) => {
          if (err.message?.includes('Authentication required')) {
            setError('Please log in to access blog posts')
          } else {
            setError(err.message || 'Failed to load blog post')
          }
          setLoading(false)
        })
    } else {
      setPost(null)
    }
  }, [isOpen, slug])

  // Reset scroll position when post changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
      setProgress(0)
    }
  }, [slug])

  // Keyboard: Escape to close, arrow keys to navigate
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNavigate(currentIndex + 1)
      if (e.key === 'ArrowLeft') onNavigate(currentIndex - 1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose, onNavigate, currentIndex])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const scrollable = el.scrollHeight - el.clientHeight
    setProgress(scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0)
  }, [])

  const toc = post ? extractToc(post.content) : []
  const showToc = toc.length >= 3
  const accentColor = post ? getCategoryColor(post.category) : '#6b7280'

  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 z-50"
            aria-hidden="true"
          />

          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-hidden sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-3xl flex flex-col my-8 rounded-lg shadow-2xl border border-gray-700 bg-gray-900 overflow-hidden"
              style={{ maxHeight: 'calc(100vh - 4rem)' }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="blog-modal-title"
            >
              {/* Reading progress bar */}
              <div className="h-0.5 w-full bg-gray-800 shrink-0">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: accentColor, width: `${progress}%` }}
                  transition={{ duration: 0.05 }}
                />
              </div>

              {/* Sticky header */}
              <div className="shrink-0 border-b border-gray-800 px-6 py-4 flex items-start justify-between gap-4 bg-gray-900">
                <div className="flex-1 min-w-0">
                  {loading && (
                    <div className="animate-pulse space-y-2">
                      <div className="h-7 bg-gray-800 rounded w-4/5" />
                      <div className="h-3 bg-gray-800 rounded w-1/3" />
                    </div>
                  )}
                  {error && (
                    <div>
                      <h2 id="blog-modal-title" className="text-xl font-bold text-white mb-1">
                        Error loading post
                      </h2>
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}
                  {post && !loading && (
                    <>
                      {/* Category breadcrumb */}
                      <p className="text-xs mb-2 flex items-center gap-1.5">
                        <span
                          className="inline-block w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: accentColor }}
                        />
                        <span className="font-medium capitalize" style={{ color: accentColor }}>
                          {post.category}
                        </span>
                        {post.subcategory && (
                          <>
                            <span className="text-gray-700">·</span>
                            <span className="text-gray-500">{post.subcategory}</span>
                          </>
                        )}
                      </p>
                      <h2
                        id="blog-modal-title"
                        className="text-xl sm:text-2xl font-bold text-white leading-snug"
                      >
                        {post.title}
                      </h2>
                      {/* Byline: date only — tags moved to end of article */}
                      <p className="text-xs text-gray-400 mt-2">
                        {post.date &&
                          new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                      </p>
                    </>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable content */}
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto"
              >
                <div className="px-6 py-6 sm:py-8">
                  {loading && (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-4 bg-gray-800 rounded w-full" />
                      <div className="h-4 bg-gray-800 rounded w-4/5" />
                      <div className="h-4 bg-gray-800 rounded w-5/6" />
                      <div className="h-32 bg-gray-800 rounded w-full mt-6" />
                    </div>
                  )}

                  {error && !loading && (
                    <div className="text-center py-12">
                      <p className="text-red-400 mb-4">{error}</p>
                      <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-800 text-gray-300 text-sm font-medium hover:bg-gray-700 rounded transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  )}

                  {post && !loading && (
                    <article>
                      {/* Reading meta */}
                      <div className="mb-5 pb-4 border-b border-gray-800 flex items-center gap-3 text-xs text-gray-600">
                        <span>{Math.ceil(post.content.split(/\s+/).length / 200)} min read</span>
                        <span>·</span>
                        <span>{post.content.split(/\s+/).length.toLocaleString()} words</span>
                      </div>

                      {/* Collapsible Table of Contents */}
                      {showToc && (
                        <div className="mb-6 border border-gray-800 rounded-md overflow-hidden">
                          <button
                            onClick={() => setTocOpen((v) => !v)}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors"
                          >
                            <span className="font-medium uppercase tracking-wider">Contents</span>
                            {tocOpen ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <AnimatePresence initial={false}>
                            {tocOpen && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                transition={{ duration: 0.18 }}
                                className="overflow-hidden"
                              >
                                <ul className="px-4 pb-3 pt-1 space-y-1.5 border-t border-gray-800">
                                  {toc.map((entry) => (
                                    <li
                                      key={entry.id}
                                      className={entry.level === 3 ? 'pl-3' : ''}
                                    >
                                      <a
                                        href={`#${entry.id}`}
                                        onClick={() => {
                                          const el = scrollRef.current?.querySelector(`#${entry.id}`)
                                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                        }}
                                        className="text-xs text-gray-500 hover:text-gray-200 transition-colors"
                                      >
                                        {entry.text}
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Article body */}
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1
                              id={slugify(String(children))}
                              className="text-2xl font-bold text-white mt-8 mb-4 first:mt-0"
                            >
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2
                              id={slugify(String(children))}
                              className="text-xl font-bold text-white mt-7 mb-3"
                            >
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3
                              id={slugify(String(children))}
                              className="text-base font-semibold text-gray-100 mt-5 mb-2"
                            >
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-gray-300 mb-4 leading-relaxed text-[16px]">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-outside pl-6 text-gray-300 mb-4 space-y-1.5 text-[16px]">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-outside pl-6 text-gray-300 mb-4 space-y-1.5 text-[16px]">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="leading-relaxed">{children}</li>
                          ),
                          code: ({ children, className }) => {
                            const isInline = !className
                            return isInline ? (
                              <code className="bg-gray-800 text-gray-200 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-700">
                                {children}
                              </code>
                            ) : (
                              <code className={className}>{children}</code>
                            )
                          },
                          pre: ({ children }) => (
                            <pre className="bg-gray-800 border border-gray-700 rounded-md p-4 overflow-x-auto mb-4 text-sm text-gray-300">
                              {children}
                            </pre>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-2 border-gray-600 pl-4 italic text-gray-400 my-4">
                              {children}
                            </blockquote>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 underline transition-colors"
                            >
                              {children}
                            </a>
                          ),
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-4 border border-gray-700 rounded-md">
                              <table className="min-w-full">{children}</table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th className="border-b border-gray-700 bg-gray-800 px-4 py-2 text-left text-gray-200 font-semibold text-sm">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border-b border-gray-800 px-4 py-2 text-gray-400 text-sm">
                              {children}
                            </td>
                          ),
                          hr: () => <hr className="border-gray-800 my-6" />,
                        }}
                      >
                        {post.content}
                      </ReactMarkdown>

                      {/* Tags — end of article, useful for discovery */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="mt-8 pt-5 border-t border-gray-800">
                          <p className="text-xs text-gray-600 uppercase tracking-wider mb-2.5">
                            Filed under
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs text-gray-400 bg-gray-800 border border-gray-700 px-2.5 py-1 rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  )}
                </div>

                {/* Prev / Next navigation */}
                {post && !loading && (prevPost || nextPost) && (
                  <div className="px-6 pb-8 pt-2 border-t border-gray-800 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      {prevPost && (
                        <button
                          onClick={() => onNavigate(currentIndex - 1)}
                          className="group text-left"
                        >
                          <p className="text-xs text-gray-600 mb-0.5">← Previous</p>
                          <p className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors leading-snug line-clamp-2">
                            {prevPost.title}
                          </p>
                        </button>
                      )}
                    </div>
                    <div className="flex-1 text-right">
                      {nextPost && (
                        <button
                          onClick={() => onNavigate(currentIndex + 1)}
                          className="group text-right"
                        >
                          <p className="text-xs text-gray-600 mb-0.5">Next →</p>
                          <p className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors leading-snug line-clamp-2">
                            {nextPost.title}
                          </p>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
