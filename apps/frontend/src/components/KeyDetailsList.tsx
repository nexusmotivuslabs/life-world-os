/**
 * KeyDetailsList Component
 *
 * Consistent bullet-point list used across the app for key details, pro tips,
 * what to avoid, examples, etc. Uses green circle bullets by default.
 */

import { Info, LucideIcon } from 'lucide-react'

export interface KeyDetailsListProps {
  /** Section title (e.g. "Key Details", "Pro Tips") */
  title?: string
  /** List items to display as bullets */
  items: string[]
  /** Icon for the header (default: Info) */
  icon?: LucideIcon
  /** Bullet accent color - Tailwind class for the circle (default: green) */
  bulletColor?: string
  /** Icon color - Tailwind class (default: blue-400) */
  iconColor?: string
  /** Show in compact variant (smaller text, less spacing) */
  compact?: boolean
  /** Optional wrapper className */
  className?: string
  /** Override inner content panel className (default: bg-gray-700/50 rounded-lg p-4) */
  contentClassName?: string
  /** Hide the title/icon header (for use inside collapsible sections) */
  hideTitle?: boolean
  /** Max items to show before truncating (undefined = show all) */
  maxItems?: number
}

export default function KeyDetailsList({
  title = 'Key Details',
  items,
  icon: Icon = Info,
  bulletColor = 'bg-green-400',
  iconColor = 'text-blue-400',
  compact = false,
  className = '',
  contentClassName,
  hideTitle = false,
  maxItems,
}: KeyDetailsListProps) {
  if (!items || items.length === 0) return null

  const displayItems = maxItems ? items.slice(0, maxItems) : items
  const hasMore = maxItems != null && items.length > maxItems

  return (
    <div className={className}>
      {!hideTitle && (
      <h4
        className={`flex items-center gap-2 font-semibold text-white mb-3 ${
          compact ? 'text-sm uppercase tracking-wide text-gray-400' : 'text-xl'
        }`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
        {title}
        {maxItems && items.length > maxItems && (
          <span className="text-xs text-gray-500 font-normal">({items.length})</span>
        )}
      </h4>
      )}
      <div className={compact ? '' : contentClassName ?? 'bg-gray-700/50 rounded-lg p-4'}>
        <ul className={compact ? 'space-y-1' : 'space-y-2'}>
          {displayItems.map((item, idx) => (
            <li
              key={idx}
              className={`text-gray-300 flex items-start gap-3 ${
                compact ? 'text-xs' : ''
              }`}
            >
              <span
                className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${bulletColor}`}
              />
              <span className="flex-1">{item}</span>
            </li>
          ))}
          {hasMore && (
            <li className="text-xs text-gray-500 pl-5">+{items.length - maxItems!} more</li>
          )}
        </ul>
      </div>
    </div>
  )
}
