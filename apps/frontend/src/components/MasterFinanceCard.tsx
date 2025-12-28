import { Link } from 'react-router-dom'
import { TrendingUp, Users, BookOpen, Brain, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { getMasterRoute } from '../config/routes'
import { MasterDomain } from '../types'

/**
 * MasterFinanceCard Component
 * 
 * Dashboard card for the Master Finance System - provides access to:
 * - Expert AI agents (Investor, Financial Advisor, Accountant, etc.)
 * - Domain-focused teams with guided workflows
 * - Interactive financial guides
 * - Knowledge base search
 * - Team products (calculators, trackers, analyzers)
 */
export default function MasterFinanceCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Master Finance System</h2>
            <p className="text-sm text-gray-400">Expert financial guidance & knowledge base</p>
          </div>
        </div>
        <Link
          to={getMasterRoute(MasterDomain.FINANCE)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-medium flex items-center gap-2 transition-colors"
        >
          Explore
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Expert Agents */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-sm">7 Expert Agents</h3>
          </div>
          <p className="text-xs text-gray-400">
            Investor, Financial Advisor, Accountant, Bookkeeper, Tax Strategist, Cash Flow Specialist, Debt Specialist
          </p>
        </div>

        {/* Domain Teams */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold text-sm">7 Domain Teams</h3>
          </div>
          <p className="text-xs text-gray-400">
            Investment, Tax Optimization, Cash Flow, Business Advisory, Comprehensive Planning, Debt Management, Emergency Fund
          </p>
        </div>

        {/* Guided Workflows */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold text-sm">Interactive Guides</h3>
          </div>
          <p className="text-xs text-gray-400">
            Step-by-step workflows for making money, optimizing taxes, managing debt, and building wealth
          </p>
        </div>
      </div>

      {/* Quick Stats or Highlights */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-400">
            <span className="text-blue-400 font-semibold">✓</span> Vector knowledge base with RAG
          </div>
          <div className="text-gray-400">
            <span className="text-blue-400 font-semibold">✓</span> Bank-level security
          </div>
          <div className="text-gray-400">
            <span className="text-blue-400 font-semibold">✓</span> Local LLM support (Ollama)
          </div>
        </div>
      </div>
    </motion.div>
  )
}

