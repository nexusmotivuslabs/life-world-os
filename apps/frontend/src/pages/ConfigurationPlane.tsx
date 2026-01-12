/**
 * Configuration Plane
 * 
 * Configure system settings, preferences, and thresholds.
 * Supports operating systems by providing configuration options.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Target, Layers, ChevronRight } from 'lucide-react'
import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom'

export default function ConfigurationPlane() {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Configuration</h1>
          <p className="text-gray-400">
            Adjust system settings, preferences, and thresholds to customize your Life World OS experience.
          </p>
        </div>

        {/* Configuration Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate('/admin')}
            className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 hover:border-gray-500 cursor-pointer transition-all hover:scale-105 group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gray-500/20 rounded-lg">
                <Settings className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Settings</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              System configuration, user preferences, and operational parameters
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <span className="text-sm text-gray-400">Configure system</span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate('/admin')}
            className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 hover:border-gray-500 cursor-pointer transition-all hover:scale-105 group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gray-500/20 rounded-lg">
                <Target className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Preferences</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Customize your experience with personal preferences and display options
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <span className="text-sm text-gray-400">Adjust preferences</span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate('/admin')}
            className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700 hover:border-gray-500 cursor-pointer transition-all hover:scale-105 group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gray-500/20 rounded-lg">
                <Layers className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Thresholds</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Configure system thresholds, alerts, and operational limits
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <span className="text-sm text-gray-400">Set thresholds</span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors" />
            </div>
          </motion.div>
        </div>

        {/* Quick Access to Admin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Admin Panel</h3>
              <p className="text-sm text-gray-400">
                Access advanced configuration options and system administration
              </p>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition-colors"
            >
              Open Admin
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  )
}





