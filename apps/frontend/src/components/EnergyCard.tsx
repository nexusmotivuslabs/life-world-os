import { Battery, BatteryLow, BatteryMedium, BatteryFull } from 'lucide-react'

interface EnergyCardProps {
  current: number
  usable: number
  cap: number
  isInBurnout?: boolean
}

export default function EnergyCard({ current, usable, cap, isInBurnout }: EnergyCardProps) {
  const percentage = (usable / cap) * 100
  
  // Choose battery icon based on percentage
  let BatteryIcon = Battery
  let colorClass = 'text-gray-400'
  
  if (percentage > 75) {
    BatteryIcon = BatteryFull
    colorClass = 'text-green-500'
  } else if (percentage > 50) {
    BatteryIcon = BatteryFull // Using BatteryFull instead of BatteryHigh (not available in lucide-react)
    colorClass = 'text-green-400'
  } else if (percentage > 25) {
    BatteryIcon = BatteryMedium
    colorClass = 'text-yellow-500'
  } else {
    BatteryIcon = BatteryLow
    colorClass = 'text-red-500'
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BatteryIcon className={`w-5 h-5 ${colorClass}`} />
          <span className="text-sm font-medium text-gray-300">Energy</span>
        </div>
        <span className="text-sm text-gray-400">{usable} / {cap}</span>
      </div>
      
      {/* Energy bar */}
      <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
        <div
          className={`h-3 rounded-full transition-all ${
            percentage > 75
              ? 'bg-green-500'
              : percentage > 50
              ? 'bg-green-400'
              : percentage > 25
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="text-xs text-gray-500">
        {isInBurnout && <span className="text-red-400">Burnout: cap reduced to 40</span>}
        {!isInBurnout && current !== usable && (
          <span>Base: {current} (capped at {cap} by Capacity)</span>
        )}
        {!isInBurnout && current === usable && (
          <span>Daily budget: {cap} (resets at daily tick)</span>
        )}
      </div>
    </div>
  )
}

