/**
 * Home Page
 * 
 * Root landing page that shows System Tiers overview.
 * Navigation: Home -> System Tiers -> [System]
 */

import { Layers, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import ChoosePlaneAssistant from '../components/ChoosePlaneAssistant'
import Header from '../components/Header'
import { useNavigation } from '../hooks/useNavigation'
import { routes } from '../config/routes'

export default function HomePage() {
  const { navigateTo } = useNavigation()

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Home Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Layers className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Life World OS</h1>
                <p className="text-gray-400 text-lg mt-1">
                  Navigate systems organized by universal tier hierarchy
                </p>
              </div>
            </div>
          </div>

          {/* Choose Plane Assistant */}
          <ChoosePlaneAssistant />

          {/* Quick Navigation to System Tiers */}
          <div className="mb-8">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => navigateTo(routes.tiers.path)}
              className="w-full p-6 bg-gray-800 rounded-lg border-2 border-blue-500/30 hover:border-blue-500/60 cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Layers className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      System Tiers
                    </h2>
                    <p className="text-gray-400 mt-1">
                      Explore systems organized by universal hierarchy: Survival, Stability, Growth, Leverage, Expression
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-400 transition-colors" />
              </div>
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  )
}

