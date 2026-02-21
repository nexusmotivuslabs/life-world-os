/**
 * ProductMiniAppModal
 *
 * Opens the product as an iPhone-sized mini app inside a modal.
 * Used when "Open in App" is clicked for optionality (and other) products.
 */

import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Product } from '../services/financeApi'
import EmergencyFundTracker from './EmergencyFundTracker'
import BudgetBuilderTracker from './BudgetBuilderTracker'
import CashFlowAnalyzer from './CashFlowAnalyzer'
import DecisionReversibilityCalculator from './DecisionReversibilityCalculator'
import RiskMitigationPlanner from './RiskMitigationPlanner'
import SkillTransferabilityAnalyzer from './SkillTransferabilityAnalyzer'
import LearningRateTracker from './LearningRateTracker'
import ArtifactPortfolioTemplate from './ArtifactPortfolioTemplate'
import ImpactDashboardMini from './ImpactDashboardMini'
import VisaMoveChecklist from './travel/VisaMoveChecklist'
import { Calculator, BarChart3, TrendingUp, BookOpen, Package } from 'lucide-react'

const IPHONE_WIDTH = 390
const IPHONE_HEIGHT = 664

interface ProductMiniAppModalProps {
  product: Product
  onClose: () => void
  open: boolean
}

function getProductIcon(type: string) {
  switch (type) {
    case 'CALCULATOR':
      return Calculator
    case 'TRACKER':
      return TrendingUp
    case 'ANALYZER':
    case 'DASHBOARD':
      return BarChart3
    case 'PLANNER':
      return BookOpen
    default:
      return Package
  }
}

function ProductMiniAppContent({ product }: { product: Product }) {
  if (product.name === 'Emergency Fund Tracker') {
    return <EmergencyFundTracker />
  }
  if (product.name === 'Budget Builder & Tracker') {
    return <BudgetBuilderTracker />
  }
  if (product.name === 'Cash Flow Analyzer') {
    return <CashFlowAnalyzer />
  }
  if (product.name === 'Decision Reversibility Calculator') {
    return <DecisionReversibilityCalculator />
  }
  if (product.name === 'Risk Mitigation Planner') {
    return <RiskMitigationPlanner />
  }
  if (product.name === 'Skill Transferability Analyzer') {
    return <SkillTransferabilityAnalyzer />
  }
  if (product.name === 'Learning Rate Tracker') {
    return <LearningRateTracker />
  }
  if (product.name === 'Artifact Portfolio Template') {
    return <ArtifactPortfolioTemplate />
  }
  if (product.name === 'Impact Dashboard') {
    return <ImpactDashboardMini />
  }
  if (product.name === 'Visa & Move Checklist') {
    return <VisaMoveChecklist />
  }

  const Icon = getProductIcon(product.type)
  return (
    <div className="p-4 space-y-4 h-full overflow-auto">
      <div className="flex items-center gap-0">
        <div className="p-2 bg-blue-600/20 rounded-lg shrink-0">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm truncate">{product.name}</h3>
          <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>
        </div>
      </div>
      {product.features && Array.isArray(product.features) && product.features.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-400 mb-2">Features</h4>
          <div className="space-y-2">
            {product.features.map((feature: any, index: number) => (
              <div key={index} className="bg-gray-700/50 rounded-lg p-2">
                <h5 className="font-medium text-xs">{feature.name || `Feature ${index + 1}`}</h5>
                {feature.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductMiniAppModal({ product, onClose, open }: ProductMiniAppModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="relative flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* iPhone-style frame */}
            <div
              className="relative rounded-[2.5rem] border-[10px] border-gray-800 bg-gray-900 shadow-2xl overflow-hidden"
              style={{
                width: IPHONE_WIDTH,
                height: IPHONE_HEIGHT,
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 0 0 2px rgba(255,255,255,0.05)',
              }}
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10" />
              {/* Content area */}
              <div
                className="w-full h-full bg-gray-900 pt-6"
                style={{ minHeight: IPHONE_HEIGHT - 24 }}
              >
                <ProductMiniAppContent product={product} />
              </div>
            </div>
            <button
              onClick={onClose}
              className="mt-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
