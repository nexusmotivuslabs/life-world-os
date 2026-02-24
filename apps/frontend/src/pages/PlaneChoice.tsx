/**
 * Plane Choice Entry Point
 * 
 * After authentication, users choose between Knowledge Plane (read-only) 
 * and Systems Plane (executable, state-changing).
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Zap, BarChart3, ChevronRight, DollarSign, TrendingUp, HeartPulse, Target, Eye, Layers, Sword, Sparkles, Clock, FileText, Globe } from 'lucide-react'
import { loadoutApi } from '../services/loadoutApi'
import { Loadout } from '../types/loadout'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/useGameStore'
import { logger } from '../lib/logger'
import Header from '../components/Header'
import Breadcrumbs from '../components/Breadcrumbs'
import { getReleaseInfo, getReleaseStatus } from '../config/releaseStatus'
import { ReleaseStatus, getReleaseStatusLabel, getReleaseStatusColor, isFeatureSelectable } from '../types/release'

// System type for search results
type System = {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  route: string
  color: string
  bgColor: string
  status: 'active' | 'coming-soon'
  features?: string[]
}

export default function PlaneChoice() {
  const navigate = useNavigate()
  const { dashboard, fetchDashboard } = useGameStore()
  const [activeLoadout, setActiveLoadout] = useState<Loadout | null>(null)

  useEffect(() => {
    fetchDashboard()
    loadActiveLoadout()
  }, [fetchDashboard])

  const loadActiveLoadout = async () => {
    try {
      const loadout = await loadoutApi.getActiveLoadout()
      setActiveLoadout(loadout)
    } catch (error) {
      logger.error('Failed to load active loadout', error instanceof Error ? error : new Error(String(error)))
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header />

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-6xl w-full">
          <div className="mb-6">
            <Breadcrumbs />
          </div>

          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block"
            >
              <div className="mb-6 inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-2 border-indigo-400/50 rounded-full">
                <Sparkles className="w-6 h-6 text-indigo-300" />
                <span className="text-xl font-bold text-indigo-200">Choose Your Mode</span>
              </div>
            </motion.div>
            <h1 className="text-5xl font-bold mb-4">Life World OS</h1>
            <p className="text-gray-400 text-lg">
              Choose how you want to interact with your operating system
            </p>
          </div>

          {/* Live Planes Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-8 text-white">Available Now</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* 1. Systems Plane - Operate */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => navigate('/systems')}
              className="bg-gray-800 rounded-lg p-8 border-2 border-yellow-500/30 hover:border-yellow-500/60 cursor-pointer transition-all hover:scale-105 group flex flex-col h-full relative"
            >

              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-yellow-500/20 rounded-lg">
                  <Zap className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                    Systems
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                    Operate
                  </span>
                </div>
              </div>

              <p className="text-gray-300 mb-6 flex-grow">
                Operate within the world. Actions occur, consequences apply.
                Consumes energy, affected by capacity, subject to decay and burnout.
              </p>

              <div className="space-y-2">
                <div className="text-sm text-gray-400">AI Agents • Teams • Products</div>
              </div>
            </motion.div>

              {/* 2. Artifacts */}
              {(() => {
                const artifactsRelease = getReleaseInfo('artifacts')
                const artifactsStatus = getReleaseStatus('artifacts')
                const isSelectable = artifactsStatus ? isFeatureSelectable(artifactsStatus) : false
                const statusColor = artifactsStatus ? getReleaseStatusColor(artifactsStatus) : null
                
                return (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    onClick={isSelectable ? () => navigate('/knowledge/artifacts') : undefined}
                    className={`bg-gray-800 rounded-lg p-8 border-2 ${
                      isSelectable
                        ? 'border-purple-500/30 hover:border-purple-500/60 cursor-pointer transition-all hover:scale-105'
                        : 'border-gray-700/50 opacity-75 cursor-not-allowed'
                    } group flex flex-col h-full relative overflow-hidden`}
                  >

                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-purple-500/20 rounded-lg">
                        <Sparkles className="w-8 h-8 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                          Artifacts
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Collect
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-6 flex-grow">
                      Discover and collect significant pieces of your operating system.
                      Artifacts represent key resources, stats, systems, concepts, laws, and frameworks.
                    </p>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Laws & Principles • Frameworks • Weapons</div>
                    </div>
                  </motion.div>
                )
              })()}

              {/* 3. Loadouts - Weapons & Armour */}
              {(() => {
                const loadoutsStatus = getReleaseStatus('loadouts')
                const isSelectable = loadoutsStatus ? isFeatureSelectable(loadoutsStatus) : false
                return (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    onClick={isSelectable ? () => navigate('/loadouts') : undefined}
                    className={`bg-gray-800 rounded-lg p-8 border-2 ${
                      isSelectable
                        ? 'border-red-500/30 hover:border-red-500/60 cursor-pointer transition-all hover:scale-105'
                        : 'border-gray-700/50 opacity-75 cursor-not-allowed'
                    } group flex flex-col h-full relative overflow-hidden`}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-red-500/20 rounded-lg">
                        <Sword className="w-8 h-8 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors">
                          Loadouts
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                          Equip
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-6 flex-grow">
                      Weapons and armour. Equip tools, strategies, and capabilities and manage your loadout.
                    </p>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Weapons • Armour • Grenades • Tactical</div>
                    </div>
                  </motion.div>
                )
              })()}

              {/* 4. Blog - Articles & Insights */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                onClick={() => navigate('/blogs')}
                className="bg-gray-800 rounded-lg p-8 border-2 border-cyan-500/30 hover:border-cyan-500/60 cursor-pointer transition-all hover:scale-105 group flex flex-col h-full relative overflow-hidden"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-cyan-500/20 rounded-lg">
                    <FileText className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                      Blog
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Read
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 mb-6 flex-grow">
                  Technical articles and insights. Laws, principles, career strategy, and tooling.
                </p>
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Systems • Career • Tech Stack • Version Control</div>
                </div>
              </motion.div>

              {/* 5. Reality Intelligence Engine */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                onClick={() => navigate('/reality-intelligence')}
                className="bg-gray-800 rounded-lg p-8 border-2 border-orange-500/30 hover:border-orange-500/60 cursor-pointer transition-all hover:scale-105 group flex flex-col h-full relative overflow-hidden"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-orange-500/20 rounded-lg">
                    <Globe className="w-8 h-8 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
                      Reality Intelligence
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
                      Analyse
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 mb-6 flex-grow">
                  The five constraints of life. UK macro signals, early warning scoring, and strategic thesis. Select an area—Physical, Biological, Economic, Informational, or Social—then view data for that sector.
                </p>
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">Physical • Biological • Economic • Informational • Social</div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-400">Coming Soon</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Knowledge Plane - Coming Soon */}
              {(() => {
                const knowledgeRelease = getReleaseInfo('knowledge')
                const knowledgeStatus = getReleaseStatus('knowledge')
                const isSelectable = knowledgeStatus ? isFeatureSelectable(knowledgeStatus) : false
                const statusColor = knowledgeStatus ? getReleaseStatusColor(knowledgeStatus) : null
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    onClick={isSelectable ? () => navigate('/knowledge') : undefined}
                    className={`bg-gray-800/50 rounded-lg p-8 border-2 ${
                      isSelectable
                        ? 'border-gray-700/50 hover:border-gray-600 cursor-pointer transition-all hover:scale-105'
                        : 'border-gray-700/50 opacity-75 cursor-not-allowed'
                    } group flex flex-col h-full relative overflow-hidden`}
                  >
                    {/* Coming Soon Badge */}
                    {knowledgeStatus && (
                      <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full border ${statusColor?.bg} ${statusColor?.border}`}>
                        <Clock className={`w-4 h-4 ${statusColor?.text}`} />
                        <span className={`text-xs font-medium ${statusColor?.text}`}>
                          {getReleaseStatusLabel(knowledgeStatus)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-blue-500/20 rounded-lg">
                        <BookOpen className="w-8 h-8 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                          Knowledge
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Understand
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-6 flex-grow">
                      Understand the world, reason, orient, and interpret system behavior.
                      No energy consumption, no state changes, no consequences.
                    </p>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Laws • Frameworks • Guides</div>
                    </div>

                  </motion.div>
                )
              })()}

              {/* Insight Plane - Coming Soon */}
              {(() => {
                const insightRelease = getReleaseInfo('insight')
                const insightStatus = getReleaseStatus('insight')
                const isSelectable = insightStatus ? isFeatureSelectable(insightStatus) : false
                const statusColor = insightStatus ? getReleaseStatusColor(insightStatus) : null
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    onClick={isSelectable ? () => navigate('/insight') : undefined}
                    className={`bg-gray-800/50 rounded-lg p-8 border-2 ${
                      isSelectable
                        ? 'border-gray-700/50 hover:border-gray-600 cursor-pointer transition-all hover:scale-105'
                        : 'border-gray-700/50 opacity-75 cursor-not-allowed'
                    } group flex flex-col h-full relative overflow-hidden`}
                  >
                    {/* Coming Soon Badge */}
                    {insightStatus && (
                      <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full border ${statusColor?.bg} ${statusColor?.border}`}>
                        <Clock className={`w-4 h-4 ${statusColor?.text}`} />
                        <span className={`text-xs font-medium ${statusColor?.text}`}>
                          {getReleaseStatusLabel(insightStatus)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 bg-teal-500/20 rounded-lg">
                        <Eye className="w-8 h-8 text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white group-hover:text-teal-400 transition-colors">
                          Insight
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30">
                          Reflect
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-300 mb-6 flex-grow">
                      Review your performance, understand trends, and gain insights into your system behavior.
                      Analyze patterns, track progress, and make data-driven decisions.
                    </p>

                    <div className="space-y-2">
                      <div className="text-sm text-gray-400">Analytics • Trends • Reports</div>
                    </div>
                  </motion.div>
                )
              })()}

            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

