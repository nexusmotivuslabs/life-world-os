import { Link } from 'react-router-dom'
import { Zap, Moon, Sun, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { getMasterRoute } from '../config/routes'
import { MasterDomain } from '../types'

/**
 * MasterEnergyCard Component
 * 
 * Dashboard card for the Master Energy System - provides access to:
 * - Base Energy visualization (Sun/Moon)
 * - Sleep logging and tracking
 * - Energy laws (Bible Laws & 48 Laws of Power)
 * - Capacity management
 * - Energy planning tools
 */
export default function MasterEnergyCard() {
  // Determine if it's day or night (simple approximation)
  const hour = new Date().getHours()
  const isDay = hour >= 6 && hour < 18

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDay ? 'bg-yellow-600/20' : 'bg-blue-600/20'}`}>
            {isDay ? (
              <Sun className="w-6 h-6 text-yellow-400" />
            ) : (
              <Moon className="w-6 h-6 text-blue-400" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Master Energy System</h2>
            <p className="text-sm text-gray-400">
              {isDay ? 'The sun that powers your day' : 'The moon that guides your night'}
            </p>
          </div>
        </div>
        <Link
          to={getMasterRoute(MasterDomain.ENERGY)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-medium flex items-center gap-2 transition-colors"
        >
          Explore
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Sleep & Rest */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-sm">Sleep-Based Restoration</h3>
          </div>
          <p className="text-xs text-gray-400">
            Base energy only restores through sleep. Log your sleep to restore energy.
          </p>
        </div>

        {/* Energy Laws */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-sm">Energy Laws</h3>
          </div>
          <p className="text-xs text-gray-400">
            Bible Laws & 48 Laws of Power applied to energy management and sleep
          </p>
        </div>

        {/* Base Energy */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            {isDay ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-blue-400" />
            )}
            <h3 className="font-semibold text-sm">Base Energy</h3>
          </div>
          <p className="text-xs text-gray-400">
            The foundation that never leaves. Highlighted like the {isDay ? 'sun' : 'moon'} on Earth.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">
            <span className="text-blue-400 font-semibold">✓</span> Sleep-based restoration
          </div>
          <div className="text-gray-400">
            <span className="text-blue-400 font-semibold">✓</span> Scientific day/night cycles
          </div>
          <div className="text-gray-400">
            <span className="text-blue-400 font-semibold">✓</span> Energy laws guidance
          </div>
        </div>
      </div>
    </motion.div>
  )
}

