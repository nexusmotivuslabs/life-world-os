// Step 8: Direct resource mutation disabled - UI is read-only
import { Resources } from '../types'

interface ResourceTransactionProps {
  resources: Resources
  onUpdate: () => void
}

export default function ResourceTransaction({}: ResourceTransactionProps) {
  // Step 8: Direct resource mutation disabled - UI is read-only
  // Resources can only be modified through backend mechanics (actions, decay, penalties)
  // This component now only displays resources, cannot edit them

  // Step 8: Read-only display - Resources can only be modified through backend mechanics
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Resources</h3>
        <p className="text-xs text-gray-400">Read-only (modified by backend mechanics only)</p>
      </div>
      <p className="text-gray-400 text-sm text-center py-4">
        Resources are modified through game actions, not direct transactions
      </p>
    </div>
  )
}

