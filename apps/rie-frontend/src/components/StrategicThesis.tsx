import type { ConstraintResult } from '../types/rie'
import { WarningLevelBadge } from './WarningLevel'

interface Props {
  constraint: ConstraintResult
}

export function StrategicThesis({ constraint }: Props) {
  return (
    <div className="space-y-4">
      {/* Warning + Thesis */}
      <div className="flex flex-wrap items-start gap-3">
        <WarningLevelBadge level={constraint.warning_level} size="md" />
        <p className="flex-1 text-sm font-medium leading-snug text-gray-100">
          {constraint.thesis}
        </p>
      </div>

      {/* Implications */}
      {constraint.implications.length > 0 && (
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Positioning Implications
          </div>
          <ul className="space-y-1">
            {constraint.implications.map((imp, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-300 leading-snug">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-500" />
                {imp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disconfirming Conditions */}
      {constraint.disconfirming_conditions.length > 0 && (
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Disconfirming Conditions
          </div>
          <ul className="space-y-1">
            {constraint.disconfirming_conditions.map((cond, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-400 leading-snug">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-600" />
                {cond}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
