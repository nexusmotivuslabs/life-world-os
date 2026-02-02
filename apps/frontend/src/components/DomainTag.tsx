/**
 * DomainTag Component
 * 
 * Reusable component for displaying Bible Law domains (and other domains) as tag bubbles.
 * These live in the system and should be referenced consistently across the application.
 */

import { motion } from 'framer-motion'

export type BibleLawDomain = 
  | 'MONEY'
  | 'INVESTMENT'
  | 'CAREER'
  | 'BUSINESS'
  | 'RELATIONSHIPS'
  | 'LEADERSHIP'
  | 'SPIRITUAL_GROWTH'
  | 'STEWARDSHIP'
  | 'GENEROSITY'

// Team domains – must match backend TeamDomain enum
export type TeamDomain =
  | 'INVESTMENT'
  | 'TAX_OPTIMIZATION'
  | 'CASH_FLOW'
  | 'BUSINESS_ADVISORY'
  | 'COMPREHENSIVE_PLANNING'
  | 'DEBT_MANAGEMENT'
  | 'EMERGENCY_FUND'
  | 'PLATFORM_ENGINEERING'
  | 'CORE_MONEY_SYSTEM'
  | 'HEALTH_CAPACITY'
  | 'DECISION_ANALYSIS'
  | 'SKILL_DEVELOPMENT'
  | 'PROOF_BUILDING'
  | 'TRUST_BUILDING'
  | 'REPUTATION_DEFENSE'
  | 'EGO_MANAGEMENT'

interface DomainTagProps {
  domain: BibleLawDomain | TeamDomain | string
  count?: number
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

const domainConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string }> = {
  MONEY: {
    label: 'Money',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  INVESTMENT: {
    label: 'Investment',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  CAREER: {
    label: 'Career',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  BUSINESS: {
    label: 'Business',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  RELATIONSHIPS: {
    label: 'Relationships',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
  LEADERSHIP: {
    label: 'Leadership',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
  },
  SPIRITUAL_GROWTH: {
    label: 'Spiritual Growth',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  STEWARDSHIP: {
    label: 'Stewardship',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
  },
  GENEROSITY: {
    label: 'Generosity',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
  // Team domains
  TAX_OPTIMIZATION: {
    label: 'Tax Optimization',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  CASH_FLOW: {
    label: 'Cash Flow',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
  },
  BUSINESS_ADVISORY: {
    label: 'Business Advisory',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
  },
  COMPREHENSIVE_PLANNING: {
    label: 'Comprehensive Planning',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  DEBT_MANAGEMENT: {
    label: 'Debt Management',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
  EMERGENCY_FUND: {
    label: 'Emergency Fund',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
  },
  PLATFORM_ENGINEERING: {
    label: 'Platform Engineering',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
  },
  CORE_MONEY_SYSTEM: {
    label: 'Core Money System',
    color: 'text-lime-400',
    bgColor: 'bg-lime-500/10',
    borderColor: 'border-lime-500/30',
  },
  HEALTH_CAPACITY: {
    label: 'Health & Capacity',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
  },
  DECISION_ANALYSIS: {
    label: 'Decision Analysis',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  SKILL_DEVELOPMENT: {
    label: 'Skill Development',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
  },
  PROOF_BUILDING: {
    label: 'Proof Building',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  TRUST_BUILDING: {
    label: 'Trust Building',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  REPUTATION_DEFENSE: {
    label: 'Reputation Defense',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
  },
  EGO_MANAGEMENT: {
    label: 'Ego Management',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
  },
}

/** Get domain label and color config for use outside DomainTag */
export function getDomainConfig(domain: string) {
  return domainConfig[domain] || {
    label: domain.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toLowerCase()),
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
  }
}

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2',
}

export default function DomainTag({ domain, count, size = 'md', onClick, className = '' }: DomainTagProps) {
  const config = domainConfig[domain] || {
    label: domain,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
  }

  const content = (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium transition-all
        ${config.color} ${config.bgColor} ${config.borderColor}
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer hover:brightness-110' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
    >
      <span>{config.label}</span>
      {count !== undefined && (
        <span className={`${config.color}/70 text-xs font-normal`}>
          ({count})
        </span>
      )}
    </motion.span>
  )

  return content
}

/**
 * DomainTagList Component
 * 
 * Displays multiple domain tags in a flex container
 */
interface DomainTagListProps {
  domains: { domain: BibleLawDomain; count?: number }[]
  size?: 'sm' | 'md' | 'lg'
  onDomainClick?: (domain: BibleLawDomain) => void
  className?: string
}

export function DomainTagList({ domains, size = 'md', onDomainClick, className = '' }: DomainTagListProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {domains.map(({ domain, count }) => (
        <DomainTag
          key={domain}
          domain={domain}
          count={count}
          size={size}
          onClick={onDomainClick ? () => onDomainClick(domain) : undefined}
        />
      ))}
    </div>
  )
}

