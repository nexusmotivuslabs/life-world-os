import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Trophy, Sparkles, AlertCircle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'achievement'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastProps {
  toast: Toast
  onRemove: (id: string) => void
}

export function ToastComponent({ toast, onRemove }: ToastProps) {
  const duration = toast.duration || 5000

  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-green-600',
      borderColor: 'border-green-500',
      iconColor: 'text-green-300',
    },
    error: {
      icon: AlertCircle,
      bgColor: 'bg-red-600',
      borderColor: 'border-red-500',
      iconColor: 'text-red-300',
    },
    info: {
      icon: Sparkles,
      bgColor: 'bg-blue-600',
      borderColor: 'border-blue-500',
      iconColor: 'text-blue-300',
    },
    achievement: {
      icon: Trophy,
      bgColor: 'bg-yellow-600',
      borderColor: 'border-yellow-500',
      iconColor: 'text-yellow-300',
    },
  }

  const { icon: Icon, bgColor, borderColor, iconColor } = config[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`${bgColor} ${borderColor} border-2 rounded-lg shadow-lg p-4 min-w-[300px] max-w-md`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className="font-semibold text-white">{toast.title}</h4>
          {toast.message && <p className="text-sm text-white/80 mt-1">{toast.message}</p>}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-white/60 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastComponent key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}





