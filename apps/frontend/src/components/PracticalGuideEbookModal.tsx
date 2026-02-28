/**
 * PracticalGuideEbookModal
 *
 * Ebook-style modal for reading agent practical guides: cover, progress bar,
 * table of contents, and optional copy/download (like downloading an ebook).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { X, ChevronRight, ChevronDown, Copy, Download, BookOpen, Lock } from 'lucide-react'
import type { PracticalGuide } from '../services/financeApi'

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

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

function estimatedMinutes(content: string, meta?: { estimatedReadMinutes?: number }): number {
  if (meta?.estimatedReadMinutes != null) return meta.estimatedReadMinutes
  return Math.max(1, Math.ceil(wordCount(content) / 200))
}

export interface PracticalGuideEbookModalProps {
  guide: PracticalGuide | null
  loading: boolean
  onClose: () => void
}

export default function PracticalGuideEbookModal({ guide, loading, onClose }: PracticalGuideEbookModalProps) {
  const [progress, setProgress] = useState(0)
  const [tocOpen, setTocOpen] = useState(true)
  const [copied, setCopied] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const scrollable = el.scrollHeight - el.clientHeight
    setProgress(scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
      setProgress(0)
    }
  }, [guide?.id])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const toc = guide?.content ? extractToc(guide.content) : []
  const showToc = toc.length >= 2
  const readMinutes = guide ? estimatedMinutes(guide.content, guide.metadata as { estimatedReadMinutes?: number }) : 0

  const handleCopy = useCallback(() => {
    if (!guide) return
    const text = `# ${guide.title}\n\nby ${guide.agent.name}\n\n${guide.shortDescription}\n\n---\n\n${guide.content}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [guide])

  const handleDownload = useCallback(() => {
    if (!guide) return
    const blob = new Blob(
      [`# ${guide.title}\n\nby ${guide.agent.name}\n\n${guide.shortDescription}\n\n---\n\n${guide.content}`],
      { type: 'text/markdown' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${guide.slug || 'guide'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [guide])

  const isOpen = guide !== null || loading
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-amber-900/40 bg-gradient-to-b from-gray-900 to-gray-950 pointer-events-auto overflow-hidden"
          style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(251,191,36,0.08)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ebook-guide-title"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Reading progress bar */}
          <div className="h-1 w-full bg-gray-800 shrink-0">
            <motion.div
              className="h-full bg-amber-500/90"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.05 }}
            />
          </div>

          {/* Ebook header / cover */}
          <div className="shrink-0 border-b border-gray-800/80 px-6 sm:px-8 pt-6 pb-5 bg-gray-900/60">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {loading && (
                  <div className="animate-pulse space-y-3">
                    <div className="h-8 bg-gray-800 rounded w-3/4" />
                    <div className="h-4 bg-gray-800 rounded w-1/2" />
                    <div className="h-4 bg-gray-800 rounded w-full mt-2" />
                  </div>
                )}
                {guide && !loading && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      {guide.agent?.avatar && (
                        <span className="text-3xl" aria-hidden="true">
                          {guide.agent.avatar}
                        </span>
                      )}
                      <span className="text-xs font-medium text-amber-500/90 uppercase tracking-wider">
                        Practical Guide
                      </span>
                      {guide.tier === 'PREMIUM' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                    </div>
                    <h1
                      id="ebook-guide-title"
                      className="text-xl sm:text-2xl font-bold text-white leading-tight tracking-tight"
                    >
                      {guide.title}
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">by {guide.agent?.name ?? 'Agent'}</p>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{guide.shortDescription}</p>
                    <p className="text-xs text-gray-600 mt-2">{readMinutes} min read</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {guide && !loading && (
                  <>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-2 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-gray-800 transition-colors"
                      title="Copy as text"
                      aria-label="Copy guide to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="p-2 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-gray-800 transition-colors"
                      title="Download as Markdown"
                      aria-label="Download guide as file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {copied && (
              <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                <Copy className="w-3 h-3" /> Copied to clipboard
              </p>
            )}
          </div>

          {/* Scrollable body */}
          <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto min-h-0">
            <div className="px-6 sm:px-8 py-6">
              {loading && (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-gray-800 rounded w-full" />
                  <div className="h-4 bg-gray-800 rounded w-5/6" />
                  <div className="h-4 bg-gray-800 rounded w-4/5" />
                  <div className="h-24 bg-gray-800 rounded w-full mt-6" />
                </div>
              )}

              {guide && !loading && (
                <article className="max-w-none">
                  {/* Table of contents */}
                  {showToc && (
                    <div className="mb-6 border border-gray-800 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setTocOpen((v) => !v)}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors"
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <BookOpen className="w-4 h-4 text-amber-500/80" />
                          Contents
                        </span>
                        {tocOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
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
                            <ul className="px-4 pb-4 pt-2 border-t border-gray-800 space-y-2">
                              {toc.map((entry) => (
                                <li key={entry.id} className={entry.level === 3 ? 'pl-4' : ''}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const el = scrollRef.current?.querySelector(`#${entry.id}`)
                                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                                    }}
                                    className="text-left text-sm text-gray-500 hover:text-amber-400 transition-colors"
                                  >
                                    {entry.text}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Guide content */}
                  <div className="prose-guide">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1
                            id={slugify(String(children))}
                            className="text-xl font-bold text-white mt-8 mb-4 first:mt-0"
                          >
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2
                            id={slugify(String(children))}
                            className="text-lg font-bold text-white mt-7 mb-3"
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
                          <p className="text-gray-300 mb-4 leading-relaxed">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc list-outside pl-6 text-gray-300 mb-4 space-y-1.5">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal list-outside pl-6 text-gray-300 mb-4 space-y-1.5">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        code: ({ children, className }) =>
                          !className ? (
                            <code className="bg-gray-800 text-amber-200/90 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-700">
                              {children}
                            </code>
                          ) : (
                            <code className={className}>{children}</code>
                          ),
                        pre: ({ children }) => (
                          <pre className="bg-gray-800 border border-gray-700 rounded-lg p-4 overflow-x-auto mb-4 text-sm text-gray-300">
                            {children}
                          </pre>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-amber-500/40 pl-4 italic text-gray-400 my-4">
                            {children}
                          </blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-400 hover:text-amber-300 underline"
                          >
                            {children}
                          </a>
                        ),
                        hr: () => <hr className="border-gray-800 my-6" />,
                      }}
                    >
                      {guide.content}
                    </ReactMarkdown>
                  </div>
                </article>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
