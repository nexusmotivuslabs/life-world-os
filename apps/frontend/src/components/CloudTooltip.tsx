import { motion, AnimatePresence } from 'framer-motion'
import { getCloudInfo, getCloudStrengthStatus, CloudType } from '../lib/cloudInfo'

interface CloudTooltipProps {
  type: CloudType
  strength: number
  isVisible: boolean
  position?: { x: number; y: number }
}

export default function CloudTooltip({ type, strength, isVisible, position }: CloudTooltipProps) {
  const cloudInfo = getCloudInfo(type)
  const status = getCloudStrengthStatus(strength)
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
              <span className="text-lg">{cloudInfo.icon}</span>
              <h4 className="font-semibold text-white text-sm">{cloudInfo.name}</h4>
            </div>
            {/* Highlighted Status */}
            <div className={`flex items-center gap-2 mb-2 px-2 py-1 rounded ${
              status === 'strong' ? 'bg-green-500/10' : 
              status === 'medium' ? 'bg-yellow-500/10' : 
              'bg-red-500/10'
            }`}>
              <span className={`text-xs font-bold ${statusColors[status]}`}>
                {statusLabels[status]} - {strength}%
              </span>
            </div>
            {/* Quick Key Stats Preview */}
            {(cloudInfo.affectsResources.length > 0 || cloudInfo.affectsXP.length > 0) && (
              <div className="mb-2 space-y-1">
                {cloudInfo.affectsResources.length > 0 && (
                  <p className="text-xs text-blue-400">
                    📊 {cloudInfo.affectsResources[0]}
                  </p>
                )}
                {cloudInfo.affectsXP.length > 0 && (
                  <p className="text-xs text-purple-400">
                    ⭐ {cloudInfo.affectsXP[0]}
                  </p>
                )}
              </div>
            )}
            <p className="text-xs text-gray-300 mb-2">{cloudInfo.description}</p>
            <p className="text-xs text-gray-400 italic">Click for details</p>
          </div>
          {/* Arrow pointer */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-700" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

