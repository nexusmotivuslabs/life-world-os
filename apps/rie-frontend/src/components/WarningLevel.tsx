import type { WarningLevel as WL } from '../types/rie'

const CONFIG: Record<WL, { label: string; dot: string; bg: string; border: string; text: string }> = {
  green: {
    label: 'Stable',
    dot: 'bg-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
  },
  yellow: {
    label: 'Elevated',
    dot: 'bg-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    text: 'text-yellow-400',
  },
  orange: {
    label: 'Significant',
    dot: 'bg-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
  },
  red: {
    label: 'Critical',
    dot: 'bg-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-400',
  },
}

interface Props {
  level: WL
  size?: 'sm' | 'md' | 'lg'
}

export function WarningLevelBadge({ level, size = 'md' }: Props) {
  const c = CONFIG[level]
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-4 py-1.5' : 'text-xs px-3 py-1'
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium uppercase tracking-wide ${sizeClass} ${c.bg} ${c.border} ${c.text}`}
    >
      <span className={`rounded-full ${dotSize} ${c.dot}`} />
      {c.label}
    </span>
  )
}

export function warningColor(level: WL): string {
  return CONFIG[level].text
}

export function warningStrokeColor(level: WL): string {
  const map: Record<WL, string> = {
    green: '#22c55e',
    yellow: '#facc15',
    orange: '#f97316',
    red: '#ef4444',
  }
  return map[level]
}
