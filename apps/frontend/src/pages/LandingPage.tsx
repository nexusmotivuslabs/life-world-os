/**
 * Landing Page
 * 
 * SaaS-style landing page for Life World OS.
 * This is the public-facing homepage before users sign up or log in.
 */

import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { 
  Zap, 
  HeartPulse, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Layers,
  BookOpen,
  BarChart3,
  ArrowRight,
  Check,
  Sparkles
} from 'lucide-react'
import Header from '../components/Header'
import { useGameStore } from '../store/useGameStore'

export default function LandingPage() {
  const navigate = useNavigate()
  const { dashboard, isDemo } = useGameStore()
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  // Redirect authenticated users to choose-plane
  useEffect(() => {
    if (token && !isDemo && dashboard) {
      navigate('/choose-plane', { replace: true })
    }
  }, [token, isDemo, dashboard, navigate])
  const features = [
    {
      icon: Zap,
      title: 'Energy Management',
      description: 'Track and optimize your daily energy allocation across all life systems.',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
    {
      icon: HeartPulse,
      title: 'Health & Capacity',
      description: 'Monitor your capacity levels and prevent burnout with intelligent recovery systems.',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
    },
    {
      icon: DollarSign,
      title: 'Financial Systems',
      description: 'Manage money, investments, and financial goals with gamified progression.',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      icon: Target,
      title: 'XP & Progression',
      description: 'Level up through consistent actions with Halo 3-style ranking and Destiny 2-style category XP.',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      icon: TrendingUp,
      title: 'Engines',
      description: 'Build and manage Career, Business, Investment, and Learning engines.',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      icon: Layers,
      title: 'Tier System',
      description: 'Navigate life through universal hierarchy: Survival, Stability, Growth, Leverage, Expression.',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20',
    },
  ]

  const benefits = [
    'Gamified life management system',
    'Track energy, capacity, and resources',
    'XP-based progression and ranking',
    'Season-based life cycles',
    'Financial planning and investment tracking',
    'Health and burnout prevention',
    'Knowledge base and artifacts',
    'AI-powered guidance and insights',
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/50 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span className="text-sm text-indigo-200">Your Life Operating System</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Life World OS
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Gamify your life. Track energy, build capacity, manage resources, and level up through consistent action.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-lg font-semibold transition-all"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to manage and optimize your life systems
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all hover:scale-105"
              >
                <div className={`inline-flex p-3 ${feature.bgColor} rounded-lg mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">Why Life World OS?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Transform your life management with game mechanics that make progress tangible and rewarding.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-lg">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl p-8 border border-blue-500/30"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <BarChart3 className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Track Everything</h3>
                    <p className="text-gray-300">Monitor all your life systems in one place</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <BookOpen className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Learn & Grow</h3>
                    <p className="text-gray-300">Access knowledge base and artifacts</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Level Up</h3>
                    <p className="text-gray-300">Progress through ranks and unlock achievements</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600/10 to-indigo-600/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Life?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Start your journey today. Sign up for free and begin tracking your progress.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg text-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-lg font-semibold transition-all"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p>&copy; 2024 Life World OS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
