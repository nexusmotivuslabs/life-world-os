import { motion } from 'framer-motion'
import { Award } from 'lucide-react'
import { OverallRank } from '../types'
import { getOverallRankDisplayName } from '../utils/enumDisplayNames'

interface OverallRankBadgeProps {
  rank: OverallRank
  xp: number
  nextRankXP: number | null
  progress: number
  level: number
}

export default function OverallRankBadge({
  rank,
  xp,
  nextRankXP,
  progress,
  level,
}: OverallRankBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-yellow-300" />
          <div>
            <h3 className="text-2xl font-bold">{getOverallRankDisplayName(rank)}</h3>
            <p className="text-blue-200 text-sm">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{xp.toLocaleString()}</p>
          <p className="text-blue-200 text-sm">Total XP</p>
        </div>
      </div>

      {nextRankXP !== null && (
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-blue-200">Progress to next rank</span>
            <span className="text-blue-200">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-blue-900/50 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300"
            />
          </div>
          <p className="text-xs text-blue-200 mt-2">
            {nextRankXP.toLocaleString()} XP until next rank
          </p>
        </div>
      )}
    </motion.div>
  )
}

