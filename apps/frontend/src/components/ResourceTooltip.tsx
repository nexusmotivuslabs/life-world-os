import { motion, AnimatePresence } from 'framer-motion'
import { getResourceInfo, getResourceStatus, ResourceType } from '../lib/resourceInfo'

interface ResourceTooltipProps {
  type: ResourceType
  value: number
  isVisible: boolean
  position?: { x: number; y: number }
}

export default function ResourceTooltip({ type, value, isVisible, position }: ResourceTooltipProps) {
  const resourceInfo = getResourceInfo(type)
  const status = getResourceStatus(value, type)
  const statusLabels = {
    strong: 'Strong',
    medium: 'Medium',
    weak: 'Weak',
  }
  const statusColors = {
    strong: 'text-green-400',
    medium: 'text-yellow-400',
    weak: 'text-red-400',
  }

  if (!isVisible) return null

  const tooltipStyle = position
    ? {
        position: 'fixed' as const,
        left: `${
          typeof window !== 'undefined'
            ? Math.min(Math.max(position.x, 150), window.innerWidth - 150)
            : position.x
        }px`,
        top: `${Math.max(position.y - 10, 80)}px`,
        transform: 'translate(-50%, -100%)',
        marginTop: '-8px',
      }
    : {}

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={tooltipStyle}
          className="z-50 pointer-events-none"
        >
          <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3 max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{resourceInfo.icon}</span>
              <h4 className="font-semibold text-white text-sm">{resourceInfo.name}</h4>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium ${statusColors[status]}`}>
                {statusLabels[status]} ({value}{resourceInfo.unit})
              </span>
            </div>
            <p className="text-xs text-gray-300 mb-2">{resourceInfo.description}</p>
            <p className="text-xs text-gray-400 italic">Click for details</p>
          </div>
          {/* Arrow pointer */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}


