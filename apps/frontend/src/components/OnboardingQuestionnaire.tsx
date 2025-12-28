import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import QuestionStep from './QuestionStep'
import { questionnaireApi } from '../services/api'
import { useGameStore } from '../store/useGameStore'
import { useToastStore } from '../store/useToastStore'

interface QuestionnaireAnswers {
  lifePhase: 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER' | null
  financialMonths: number | null
  healthRating: 'weak' | 'medium' | 'strong' | 'very_strong' | null
  incomeSources: number | null
  purposeClarity: 'weak' | 'medium' | 'strong' | 'very_strong' | null
  availableOptions: number | null
  stressManagement: 'low' | 'medium' | 'high' | 'very_high' | null
  experienceLevel: 'beginner' | 'some' | 'experienced' | 'very_experienced' | null
}

const questions = [
  {
    key: 'lifePhase' as keyof QuestionnaireAnswers,
    question: 'What best describes your current life phase?',
    options: [
      { value: 'SPRING', label: 'Planning & Starting', description: 'Beginning new projects, learning, setting up systems' },
      { value: 'SUMMER', label: 'Peak Activity', description: 'High output, executing plans, maximum effort' },
      { value: 'AUTUMN', label: 'Consolidating', description: 'Harvesting results, optimizing, teaching others' },
      { value: 'WINTER', label: 'Resting & Recovering', description: 'Taking breaks, reflecting, preparing for next cycle' },
    ],
  },
  {
    key: 'financialMonths' as keyof QuestionnaireAnswers,
    question: 'How many months of expenses do you have saved?',
    options: [
      { value: 0, label: '0-1 months', description: 'Living paycheck to paycheck' },
      { value: 2, label: '2-3 months', description: 'Some buffer, but limited' },
      { value: 4, label: '4-6 months', description: 'Good financial security' },
      { value: 8, label: '6+ months', description: 'Strong financial foundation' },
    ],
  },
  {
    key: 'healthRating' as keyof QuestionnaireAnswers,
    question: 'How would you rate your current health and energy levels?',
    options: [
      { value: 'weak', label: 'Low / Struggling', description: 'Frequent fatigue, health concerns' },
      { value: 'medium', label: 'Moderate', description: 'Some energy, occasional dips' },
      { value: 'strong', label: 'Good', description: 'Generally healthy and energetic' },
      { value: 'very_strong', label: 'Excellent', description: 'High energy, optimal health' },
    ],
  },
  {
    key: 'incomeSources' as keyof QuestionnaireAnswers,
    question: 'How many income sources do you currently have?',
    options: [
      { value: 1, label: 'One job only', description: 'Single source of income' },
      { value: 2, label: 'One job + side income', description: 'Main job plus freelance/side work' },
      { value: 3, label: 'Multiple sources', description: '3+ different income streams' },
      { value: 5, label: 'Diversified portfolio', description: 'Many income sources, well diversified' },
    ],
  },
  {
    key: 'purposeClarity' as keyof QuestionnaireAnswers,
    question: 'How clear are you on your life purpose and values?',
    options: [
      { value: 'weak', label: 'Unclear / Lost', description: 'Questioning direction, feeling disconnected' },
      { value: 'medium', label: 'Somewhat clear', description: 'Have some ideas, still exploring' },
      { value: 'strong', label: 'Clear', description: 'Know your values and direction' },
      { value: 'very_strong', label: 'Very clear', description: 'Strong sense of purpose and alignment' },
    ],
  },
  {
    key: 'availableOptions' as keyof QuestionnaireAnswers,
    question: 'How many viable career/life paths do you feel you have?',
    options: [
      { value: 1, label: 'One path only', description: 'Locked into current trajectory' },
      { value: 2, label: '2-3 options', description: 'A few alternatives available' },
      { value: 4, label: 'Multiple options', description: 'Several viable paths forward' },
      { value: 6, label: 'Many options', description: 'High flexibility and freedom' },
    ],
  },
  {
    key: 'stressManagement' as keyof QuestionnaireAnswers,
    question: 'How well are you managing stress and maintaining boundaries?',
    options: [
      { value: 'low', label: 'Struggling', description: 'High stress, poor boundaries' },
      { value: 'medium', label: 'Managing', description: 'Some stress, working on boundaries' },
      { value: 'high', label: 'Good', description: 'Well-managed stress, clear boundaries' },
      { value: 'very_high', label: 'Excellent', description: 'Excellent stress management and boundaries' },
    ],
  },
  {
    key: 'experienceLevel' as keyof QuestionnaireAnswers,
    question: 'How would you describe your life experience level?',
    options: [
      { value: 'beginner', label: 'Just starting', description: 'Early in career/life journey' },
      { value: 'some', label: 'Some experience', description: 'A few years of experience' },
      { value: 'experienced', label: 'Experienced', description: 'Significant life and career experience' },
      { value: 'very_experienced', label: 'Very experienced', description: 'Extensive experience and wisdom' },
    ],
  },
]

interface OnboardingQuestionnaireProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export default function OnboardingQuestionnaire({
  isOpen,
  onClose,
  onComplete,
}: OnboardingQuestionnaireProps) {
  const { fetchDashboard } = useGameStore()
  const { addToast } = useToastStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    lifePhase: null,
    financialMonths: null,
    healthRating: null,
    incomeSources: null,
    purposeClarity: null,
    availableOptions: null,
    stressManagement: null,
    experienceLevel: null,
  })
  const [loading, setLoading] = useState(false)

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1
  const canProceed = answers[currentQuestion.key] !== null

  const handleAnswer = (value: string | number) => {
    setAnswers({ ...answers, [currentQuestion.key]: value })
  }

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await questionnaireApi.submit(answers)
      addToast({
        type: 'success',
        title: 'Welcome to Life World OS!',
        message: 'Your personalized stats have been set up',
        duration: 5000,
      })
      await fetchDashboard()
      onComplete()
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Submit',
        message: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Welcome to Life World OS</h2>
              <p className="text-gray-400 text-sm">
                Help us personalize your experience by answering a few questions
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <QuestionStep
                key={currentStep}
                question={currentQuestion.question}
                options={currentQuestion.options}
                value={answers[currentQuestion.key]}
                onChange={handleAnswer}
                step={currentStep + 1}
                totalSteps={questions.length}
              />
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium"
            >
              Skip for now
            </button>
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!canProceed || loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  'Processing...'
                ) : isLastStep ? (
                  <>
                    Complete <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}


