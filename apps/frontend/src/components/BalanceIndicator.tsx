import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { BalanceIndicator as BalanceIndicatorType } from '../types'

interface BalanceIndicatorProps {
  balance: BalanceIndicatorType
}

export default function BalanceIndicator({ balance }: BalanceIndicatorProps) {
  const data = [
    {
      category: 'Capacity',
      level: balance.categoryLevels.capacity,
      fullMark: balance.averageLevel + 20,
    },
    {
      category: 'Engines',
      level: balance.categoryLevels.engines,
      fullMark: balance.averageLevel + 20,
    },
    {
      category: 'Oxygen',
      level: balance.categoryLevels.oxygen,
      fullMark: balance.averageLevel + 20,
    },
    {
      category: 'Meaning',
      level: balance.categoryLevels.meaning,
      fullMark: balance.averageLevel + 20,
    },
    {
      category: 'Optionality',
      level: balance.categoryLevels.optionality,
      fullMark: balance.averageLevel + 20,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-yellow-400" />
        <h3 className="text-xl font-bold text-yellow-400">Balance Warning</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#9ca3af' }} />
              <PolarRadiusAxis angle={90} domain={[0, balance.averageLevel + 20]} tick={{ fill: '#9ca3af' }} />
              <Radar
                name="Levels"
                dataKey="level"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div>
          {balance.warnings.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-yellow-400 mb-2">Warnings:</h4>
              <ul className="list-disc list-inside space-y-1 text-yellow-200">
                {balance.warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {balance.recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold text-yellow-400 mb-2">Recommendations:</h4>
              <ul className="list-disc list-inside space-y-1 text-yellow-200">
                {balance.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

