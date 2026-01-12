/**
 * Coming Soon Page
 * 
 * Placeholder page for features that are in development.
 * Provides a clean, professional "coming soon" experience.
 */

import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import Layout from '../components/Layout'

interface ComingSoonProps {
  title: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
  color?: string
  bgColor?: string
  backPath?: string
}

export default function ComingSoon({ 
  title, 
  description, 
  icon: Icon = Sparkles,
  color = 'text-purple-400',
  bgColor = 'bg-purple-600/20',
  backPath = '/'
}: ComingSoonProps) {
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center mb-8"
          >
            <div className={`p-6 rounded-full ${bgColor}`}>
              <Icon className={`w-16 h-16 ${color}`} />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl font-bold mb-4"
          >
            {title}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-400 mb-8"
          >
            {description}
          </motion.p>

          {/* Coming Soon Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-full border border-gray-700 mb-8"
          >
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-gray-300 font-medium">Coming Soon</span>
          </motion.div>

          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => navigate(backPath)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </motion.button>

          {/* Additional Info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-8 text-sm text-gray-500"
          >
            We're working hard to bring you this feature. Stay tuned for updates!
          </motion.p>
        </motion.div>
      </div>
    </Layout>
  )
}





