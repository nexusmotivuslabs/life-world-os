/**
 * ArtifactCategoryTag Component
 *
 * Reusable tag for displaying artifact categories with consistent label and colour.
 * Maps enum values (RESOURCE, STAT, etc.) to human-readable labels (Resource, Stat) and colours.
 */

import { motion } from 'framer-motion'
import { ArtifactCategory, getArtifactCategoryConfig } from '../types/artifact'

interface ArtifactCategoryTagProps {
  category: ArtifactCategory | string
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
}

export default function ArtifactCategoryTag({
  category,
  size = 'md',
  onClick,
  className = '',
}: ArtifactCategoryTagProps) {
  const config = getArtifactCategoryConfig(category)

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      className={`
        inline-flex items-center gap-1.5 rounded border font-medium transition-all
        ${config.color} ${config.bgColor} ${config.borderColor}
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer hover:brightness-110' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {config.label}
    </motion.span>
  )
}
