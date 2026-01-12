import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, TrendingUp, TrendingDown, Minus, Link2, Lightbulb, ArrowUp, ArrowDown } from 'lucide-react'
import { getResourceInfo, getResourceStatus, getResourceEffects, ResourceType } from '../lib/resourceInfo'

interface ResourceInfoModalProps {
  type: ResourceType | null
  value: number
  isOpen: boolean
  onClose: () => void
}

export default function ResourceInfoModal({ type, value, isOpen, onClose }: ResourceInfoModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement
      modalRef.current?.focus()
    } else {
      previousActiveElement.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!type || !isOpen) return null

  const resourceInfo = getResourceInfo(type)
  const status = getResourceStatus(value, type)
  const effects = getResourceEffects(resourceInfo, value)

  const statusConfig = {
    strong: {
      label: 'Strong',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/50',
      icon: TrendingUp,
    },
    medium: {
      label: 'Medium',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/50',
      icon: Minus,
    },
    weak: {
      label: 'Weak',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/50',
      icon: TrendingDown,
    },
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto"
              role="dialog"
              aria-modal="true"
              aria-labelledby="resource-modal-title"
              tabIndex={-1}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{resourceInfo.icon}</div>
                    <div className="flex-1">
                      <h2 id="resource-modal-title" className="text-2xl font-bold text-white mb-2">
                        {resourceInfo.name}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Highlighted Status Badge */}
                <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg ${config.bgColor} ${config.borderColor} border-2`}>
                  <StatusIcon className={`w-5 h-5 ${config.color}`} />
                  <span className={`text-base font-bold ${config.color}`}>
                    {config.label} - {formatValue(value)}{resourceInfo.unit}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">What It Represents</h3>
                  <p className="text-gray-300 leading-relaxed">{resourceInfo.fullDescription}</p>
                </div>

                {/* Current State Effects */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                    Current State: {config.label}
                  </h3>
                  <ul className="space-y-2">
                    {effects.map((effect, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-300">
                        <span className="text-gray-500 mt-1">•</span>
                        <span>{effect}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* How to Earn/Spend */}
                <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-4`}>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Lightbulb className={`w-5 h-5 ${config.color}`} />
                    Resource Management
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <p className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                        <ArrowUp className="text-green-500" />
                        How to Earn:
                      </p>
                      <ul className="space-y-1.5">
                        {resourceInfo.howToEarn.map((tip, index) => (
                          <li key={index} className="text-gray-200 text-sm flex items-start gap-2">
                            <span className={`${config.color} mt-1`}>•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <p className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                        <ArrowDown className="text-blue-500" />
                        How to Spend:
                      </p>
                      <ul className="space-y-1.5">
                        {resourceInfo.howToSpend.map((use, index) => (
                          <li key={index} className="text-gray-200 text-sm flex items-start gap-2">
                            <span className={`${config.color} mt-1`}>•</span>
                            <span>{use}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* System Relationships */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Link2 className="w-5 h-5 text-cyan-400" />
                    System Relationships
                  </h3>
                  <div className="space-y-3">
                    {resourceInfo.relatedClouds.length > 0 && (
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                          <span className="text-purple-500">☁️</span>
                          Related Clouds:
                        </p>
                        <ul className="space-y-1.5">
                          {resourceInfo.relatedClouds.map((cloud, index) => (
                            <li key={index} className="text-gray-200 text-sm flex items-start gap-2">
                              <span className={`${config.color} mt-1`}>•</span>
                              <span>{cloud}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {resourceInfo.relatedSystems.length > 0 && (
                      <div className="bg-gray-900/50 rounded-lg p-3">
                        <p className="text-sm font-semibold text-cyan-400 mb-2 flex items-center gap-2">
                          <span className="text-cyan-500">🔗</span>
                          Related Systems:
                        </p>
                        <ul className="space-y-1.5">
                          {resourceInfo.relatedSystems.map((system, index) => (
                            <li key={index} className="text-gray-200 text-sm flex items-start gap-2">
                              <span className={`${config.color} mt-1`}>•</span>
                              <span>{system}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-4 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}





