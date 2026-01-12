import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Target, TrendingUp, Shield, Clock, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react'
import { portfolioRebalancingApi } from '../services/api'
import { useToastStore } from '../store/useToastStore'
import {
  IncomeStability,
  EmotionalTolerance,
  DecisionDiscipline,
  RebalancingFrequency,
  PortfolioRebalancingConfig as ConfigType,
} from '../types'

const configSchema = z.object({
  timeHorizonYears: z.number().int().min(1).max(100),
  incomeStability: z.nativeEnum(IncomeStability),
  emotionalTolerance: z.nativeEnum(EmotionalTolerance),
  decisionDiscipline: z.nativeEnum(DecisionDiscipline),
  targetStocksPercent: z.number().min(0).max(100).optional(),
  targetBondsPercent: z.number().min(0).max(100).optional(),
  rebalancingFrequency: z.nativeEnum(RebalancingFrequency),
  driftThreshold: z.number().min(0).max(50),
  preferContributions: z.boolean().default(true),
  bondPurpose: z.array(z.string()).min(1, 'Select at least one bond purpose'),
})

type ConfigFormData = z.infer<typeof configSchema>

interface PortfolioRebalancingConfigProps {
  onConfigSaved?: () => void
  onCancel?: () => void
}

const BOND_PURPOSES = [
  { value: 'income', label: 'Income Generation', description: 'Regular income from bonds' },
  { value: 'optionality', label: 'Optionality During Downturns', description: 'Dry powder for opportunities' },
  { value: 'emotional_stability', label: 'Emotional Stability', description: 'Lower volatility for peace of mind' },
]

export default function PortfolioRebalancingConfig({
  onConfigSaved,
  onCancel,
}: PortfolioRebalancingConfigProps) {
  const { addToast } = useToastStore()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [existingConfig, setExistingConfig] = useState<ConfigType | null>(null)
  const totalSteps = 4

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      timeHorizonYears: 20,
      incomeStability: IncomeStability.MEDIUM,
      emotionalTolerance: EmotionalTolerance.MEDIUM,
      decisionDiscipline: DecisionDiscipline.MEDIUM,
      rebalancingFrequency: RebalancingFrequency.THRESHOLD_BASED,
      driftThreshold: 5,
      preferContributions: true,
      bondPurpose: [],
    },
  })

  const bondPurpose = watch('bondPurpose')
  const timeHorizonYears = watch('timeHorizonYears')
  const incomeStability = watch('incomeStability')
  const emotionalTolerance = watch('emotionalTolerance')
  const decisionDiscipline = watch('decisionDiscipline')

  // Load existing config
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const config = await portfolioRebalancingApi.getConfig()
      setExistingConfig(config)
      // Populate form with existing values
      setValue('timeHorizonYears', config.timeHorizonYears)
      setValue('incomeStability', config.incomeStability)
      setValue('emotionalTolerance', config.emotionalTolerance)
      setValue('decisionDiscipline', config.decisionDiscipline)
      setValue('targetStocksPercent', config.targetStocksPercent)
      setValue('targetBondsPercent', config.targetBondsPercent)
      setValue('rebalancingFrequency', config.rebalancingFrequency)
      setValue('driftThreshold', config.driftThreshold)
      setValue('preferContributions', config.preferContributions)
      setValue('bondPurpose', config.bondPurpose)
    } catch (error) {
      // Config doesn't exist yet, that's fine
    }
  }

  const toggleBondPurpose = (value: string) => {
    const current = bondPurpose || []
    if (current.includes(value)) {
      setValue('bondPurpose', current.filter((p) => p !== value))
    } else {
      setValue('bondPurpose', [...current, value])
    }
  }

  const onSubmit = async (data: ConfigFormData) => {
    try {
      setLoading(true)
      await portfolioRebalancingApi.createOrUpdateConfig(data)
      addToast({
        type: 'success',
        title: 'Configuration Saved',
        message: 'Your portfolio rebalancing configuration has been saved.',
      })
      onConfigSaved?.()
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Failed to Save Configuration',
        message: error instanceof Error ? error.message : 'Please try again',
      })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Portfolio & Life Rebalancing Setup</h2>
        <p className="text-gray-400">
          Configure your long-term investment strategy focused on staying invested through all market conditions.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
            </div>
            {step < totalSteps && (
              <div
                className={`flex-1 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 1: Time Horizon & Income Stability */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Investment Time Horizon (years)
                </label>
                <input
                  type="number"
                  {...register('timeHorizonYears', { valueAsNumber: true })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  min="1"
                  max="100"
                />
                {errors.timeHorizonYears && (
                  <p className="text-red-400 text-sm mt-1">{errors.timeHorizonYears.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Income Stability
                </label>
                <select
                  {...register('incomeStability')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value={IncomeStability.HIGH}>High - Stable, predictable income</option>
                  <option value={IncomeStability.MEDIUM}>Medium - Some variability</option>
                  <option value={IncomeStability.LOW}>Low - Irregular or uncertain income</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Step 2: Emotional Tolerance & Decision Discipline */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Emotional Tolerance for Drawdowns
                </label>
                <select
                  {...register('emotionalTolerance')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value={EmotionalTolerance.HIGH}>High - Can handle large swings</option>
                  <option value={EmotionalTolerance.MEDIUM}>Medium - Moderate swings are okay</option>
                  <option value={EmotionalTolerance.LOW}>Low - Prefer stability</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Decision Discipline Under Stress
                </label>
                <select
                  {...register('decisionDiscipline')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value={DecisionDiscipline.HIGH}>High - Stick to plan even when stressed</option>
                  <option value={DecisionDiscipline.MEDIUM}>Medium - Usually stick to plan</option>
                  <option value={DecisionDiscipline.LOW}>Low - May make emotional decisions</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* Step 3: Target Allocation */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-300">
                  Based on your profile, we recommend an allocation. You can adjust these values.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <TrendingUp className="w-4 h-4 inline mr-2" />
                  Target Stocks Allocation (%)
                </label>
                <input
                  type="number"
                  {...register('targetStocksPercent', { valueAsNumber: true })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  min="0"
                  max="100"
                  step="0.1"
                />
                {errors.targetStocksPercent && (
                  <p className="text-red-400 text-sm mt-1">{errors.targetStocksPercent.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <Target className="w-4 h-4 inline mr-2" />
                  Target Bonds Allocation (%)
                </label>
                <input
                  type="number"
                  {...register('targetBondsPercent', { valueAsNumber: true })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  min="0"
                  max="100"
                  step="0.1"
                />
                {errors.targetBondsPercent && (
                  <p className="text-red-400 text-sm mt-1">{errors.targetBondsPercent.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bond Purpose</label>
                <div className="space-y-2">
                  {BOND_PURPOSES.map((purpose) => (
                    <label
                      key={purpose.value}
                      className="flex items-start p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={bondPurpose?.includes(purpose.value) || false}
                        onChange={() => toggleBondPurpose(purpose.value)}
                        className="mt-1 mr-3"
                      />
                      <div>
                        <div className="font-medium">{purpose.label}</div>
                        <div className="text-sm text-gray-400">{purpose.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.bondPurpose && (
                  <p className="text-red-400 text-sm mt-1">{errors.bondPurpose.message}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Rebalancing Rules */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rebalancing Frequency
                </label>
                <select
                  {...register('rebalancingFrequency')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value={RebalancingFrequency.ANNUAL}>Annual - Rebalance once per year</option>
                  <option value={RebalancingFrequency.THRESHOLD_BASED}>
                    Threshold Based - Rebalance when drift exceeds threshold
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Drift Threshold (%)
                </label>
                <input
                  type="number"
                  {...register('driftThreshold', { valueAsNumber: true })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  min="0"
                  max="50"
                  step="0.1"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Rebalance when allocation drifts beyond this percentage from target
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('preferContributions')}
                  className="mr-3"
                  id="preferContributions"
                />
                <label htmlFor="preferContributions" className="cursor-pointer">
                  Prefer new contributions over selling when rebalancing
                </label>
              </div>

              <div className="bg-gray-700 rounded-lg p-4 mt-6">
                <h3 className="font-semibold mb-2">Your Investment Philosophy</h3>
                <p className="text-sm text-gray-300">
                  I am designing a long-term system, not chasing returns. My primary goal is to stay invested
                  through all market conditions. I will not change this allocation due to market news, short-term
                  performance, fear, or excitement. I will only revise this system when my time horizon, income
                  stability, or life responsibilities change.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg ml-2"
              >
                Cancel
              </button>
            )}
          </div>
          <div>
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Configuration'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}





