/**
 * Blog Modal Component
 *
 * Engadget-style article view: bold headline, byline, clean body typography.
 * Reference: https://www.engadget.com/tag/uk/
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { getBlogPost, BlogPost } from '../services/blogApi'
import ReactMarkdown from 'react-markdown'

interface BlogModalProps {
  slug: string | null
  isOpen: boolean
  onClose: () => void
}

export default function BlogModal({ slug, isOpen, onClose }: BlogModalProps) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && slug) {
      setLoading(true)
      setError(null)
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
            aria-hidden="true"
          />

          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto pointer-events-none sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-3xl min-h-[60vh] pointer-events-auto my-8 rounded-none shadow-2xl border-2 border-neutral-300"
              style={{ backgroundColor: '#ffffff' }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="blog-modal-title"
              tabIndex={-1}
            >
              {/* Header - Engadget style */}
              <div className="sticky top-0 border-b border-neutral-200 px-6 py-4 z-10 flex items-start justify-between gap-4" style={{ backgroundColor: '#ffffff' }}>
                <div className="flex-1 min-w-0">
                  {loading && (
                    <div className="animate-pulse">
                      <div className="h-8 bg-neutral-200 rounded w-4/5 mb-3" />
                      <div className="h-4 bg-neutral-100 rounded w-1/3" />
                    </div>
                  )}
                  {error && (
                    <div>
                      <h2 id="blog-modal-title" className="text-xl font-bold text-neutral-900 mb-2">
                        Error loading post
                      </h2>
                      <p className="text-red-600 text-sm">{error}</p>
                    </div>
                  )}
                  {post && !loading && (
                    <>
                      <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-2">
                        Article · {post.category}
                        {post.subcategory ? ` · ${post.subcategory}` : ''}
                      </p>
                      <h2
                        id="blog-modal-title"
                        className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight"
                      >
                        {post.title}
                      </h2>
                      <p className="text-sm text-neutral-500 mt-2">
                        {post.date &&
                          new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        {post.tags && post.tags.length > 0 && (
                          <span className="ml-2">
                            · {post.tags.slice(0, 3).join(', ')}
                          </span>
                        )}
                      </p>
                    </>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content - Engadget-style article body */}
              <div className="px-6 py-6 sm:py-8">
                {loading && (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-neutral-100 rounded w-full" />
                    <div className="h-4 bg-neutral-100 rounded w-4/5" />
                    <div className="h-4 bg-neutral-100 rounded w-5/6" />
                    <div className="h-32 bg-neutral-100 rounded w-full mt-6" />
                  </div>
                )}
                {error && !loading && (
                  <div className="text-center py-12">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                )}
                {post && !loading && (
                  <article className="prose prose-neutral max-w-none">
                    <div className="mb-6 pb-4 border-b border-neutral-200 text-sm text-neutral-500">
                      {Math.ceil(post.content.split(/\s+/).length / 200)} min read
                      {' · '}
                      {post.content.split(/\s+/).length.toLocaleString()} words
                    </div>
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold text-neutral-900 mt-8 mb-4 first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-bold text-neutral-900 mt-6 mb-3">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-bold text-neutral-900 mt-4 mb-2">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-neutral-700 mb-4 leading-relaxed text-[17px]">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-outside pl-6 text-neutral-700 mb-4 space-y-2 text-[17px]">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-outside pl-6 text-neutral-700 mb-4 space-y-2 text-[17px]">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        code: ({ children, className }) => {
                          const isInline = !className
                          return isInline ? (
                            <code className="bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded text-sm font-mono">
                              {children}
                            </code>
                          ) : (
                            <code className={className}>{children}</code>
                          )
                        },
                        pre: ({ children }) => (
                          <pre className="bg-neutral-100 border border-neutral-200 rounded p-4 overflow-x-auto mb-4 text-sm">
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-neutral-400 pl-4 italic text-neutral-600 my-4">
                            {children}
                          </blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 underline"
                          >
                            {children}
                          </a>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4 border border-neutral-200">
                            <table className="min-w-full">{children}</table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="border-b border-neutral-200 bg-neutral-50 px-4 py-2 text-left text-neutral-900 font-semibold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border-b border-neutral-100 px-4 py-2 text-neutral-700">
                            {children}
                          </td>
                        ),
                      }}
                    >
                      {post.content}
                    </ReactMarkdown>
                  </article>
                )}
              </div>

              {/* Footer - Engadget style */}
              {post && !loading && (
                <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 text-center">
                  <p className="text-xs text-neutral-500">
                    Life World OS · Technical articles and insights
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
