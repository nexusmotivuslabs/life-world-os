/** Renders a single computed signal description as a styled pill. */

interface Props {
  description: string
}

function classifySignal(desc: string): 'neutral' | 'warn' | 'alert' {
  const lower = desc.toLowerCase()
  if (lower.includes('inflection') || lower.includes('z-score') && parseFloat(desc.match(/[+-]?\d+\.\d+/)?.[0] ?? '0') > 1.5) return 'alert'
  if (lower.includes('yoy') || lower.includes('slope')) return 'warn'
  return 'neutral'
}

const STYLE: Record<'neutral' | 'warn' | 'alert', string> = {
  neutral: 'bg-gray-700/50 text-gray-300 border-gray-600/40',
  warn: 'bg-yellow-900/30 text-yellow-300 border-yellow-700/40',
  alert: 'bg-orange-900/30 text-orange-300 border-orange-700/40',
}

export function SignalBadge({ description }: Props) {
  const type = classifySignal(description)
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 text-xs font-mono leading-tight ${STYLE[type]}`}
    >
      {description}
    </span>
  )
}
