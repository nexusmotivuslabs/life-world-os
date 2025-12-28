import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { CategoryXP, CategoryLevels } from '../types'

interface CategoryXPBarProps {
  categoryXP: CategoryXP
  categoryLevels: CategoryLevels
}

const categoryColors = {
  capacity: '#10b981',
  engines: '#3b82f6',
  oxygen: '#06b6d4',
  meaning: '#8b5cf6',
  optionality: '#f59e0b',
}

const categoryLabels = {
  capacity: 'Capacity',
  engines: 'Engines',
  oxygen: 'Oxygen',
  meaning: 'Meaning',
  optionality: 'Optionality',
}

export default function CategoryXPBar({ categoryXP, categoryLevels }: CategoryXPBarProps) {
  const data = Object.entries(categoryXP).map(([key, xp]) => ({
    name: categoryLabels[key as keyof typeof categoryLabels],
    xp,
    level: categoryLevels[key as keyof CategoryLevels],
    color: categoryColors[key as keyof typeof categoryColors],
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold mb-4">Category XP & Levels</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fill: '#9ca3af' }} />
          <YAxis tick={{ fill: '#9ca3af' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px',
            }}
            formatter={(value: number, _name: string, props: any) => [
              `${value.toLocaleString()} XP (Level ${props.payload.level})`,
              props.payload.name,
            ]}
          />
          <Bar dataKey="xp" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-5 gap-2 mt-4">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <p className="text-xs text-gray-400">{item.name}</p>
            <p className="text-lg font-bold" style={{ color: item.color }}>
              Lv {item.level}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

