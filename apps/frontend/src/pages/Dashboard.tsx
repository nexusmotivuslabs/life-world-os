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
import LogoutButton from '../components/LogoutButton'
import OnboardingQuestionnaire from '../components/OnboardingQuestionnaire'
import TrainingCenter from '../components/TrainingCenter'
import InvestmentManager from '../components/InvestmentManager'
import MasterFinanceCard from '../components/MasterFinanceCard'
import MasterEnergyCard from '../components/MasterEnergyCard'
import PortfolioRebalancingConfig from '../components/PortfolioRebalancingConfig'
import PortfolioRebalancingStatus from '../components/PortfolioRebalancingStatus'
import RebalancingRecommendations from '../components/RebalancingRecommendations'
import AwarenessLayersSelector from '../components/AwarenessLayersSelector'
import { Settings, DollarSign, Zap, ChevronRight } from 'lucide-react'
import { Season } from '../types'
import { questionnaireApi } from '../services/api'
import { getMasterRoute } from '../config/routes'
import { MasterDomain } from '../types'
import { logger } from '../lib/logger'

export default function Dashboard() {
  const { dashboard, loading, error, fetchDashboard, isDemo, hasCompletedQuestionnaire, setQuestionnaireStatus } = useGameStore()
  const { toasts, removeToast } = useToastStore()
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [checkingQuestionnaire, setCheckingQuestionnaire] = useState(true)
  const [showRebalancingConfig, setShowRebalancingConfig] = useState(false)

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

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
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          {isDemo && (
            <p className="text-gray-400">
              Demo Mode - <Link to="/register" className="text-blue-400 hover:text-blue-300 underline">Sign up</Link> or <Link to="/login" className="text-blue-400 hover:text-blue-300 underline">Sign in</Link> to save your progress
            </p>
          )}
        </div>

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

        {/* Awareness Layers - Xbox 360 Style Selector */}
        {!isDemo && (
          <div className="mb-8">
            <AwarenessLayersSelector
              onLayerSelect={(layer) => {
                logger.debug('Selected awareness layer', { layer })
                // Could show a modal or navigate to detail page
              }}
            />
          </div>
        )}

        {/* Explore Systems - Consolidated Systems Dashboard */}
        {!isDemo && (
          <div className="mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Explore Systems</h2>
                  <p className="text-gray-400">
                    Access all systems and features in Life World OS
                  </p>
                </div>
                <Link
                  to="/tiers"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center gap-2 transition-colors"
                >
                  View All Systems
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  to={getMasterRoute(MasterDomain.FINANCE)}
                  className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-green-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-6 h-6 text-green-400" />
                    <h3 className="font-semibold group-hover:text-green-400 transition-colors">Master Finance System</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Financial guidance with AI agents, domain teams, and products
                  </p>
                </Link>
                <Link
                  to={getMasterRoute(MasterDomain.ENERGY)}
                  className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-yellow-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    <h3 className="font-semibold group-hover:text-yellow-400 transition-colors">Master Energy System</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Track and manage your energy levels and capacity
                  </p>
                </Link>
                <Link
                  to="/tiers"
                  className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Settings className="w-6 h-6 text-blue-400" />
                    <h3 className="font-semibold group-hover:text-blue-400 transition-colors">All Systems</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    View all available systems organized by tiers
                  </p>
                </Link>
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

