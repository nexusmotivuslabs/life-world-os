/**
 * MasterFinanceKnowledge Page
 * 
 * Knowledge Plane view for the Finance System featuring:
 * - Financial laws, principles, and frameworks
 * - Domain-specific knowledge content
 * - Read-only reference material
 * 
 * This is the Knowledge Plane equivalent of the Finance System.
 * Read-only, no state changes, no consequences.
 */

import { useState } from 'react'
import { DollarSign, BookOpen, ChevronRight, Layers, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import DomainLawsView from '../components/DomainLawsView'
import { MasterDomain } from '../types'

export default function MasterFinanceKnowledge() {
  const [view, setView] = useState<'overview' | 'laws' | 'principles' | 'frameworks'>('overview')

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-green-600/20">
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Finance System</h1>
            <p className="text-gray-400 mt-1">
              Financial laws, principles, and frameworks. Read-only knowledge base for understanding money and finance.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        <button
          onClick={() => setView('overview')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'overview'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setView('laws')}
          className={`px-4 py-2 font-medium transition-colors ${
            view === 'laws'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Laws, Principles & Frameworks
        </button>
      </div>

      {/* Overview View */}
      {view === 'overview' && (
        <div className="space-y-8">
          {/* System Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => setView('laws')}
                className="bg-gray-700/50 hover:bg-gray-700 rounded-lg p-4 text-left transition-all hover:border-green-400 border border-transparent group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <BookOpen className="w-6 h-6 text-green-400" />
                  <h3 className="font-semibold group-hover:text-green-400 transition-colors">Laws & Principles</h3>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-gray-400 text-sm">
                  48 Laws of Power and Bible Laws applied to money and finance
                </p>
              </button>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                  <h3 className="font-semibold">Financial Frameworks</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Strategic frameworks for financial decision-making
                </p>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Layers className="w-6 h-6 text-purple-400" />
                  <h3 className="font-semibold">Knowledge Base</h3>
                </div>
                <p className="text-gray-400 text-sm">
                  Comprehensive financial knowledge and reference material
                </p>
              </div>
            </div>
          </motion.div>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-4">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-600/20 rounded-lg mt-1">
                  <BookOpen className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">48 Laws of Power</h3>
                  <p className="text-gray-400 text-sm">
                    Financial applications of strategic power laws. Learn how to apply timeless principles to money management.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-600/20 rounded-lg mt-1">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Bible Laws</h3>
                  <p className="text-gray-400 text-sm">
                    Biblical principles applied to financial stewardship, wealth building, and money management.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-600/20 rounded-lg mt-1">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Financial Frameworks</h3>
                  <p className="text-gray-400 text-sm">
                    Strategic frameworks for investment, cash flow, debt management, and wealth building.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-600/20 rounded-lg mt-1">
                  <Layers className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Read-Only Reference</h3>
                  <p className="text-gray-400 text-sm">
                    All content is read-only knowledge base material. No state changes, no consequences, safe exploration.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Laws View */}
      {view === 'laws' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DomainLawsView domain={MasterDomain.FINANCE} />
        </motion.div>
      )}
    </div>
  )
}

