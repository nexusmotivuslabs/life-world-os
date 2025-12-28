/**
 * Insight Plane
 * 
 * Reflect on performance, trends, and analytics.
 * Supports operating systems by providing insights.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, BookOpen, Eye, ChevronRight } from 'lucide-react'
import Layout from '../components/Layout'

export default function InsightPlane() {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Insight</h1>
          <p className="text-gray-400">
            Reflect on your performance, understand trends, and gain insights into your system behavior.
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
          <div className="text-center py-12">
            <Eye className="w-16 h-16 text-teal-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Insight Plane Coming Soon</h2>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              The Insight Plane will provide comprehensive analytics, trend analysis, and performance reports
              to help you understand and optimize your system behavior.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-700/50 rounded-lg p-6 border border-gray-600"
              >
                <BarChart3 className="w-8 h-8 text-teal-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">Analytics</h3>
                <p className="text-sm text-gray-400">
                  Comprehensive performance metrics and data analysis
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-700/50 rounded-lg p-6 border border-gray-600"
              >
                <TrendingUp className="w-8 h-8 text-teal-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">Trends</h3>
                <p className="text-sm text-gray-400">
                  Track patterns and identify long-term trajectories
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-700/50 rounded-lg p-6 border border-gray-600"
              >
                <BookOpen className="w-8 h-8 text-teal-400 mb-3" />
                <h3 className="font-semibold text-white mb-2">Reports</h3>
                <p className="text-sm text-gray-400">
                  Detailed reports and summaries of your system activity
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}


