/**
 * Blog Modal Component
 * 
 * Displays blog posts in a modal with markdown rendering
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Tag, FolderOpen } from 'lucide-react'
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
          if (postData) {
            setPost(postData)
          } else {
            setError('Blog post not found')
          }
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

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto border border-gray-700"
              role="dialog"
              aria-modal="true"
              aria-labelledby="blog-modal-title"
              tabIndex={-1}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    ) : error ? (
                      <div>
                        <h2 id="blog-modal-title" className="text-2xl font-bold text-white mb-2">
                          Error Loading Blog Post
                        </h2>
                        <p className="text-red-400">{error}</p>
                      </div>
                    ) : post ? (
                      <>
                        <h2 id="blog-modal-title" className="text-2xl font-bold text-white mb-2">
                          {post.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          {post.category && (
                            <div className="flex items-center gap-1">
                              <FolderOpen className="w-4 h-4" />
                              <span>{post.category}</span>
                              {post.subcategory && <span> → {post.subcategory}</span>}
                            </div>
                          )}
                          {post.date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(post.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                          )}
                        </div>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {post.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                              >
                                <Tag className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors ml-4"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                {loading ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                    <div className="h-32 bg-gray-700 rounded w-full mt-6"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : post ? (
                  <div className="prose prose-invert prose-lg max-w-none">
                    {/* Reading Progress Indicator */}
                    <div className="mb-6 pb-4 border-b border-gray-700">
                      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                        <span>Estimated reading time: {Math.ceil(post.content.split(/\s+/).length / 200)} min</span>
                        <span>{post.content.split(/\s+/).length.toLocaleString()} words</span>
                      </div>
                    </div>
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-3xl font-bold text-white mb-4 mt-6 first:mt-0">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-2xl font-bold text-white mb-3 mt-6">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-xl font-bold text-white mb-2 mt-4">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-inside text-gray-300 mb-4 space-y-2">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside text-gray-300 mb-4 space-y-2">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-gray-300">{children}</li>
                        ),
                        code: ({ children, className }) => {
                          const isInline = !className
                          return isInline ? (
                            <code className="bg-gray-900 text-blue-400 px-1.5 py-0.5 rounded text-sm">
                              {children}
                            </code>
                          ) : (
                            <code className={className}>{children}</code>
                          )
                        },
                        pre: ({ children }) => (
                          <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4 border border-gray-700">
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 my-4">
                            {children}
                          </blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 underline"
                          >
                            {children}
                          </a>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto mb-4">
                            <table className="min-w-full border border-gray-700">
                              {children}
                            </table>
                          </div>
                        ),
                        th: ({ children }) => (
                          <th className="border border-gray-700 bg-gray-900 px-4 py-2 text-left text-white font-semibold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border border-gray-700 px-4 py-2 text-gray-300">
                            {children}
                          </td>
                        ),
                      }}
                    >
                      {post.content}
                    </ReactMarkdown>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

