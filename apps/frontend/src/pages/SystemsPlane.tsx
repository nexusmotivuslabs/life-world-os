/**
 * Systems Plane Dashboard
 * 
 * Executable, state-changing systems. Actions occur, consequences apply.
 * Consumes energy, affected by capacity, subject to decay and burnout.
 */

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useGameStore } from '../store/useGameStore'
import OverallRankBadge from '../components/OverallRankBadge'
import SeasonIndicator from '../components/SeasonIndicator'
import CloudGauge from '../components/CloudGauge'
import ResourceCard from '../components/ResourceCard'
import EnergyCard from '../components/EnergyCard'
import CategoryXPBar from '../components/CategoryXPBar'
import BalanceIndicator from '../components/BalanceIndicator'
import ActivityXPCalculator from '../components/ActivityXPCalculator'
import EnginesManager from '../components/EnginesManager'
import ResourceTransaction from '../components/ResourceTransaction'
import ActivityHistory from '../components/ActivityHistory'
import MilestonesView from '../components/MilestonesView'
import QuickActions from '../components/QuickActions'
import { ToastContainer } from '../components/Toast'
import { useToastStore } from '../store/useToastStore'
import SystemGuide from '../components/SystemGuide'
import OnboardingQuestionnaire from '../components/OnboardingQuestionnaire'
import TrainingCenter from '../components/TrainingCenter'
import InvestmentManager from '../components/InvestmentManager'
import PortfolioRebalancingConfig from '../components/PortfolioRebalancingConfig'
import PortfolioRebalancingStatus from '../components/PortfolioRebalancingStatus'
import RebalancingRecommendations from '../components/RebalancingRecommendations'
import { Settings, DollarSign, Zap, ChevronRight, HeartPulse, TrendingUp, Target, MapPin, Search, Layers, Lock, BookOpen } from 'lucide-react'
import ExploreSystems from '../components/ExploreSystems'
import { Season } from '../types'
import { questionnaireApi } from '../services/api'
import { getMasterRoute } from '../config/routes'
import { MasterDomain } from '../types'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { realityNodeApi, type RealityNode } from '../services/financeApi'
import { getNodeTypeDisplayName, getCategoryDisplayName } from '../utils/realityNodeDisplay'
import { logger } from '../lib/logger'

export default function SystemsPlane() {
  const { dashboard, loading, error, fetchDashboard, isDemo, hasCompletedQuestionnaire, setQuestionnaireStatus } = useGameStore()
  const { toasts, removeToast } = useToastStore()
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [checkingQuestionnaire, setCheckingQuestionnaire] = useState(true)
  const [showRebalancingConfig, setShowRebalancingConfig] = useState(false)
  const [realityNode, setRealityNode] = useState<RealityNode | null>(null)
  const [constraintsNode, setConstraintsNode] = useState<RealityNode | null>(null)
  const [loadingReality, setLoadingReality] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  // Load REALITY and CONSTRAINTS_OF_REALITY for Systems Plane overview
  useEffect(() => {
    const loadRealityNodes = async () => {
      try {
        setLoadingReality(true)
        const realityResponse = await realityNodeApi.getNode('reality-root')
        setRealityNode(realityResponse.node)
        const constraintsResponse = await realityNodeApi.getNode('constraints-of-reality')
        setConstraintsNode(constraintsResponse.node)
      } catch (error) {
        logger.error('Error loading reality nodes', error instanceof Error ? error : new Error(String(error)))
      } finally {
        setLoadingReality(false)
      }
    }
    loadRealityNodes()
  }, [])

  // Check questionnaire status on mount
  useEffect(() => {
    const checkQuestionnaireStatus = async () => {
      if (isDemo) {
        setCheckingQuestionnaire(false)
        return
      }

      try {
        const status = await questionnaireApi.getStatus()
        setQuestionnaireStatus(status.hasCompletedQuestionnaire)
        if (!status.hasCompletedQuestionnaire) {
          setShowQuestionnaire(true)
        }
      } catch (error) {
        logger.error('Failed to check questionnaire status', error instanceof Error ? error : new Error(String(error)))
      } finally {
        setCheckingQuestionnaire(false)
      }
    }

    checkQuestionnaireStatus()
  }, [isDemo, setQuestionnaireStatus])

  const handleQuestionnaireComplete = () => {
    setShowQuestionnaire(false)
    setQuestionnaireStatus(true)
    fetchDashboard()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error: {error}</div>
      </div>
    )
  }

  if (!dashboard) {
    return null
  }

  if (checkingQuestionnaire) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <SystemGuide />
      <OnboardingQuestionnaire
        isOpen={showQuestionnaire}
        onClose={() => setShowQuestionnaire(false)}
        onComplete={handleQuestionnaireComplete}
      />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <h1 className="text-4xl font-bold">Systems</h1>
          </div>
          {isDemo && (
            <p className="text-gray-400">
              Demo Mode - <Link to="/register" className="text-blue-400 hover:text-blue-300 underline">Sign up</Link> or <Link to="/login" className="text-blue-400 hover:text-blue-300 underline">Sign in</Link> to save your progress
            </p>
          )}
          <p className="text-gray-400 mt-2">
            Executable, state-changing systems. Actions occur, consequences apply. Consumes energy, affected by capacity.
          </p>
        </div>

        {/* REALITY & CONSTRAINTS Overview - Distributed from Knowledge Plane */}
        {!loadingReality && (realityNode || constraintsNode) && (
          <div className="mb-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Foundational Reality</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Universal constraints and principles that govern all systems. These immutable foundations apply to every action and decision.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* REALITY */}
              {realityNode && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Layers className="w-6 h-6 text-purple-400" />
                    <h3 className="font-semibold text-white">{realityNode.title}</h3>
                    {realityNode.immutable && (
                      <Lock className="w-4 h-4 text-purple-400 ml-auto" />
                    )}
                  </div>
                  {realityNode.description && (
                    <p className="text-sm text-gray-300">{realityNode.description}</p>
                  )}
                  <Link
                    to="/knowledge/overview"
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1 mt-3"
                  >
                    Explore in Knowledge <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {/* CONSTRAINTS_OF_REALITY */}
              {constraintsNode && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-6 h-6 text-indigo-400" />
                    <h3 className="font-semibold text-white">{constraintsNode.title}</h3>
                    {constraintsNode.immutable && (
                      <Lock className="w-4 h-4 text-purple-400 ml-auto" />
                    )}
                  </div>
                  {constraintsNode.description && (
                    <p className="text-sm text-gray-300">{constraintsNode.description}</p>
                  )}
                  <Link
                    to="/knowledge/constraints"
                    className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 mt-3"
                  >
                    View Constraints <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overall Rank Badge */}
        <div className="mb-8">
          <OverallRankBadge
            rank={dashboard.user.overallRank}
            xp={dashboard.user.overallXP}
            nextRankXP={dashboard.user.xpForNextRank}
            progress={dashboard.user.progressToNextRank}
            level={dashboard.user.overallLevel}
          />
        </div>

        {/* Season Indicator */}
        <div className="mb-8">
          <SeasonIndicator
            season={dashboard.season.season || Season.SPRING}
            daysInSeason={dashboard.season.daysInSeason || 0}
            startDate={dashboard.season.startDate || new Date().toISOString()}
            onSeasonChange={fetchDashboard}
          />
        </div>

        {/* Clouds */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Clouds of Life</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <CloudGauge type="capacity" strength={dashboard.clouds.capacity} />
            <CloudGauge type="engines" strength={dashboard.clouds.engines} />
            <CloudGauge type="oxygen" strength={dashboard.clouds.oxygen} />
            <CloudGauge type="meaning" strength={dashboard.clouds.meaning} />
            <CloudGauge type="optionality" strength={dashboard.clouds.optionality} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Stats can decay over time if neglected. Modified by actions, decay, and penalties.
          </p>
        </div>

        {/* Energy (separate, read-only) */}
        {dashboard.resources.energy !== undefined && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Energy</h2>
            {dashboard.isInBurnout && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-400 font-medium">Burnout: Energy cap reduced, XP gain penalized, Work actions blocked</p>
              </div>
            )}
            <div className="mb-4">
              <EnergyCard
                current={dashboard.resources.energy}
                usable={dashboard.resources.usableEnergy ?? dashboard.resources.energy}
                cap={dashboard.resources.energyCap ?? 100}
                isInBurnout={dashboard.isInBurnout}
              />
            </div>
            <p className="text-sm text-gray-500">
              Energy resets daily. {dashboard.isInBurnout ? 'Burnout reduces energy cap to 40. ' : ''}Capacity modifies your usable energy cap. All actions consume energy.
            </p>
          </div>
        )}

        {/* Resources */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <ResourceCard type="oxygen" value={dashboard.resources.oxygen} />
            <ResourceCard type="water" value={dashboard.resources.water} />
            <ResourceCard type="gold" value={dashboard.resources.gold} />
            <ResourceCard type="armor" value={dashboard.resources.armor} />
            <ResourceCard type="keys" value={dashboard.resources.keys} />
          </div>
          <ResourceTransaction resources={dashboard.resources} onUpdate={fetchDashboard} />
        </div>

        {/* Category XP */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Category XP</h2>
          <CategoryXPBar categoryXP={dashboard.xp.category} categoryLevels={dashboard.xp.categoryLevels} />
        </div>

        {/* Balance Indicator */}
        {!dashboard.balance.isBalanced && (
          <div className="mb-8">
            <BalanceIndicator balance={dashboard.balance} />
          </div>
        )}

        {/* Engines */}
        <div className="mb-8">
          <EnginesManager engines={dashboard.engines} onUpdate={fetchDashboard} />
        </div>

        {/* Systems Search - Nested within Systems Plane */}
        {!isDemo && (
          <div className="mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Systems</h2>
                <p className="text-gray-400">
                  Executable, state-changing systems. Actions occur, consequences apply.
                </p>
              </div>
              
              {/* Systems Search Tab */}
              <div className="border-b border-gray-700 mb-4">
                <div className="flex gap-4">
                  <button className="px-4 py-2 font-medium text-blue-400 border-b-2 border-blue-400">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      <span>Search Systems</span>
                    </div>
                  </button>
                </div>
              </div>
              
              <ExploreSystems />
            </div>
          </div>
        )}

        {/* Quick System Access - Legacy grid view */}
        {!isDemo && (
          <div className="mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Quick Access</h2>
                <p className="text-gray-400">
                  Quick links to major systems
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Master Money System */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link
                    to={getMasterRoute(MasterDomain.MONEY)}
                    className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-6 border-2 border-gray-600 hover:border-green-500/50 transition-all group block"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-green-500/10 border-green-500/30">
                        <DollarSign className="w-6 h-6 text-green-400" />
                      </div>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                        Active
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-400 transition-colors">
                      Master Money System
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Financial guidance with AI agents, domain teams, and interactive products
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">7 AI Agents</span>
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">8 Teams</span>
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">17 Products</span>
                    </div>
                  </Link>
                </motion.div>

                {/* Energy System */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link
                    to={getMasterRoute(MasterDomain.ENERGY)}
                    className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-6 border-2 border-gray-600 hover:border-yellow-500/50 transition-all group block"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-yellow-500/10 border-yellow-500/30">
                        <Zap className="w-6 h-6 text-yellow-400" />
                      </div>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                        Active
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                      Energy System
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Track and manage your energy levels and capacity
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">Energy Tracking</span>
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">Capacity Management</span>
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">Weekly Ticks</span>
                    </div>
                  </Link>
                </motion.div>

                {/* Health / Capacity System */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    to={getMasterRoute(MasterDomain.HEALTH)}
                    className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-6 border-2 border-gray-600 hover:border-pink-500/50 transition-all group block"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-pink-500/10 border-pink-500/30">
                        <HeartPulse className="w-6 h-6 text-pink-400" />
                      </div>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                        Active
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-pink-400 transition-colors">
                      Health / Capacity System
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Human operating stability: physical health, mental resilience, cognitive efficiency
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">Recovery Actions</span>
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">Effort Tracking</span>
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">Burnout Prevention</span>
                    </div>
                  </Link>
                </motion.div>

                {/* Investment System */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="bg-gray-700/50 rounded-lg p-6 border-2 border-gray-600">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-blue-500/10 border-blue-500/30">
                        <TrendingUp className="w-6 h-6 text-blue-400" />
                      </div>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                        Active
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Investment System
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Portfolio management, rebalancing, and investment strategies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">Portfolio Tracking</span>
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">Asset Allocation</span>
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">ROI Analysis</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Available in Systems dashboard below
                    </p>
                  </div>
                </motion.div>

                {/* Training System */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-gray-700/50 rounded-lg p-6 border-2 border-gray-600">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-purple-500/10 border-purple-500/30">
                        <Target className="w-6 h-6 text-purple-400" />
                      </div>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                        Active
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Training System
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Skill development and progression tracking
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">Skill Tracking</span>
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">Progress Monitoring</span>
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">Training Plans</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      Available in Systems dashboard below
                    </p>
                  </div>
                </motion.div>

                {/* Master Travel System */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link
                    to={getMasterRoute(MasterDomain.TRAVEL)}
                    className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-6 border-2 border-gray-600 hover:border-cyan-500/50 transition-all group block"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-lg bg-cyan-500/10 border-cyan-500/30">
                        <MapPin className="w-6 h-6 text-cyan-400" />
                      </div>
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded border border-green-500/30">
                        Active
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                      Master Travel System
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Find location alternatives and travel recommendations
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">Location Search</span>
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">Save Locations</span>
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded">Real-time Data</span>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {/* Investment Portfolio */}
        {!isDemo && (
          <div className="mb-8">
            <InvestmentManager />
          </div>
        )}

        {/* Portfolio & Life Rebalancing */}
        {!isDemo && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Portfolio & Life Rebalancing</h2>
            {showRebalancingConfig ? (
              <PortfolioRebalancingConfig
                onConfigSaved={() => {
                  setShowRebalancingConfig(false)
                  fetchDashboard()
                }}
                onCancel={() => setShowRebalancingConfig(false)}
              />
            ) : (
              <div className="space-y-6">
                <PortfolioRebalancingStatus
                  availableGold={dashboard.resources.gold}
                  onConfigNeeded={() => setShowRebalancingConfig(true)}
                />
                <RebalancingRecommendations
                  availableGold={dashboard.resources.gold}
                  onConfigNeeded={() => setShowRebalancingConfig(true)}
                />
                <div className="text-center">
                  <button
                    onClick={() => setShowRebalancingConfig(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    Configure Rebalancing
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Training Center */}
        {!isDemo && (
          <div className="mb-8">
            <TrainingCenter />
          </div>
        )}

        {/* Quick Actions */}
        {!isDemo && (
          <div className="mb-8">
            <QuickActions />
          </div>
        )}

        {/* Activity XP Calculator */}
        {!isDemo && (
          <div className="mb-8">
            <ActivityXPCalculator />
          </div>
        )}
        {isDemo && (
          <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-center">
              <Link to="/register" className="text-blue-400 hover:text-blue-300 underline">Sign up</Link> to start logging activities and earning XP
            </p>
          </div>
        )}

        {/* Activity History and Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ActivityHistory />
          <MilestonesView />
        </div>
      </div>
    </>
  )
}

