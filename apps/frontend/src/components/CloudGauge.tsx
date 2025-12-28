import { useState, useRef } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'
import CloudTooltip from './CloudTooltip'
import CloudInfoModal from './CloudInfoModal'
import { CloudType } from '../lib/cloudInfo'

interface CloudGaugeProps {
  type: 'capacity' | 'engines' | 'oxygen' | 'meaning' | 'optionality'
  strength: number
}

const cloudConfig: Record<
  string,
  { label: string; color: string; description: string }
> = {
  capacity: {
    label: 'Capacity',
    color: '#10b981',
    description: 'Health, energy, resilience',
  },
  engines: {
    label: 'Engines',
    color: '#3b82f6',
    description: 'Income sources',
  },
  oxygen: {
    label: 'Oxygen',
    color: '#06b6d4',
    description: 'Cash flow, stability',
  },
  meaning: {
    label: 'Meaning',
    color: '#8b5cf6',
    description: 'Values, purpose',
  },
  optionality: {
    label: 'Optionality',
    color: '#f59e0b',
    description: 'Freedom, assets',
  },
}

export default function CloudGauge({ type, strength }: CloudGaugeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | undefined>()
  const containerRef = useRef<HTMLDivElement>(null)

  const config = cloudConfig[type]
  const data = [{ name: type, value: strength, fill: config.color }]

  const getStatusColor = (value: number) => {
    if (value >= 70) return 'text-green-400'
    if (value >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  const handleMouseEnter = (_e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true)
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      })
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTooltipPosition(undefined)
  }

  const handleClick = () => {
    setIsSelected(true)
    setIsModalOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setIsSelected(false)
    // Return focus to the cloud gauge
    containerRef.current?.focus()
  }

  return (
    <>
      <motion.div
        ref={containerRef}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : ''
        } ${isHovered ? 'bg-gray-700 shadow-lg' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${config.label} Cloud - ${strength}% strength. Click for details.`}
        aria-pressed={isSelected}
      >
        <h4 className="text-sm font-semibold text-gray-300 mb-2">{config.label}</h4>
        <p className="text-xs text-gray-500 mb-4">{config.description}</p>
        <ResponsiveContainer width="100%" height={120}>
          <RadialBarChart
            innerRadius="60%"
            outerRadius="90%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar dataKey="value" cornerRadius={10} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value}%`, 'Strength']}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="text-center mt-2">
          <p className={`text-2xl font-bold ${getStatusColor(strength)}`}>{strength}%</p>
        </div>
      </motion.div>

      {/* Tooltip */}
      <CloudTooltip
        type={type as CloudType}
        strength={strength}
        isVisible={isHovered && !isModalOpen}
        position={tooltipPosition}
      />

      {/* Modal */}
      <CloudInfoModal
        type={type as CloudType}
        strength={strength}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}

