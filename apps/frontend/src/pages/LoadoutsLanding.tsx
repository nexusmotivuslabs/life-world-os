/**
 * Loadouts Landing Page - COD-style
 *
 * After selecting Loadouts on choose-plane, user sees two cards:
 * Weapons and Armour. Each leads to loadout management.
 */

import { useNavigate } from 'react-router-dom'
import { Sword, Shield, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function LoadoutsLanding() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col">
      {/* COD-style header */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 min-h-[60vh]">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
              Loadouts
            </h1>
            <p className="text-gray-400 text-lg">
              Select your loadout category
            </p>
          </motion.div>

          {/* Two cards: Weapons | Armour */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Weapons card */}
            <motion.button
              type="button"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              onClick={() => navigate('/loadouts/manage')}
              className="group relative bg-gray-900/80 rounded-xl border-2 border-red-500/30 hover:border-red-500/60 p-8 sm:p-10 text-left transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/10 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/30">
                    <Sword className="w-10 h-10 text-red-400" />
                  </div>
                  <ChevronRight className="w-8 h-8 text-gray-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-red-300 transition-colors">
                  Weapons
                </h2>
                <p className="text-gray-400 text-sm sm:text-base flex-grow">
                  Primary and secondary. Equip tools and strategies that define how you engage.
                </p>
                <span className="mt-4 inline-flex items-center text-xs font-medium text-red-400/80">
                  Manage loadout
                </span>
              </div>
            </motion.button>

            {/* Armour card */}
            <motion.button
              type="button"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              onClick={() => navigate('/loadouts/manage')}
              className="group relative bg-gray-900/80 rounded-xl border-2 border-amber-500/30 hover:border-amber-500/60 p-8 sm:p-10 text-left transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/10 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/30">
                    <Shield className="w-10 h-10 text-amber-400" />
                  </div>
                  <ChevronRight className="w-8 h-8 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  Armour
                </h2>
                <p className="text-gray-400 text-sm sm:text-base flex-grow">
                  Armor ability and support. Defensive and tactical options for resilience and synergy.
                </p>
                <span className="mt-4 inline-flex items-center text-xs font-medium text-amber-400/80">
                  Manage loadout
                </span>
              </div>
            </motion.button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-gray-500 text-sm mt-8"
          >
            Both open full loadout management. Primary • Secondary • Grenade • Armor Ability • Tactical • Support
          </motion.p>
        </div>
      </div>
    </div>
  )
}
