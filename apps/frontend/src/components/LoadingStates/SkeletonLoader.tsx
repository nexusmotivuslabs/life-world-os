/**
 * SkeletonLoader Component
 * 
 * Provides skeleton loading states for initial data loads.
 * Shows placeholder content while data is being fetched.
 */

import { motion } from 'framer-motion'

interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'list' | 'table'
  count?: number
  className?: string
}

export default function SkeletonLoader({
  variant = 'card',
  count = 1,
  className = '',
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return (
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-700 rounded w-1/2 animate-pulse" />
          </div>
        )

      case 'card':
        return (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="space-y-4">
              <div className="h-6 bg-gray-700 rounded w-2/3 animate-pulse" />
              <div className="h-4 bg-gray-700 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse" />
              <div className="flex gap-2 mt-4">
                <div className="h-8 bg-gray-700 rounded w-24 animate-pulse" />
                <div className="h-8 bg-gray-700 rounded w-24 animate-pulse" />
              </div>
            </div>
          </div>
        )

      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700"
              >
                <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-1/3 animate-pulse" />
                  <div className="h-3 bg-gray-700 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )

      case 'table':
        return (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <div className="h-5 bg-gray-700 rounded w-1/4 animate-pulse" />
            </div>
            <div className="divide-y divide-gray-700">
              {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <div className="h-4 bg-gray-700 rounded w-1/4 animate-pulse" />
                  <div className="h-4 bg-gray-700 rounded w-1/4 animate-pulse" />
                  <div className="h-4 bg-gray-700 rounded w-1/4 animate-pulse" />
                  <div className="h-4 bg-gray-700 rounded w-1/4 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {variant === 'list' || variant === 'table' ? (
        renderSkeleton()
      ) : (
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {renderSkeleton()}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}


