import { motion } from 'framer-motion'

interface QuestionStepProps {
  question: string
  options: Array<{ value: string | number; label: string; description?: string }>
  value: string | number | null
  onChange: (value: string | number) => void
  step: number
  totalSteps: number
}

export default function QuestionStep({
  question,
  options,
  value,
  onChange,
  step,
  totalSteps,
}: QuestionStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Question {step} of {totalSteps}</span>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 w-8 rounded ${
                  i < step ? 'bg-blue-500' : i === step - 1 ? 'bg-blue-300' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{question}</h3>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              value === option.value
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700 bg-gray-800 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">{option.label}</div>
                {option.description && (
                  <div className="text-sm text-gray-400 mt-1">{option.description}</div>
                )}
              </div>
              {value === option.value && (
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  )
}





