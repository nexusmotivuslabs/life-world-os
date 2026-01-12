/**
 * Power Level Display
 * 
 * Displays the calculated power level with breakdown (like Destiny's Guardian system)
 */

import { Zap, Target } from 'lucide-react'
import { PowerLevelBreakdown } from '../types/loadout'

interface PowerLevelDisplayProps {
  powerLevel: PowerLevelBreakdown
}

export default function PowerLevelDisplay({ powerLevel }: PowerLevelDisplayProps) {
  const breakdownItems = [
    { label: 'Primary Weapon', value: powerLevel.primaryWeapon, color: 'text-red-400' },
    { label: 'Secondary Weapon', value: powerLevel.secondaryWeapon, color: 'text-orange-400' },
    { label: 'Grenade', value: powerLevel.grenade, color: 'text-yellow-400' },
    { label: 'Armor Ability', value: powerLevel.armorAbility, color: 'text-blue-400' },
    { label: 'Tactical Package', value: powerLevel.tacticalPackage, color: 'text-purple-400' },
    { label: 'Support Upgrade', value: powerLevel.supportUpgrade, color: 'text-cyan-400' },
  ]

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Target className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Power Level</h2>
          <p className="text-sm text-gray-400">Similar to Destiny's Guardian light level</p>
        </div>
      </div>

      {/* Total Power Level */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            <span className="text-sm text-gray-300">Total Power Level</span>
          </div>
          <span className="text-3xl font-bold text-white">{powerLevel.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Breakdown */}
      <div>
        <h3 className="font-semibold mb-3 text-gray-300">Breakdown</h3>
        <div className="space-y-2">
          {breakdownItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-2 bg-gray-700/50 rounded"
            >
              <span className="text-sm text-gray-400">{item.label}</span>
              <span className={`font-semibold ${item.color}`}>
                {item.value.toLocaleString()}
              </span>
            </div>
          ))}
          {powerLevel.synergyBonus > 0 && (
            <div className="flex items-center justify-between p-2 bg-green-500/10 rounded border border-green-500/30 mt-2">
              <span className="text-sm text-green-300">Synergy Bonus</span>
              <span className="font-semibold text-green-400">
                +{powerLevel.synergyBonus.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}





