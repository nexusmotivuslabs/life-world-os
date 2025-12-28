import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Droplet, Coins, Shield, Key, Wind } from 'lucide-react'
import ResourceTooltip from './ResourceTooltip'
import ResourceInfoModal from './ResourceInfoModal'
import { ResourceType } from '../lib/resourceInfo'

interface ResourceCardProps {
  type: 'oxygen' | 'water' | 'gold' | 'armor' | 'keys'
  value: number
}

const resourceConfig: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; unit: string }
> = {
  oxygen: {
    label: 'Oxygen',
    icon: Wind,
    color: 'from-cyan-500 to-blue-600',
    unit: 'months',
  },
  water: {
    label: 'Water',
    icon: Droplet,
    color: 'from-blue-500 to-cyan-600',
    unit: '%',
  },
  gold: {
    label: 'Gold',
    icon: Coins,
    color: 'from-yellow-500 to-amber-600',
    unit: '',
  },
  armor: {
    label: 'Armor',
    icon: Shield,
    color: 'from-gray-500 to-slate-600',
    unit: '%',
  },
  keys: {
    label: 'Keys',
    icon: Key,
    color: 'from-purple-500 to-pink-600',
    unit: '',
  },
}

export default function ResourceCard({ type, value }: ResourceCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | undefined>()
  const containerRef = useRef<HTMLDivElement>(null)

  const config = resourceConfig[type]
  const Icon = config.icon

  const formatValue = (val: number) => {
    if (type === 'gold') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val)
    }
    if (type === 'oxygen') {
      return val.toFixed(1)
    }
    return Math.round(val).toString()
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
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
        className={`bg-gradient-to-br ${config.color} rounded-lg p-4 shadow-md cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
          isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : ''
        } ${isHovered ? 'shadow-lg' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`${config.label} Resource - ${formatValue(value)}${config.unit || ''}. Click for details.`}
        aria-pressed={isSelected}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-6 h-6 text-white" />
            <div>
              <p className="text-sm text-white/80">{config.label}</p>
              <p className="text-2xl font-bold text-white">
                {formatValue(value)}
                {config.unit && <span className="text-sm ml-1">{config.unit}</span>}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tooltip */}
      <ResourceTooltip
        type={type as ResourceType}
        value={value}
        isVisible={isHovered && !isModalOpen}
        position={tooltipPosition}
      />

      {/* Modal */}
      <ResourceInfoModal
        type={type as ResourceType}
        value={value}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}

