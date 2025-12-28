/**
 * EmergencyFundDecisionClarifier Component
 * 
 * A decision clarifier, not a math toy.
 * Answers three questions:
 * 1. How much safety do I actually need?
 * 2. What risks am I protecting against?
 * 3. How fast can I reach safety without harming my life today?
 */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle2, Info, Target, Clock, Brain, DollarSign } from 'lucide-react'
import { useToastStore } from '../store/useToastStore'
import { formatCurrencySimple } from '../utils/currency'
import SaveArtifactButton from './SaveArtifactButton'

enum EmploymentType {
  SALARIED = 'SALARIED',
  SELF_EMPLOYED = 'SELF_EMPLOYED',
  CONTRACTOR = 'CONTRACTOR',
  RETIRED = 'RETIRED',
}

enum JobSecurity {
  STABLE = 'STABLE',
  MODERATE = 'MODERATE',
  VOLATILE = 'VOLATILE',
}

enum RiskTolerance {
  CONSERVATIVE = 'CONSERVATIVE',
  BALANCED = 'BALANCED',
  AGGRESSIVE = 'AGGRESSIVE',
}

enum IncomeStructure {
  SINGLE_INCOME = 'SINGLE_INCOME',
  DUAL_INCOME = 'DUAL_INCOME',
  MULTIPLE_INCOME = 'MULTIPLE_INCOME',
}

interface RiskProfileInput {
  employmentType: EmploymentType
  jobSecurity: JobSecurity
  incomeStructure: IncomeStructure
  numberOfDependents: number
  isSoleEarner: boolean
  riskTolerance: RiskTolerance
  numberOfIncomeSources: number
}

interface CalculationResult {
  targetAmount: number
  recommendedMonthsCoverage: number
  currentCoverageMonths: number
  shortfall: number
  surplus: number
  coverageExplanation: string
  protectedRisks: string[]
  unprotectedRisks: string[]
  whyThisTarget: string
  recommendedMonthlyContribution?: number
  estimatedMonthsToTarget?: number
}

export default function EmergencyFundDecisionClarifier() {
  const { addToast } = useToastStore()
  const [step, setStep] = useState<'risk-profile' | 'expenses' | 'current-position' | 'results'>('risk-profile')
  const [calculating, setCalculating] = useState(false)
  const [result, setResult] = useState<CalculationResult | null>(null)

  // Risk Profile State
  const [riskProfile, setRiskProfile] = useState<RiskProfileInput>({
    employmentType: EmploymentType.SALARIED,
    jobSecurity: JobSecurity.STABLE,
    incomeStructure: IncomeStructure.SINGLE_INCOME,
    numberOfDependents: 0,
    isSoleEarner: false,
    riskTolerance: RiskTolerance.BALANCED,
    numberOfIncomeSources: 1,
  })

  // Essential Expenses
  const [monthlyEssentialExpenses, setMonthlyEssentialExpenses] = useState('')

  // Current Position
  const [currentEmergencySavings, setCurrentEmergencySavings] = useState('')
  const [liquidityType, setLiquidityType] = useState<'INSTANT' | 'DELAYED' | 'MIXED'>('INSTANT')
  const [monthlySurplus, setMonthlySurplus] = useState('')
  
  // User-driven monthly contribution
  const [userMonthlyContribution, setUserMonthlyContribution] = useState<string>('')

  const handleCalculate = async () => {
    if (!monthlyEssentialExpenses || parseFloat(monthlyEssentialExpenses) <= 0) {
      addToast({
        type: 'error',
        title: 'Missing Information',
        message: 'Please enter your monthly essential expenses',
      })
      return
    }

    try {
      setCalculating(true)
      const { productsApi } = await import('../services/financeApi')
      const data = await productsApi.calculateEmergencyFundWithRiskProfile({
        employmentType: riskProfile.employmentType as any,
        jobSecurity: riskProfile.jobSecurity as any,
        incomeStructure: riskProfile.incomeStructure as any,
        numberOfDependents: riskProfile.numberOfDependents,
        isSoleEarner: riskProfile.isSoleEarner,
        riskTolerance: riskProfile.riskTolerance as any,
        numberOfIncomeSources: riskProfile.numberOfIncomeSources,
        monthlyEssentialExpenses: parseFloat(monthlyEssentialExpenses),
        currentEmergencySavings: parseFloat(currentEmergencySavings) || 0,
        liquidityType,
        monthlySurplus: monthlySurplus ? parseFloat(monthlySurplus) : undefined,
      })
      setResult(data)
      // Initialize user's monthly contribution with recommended value
      if (data.recommendedMonthlyContribution) {
        setUserMonthlyContribution(data.recommendedMonthlyContribution.toString())
      }
      setStep('results')
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Calculation Failed',
        message: error instanceof Error ? error.message : 'Failed to calculate emergency fund',
      })
    } finally {
      setCalculating(false)
    }
  }

  const canProceedToExpenses = () => {
    return riskProfile.employmentType && riskProfile.jobSecurity && riskProfile.riskTolerance && riskProfile.incomeStructure
  }

  const canProceedToCurrentPosition = () => {
    return monthlyEssentialExpenses && parseFloat(monthlyEssentialExpenses) > 0
  }

  const canCalculate = () => {
    return canProceedToCurrentPosition() && currentEmergencySavings !== ''
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-blue-400" />
        <div>
          <h2 className="text-2xl font-bold">Emergency Fund Calculator</h2>
          <p className="text-sm text-gray-400 mt-1">A decision clarifier to determine your financial safety target</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {[
          { id: 'risk-profile', label: 'Risk Profile', icon: Brain },
          { id: 'expenses', label: 'Essential Expenses', icon: DollarSign },
          { id: 'current-position', label: 'Current Position', icon: Target },
          { id: 'results', label: 'Your Target', icon: CheckCircle2 },
        ].map((s, idx) => {
          const Icon = s.icon
          const isActive = step === s.id
          const isCompleted = (['risk-profile', 'expenses', 'current-position', 'results'].indexOf(step) > idx)
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-xs mt-2 ${isActive ? 'text-blue-400' : 'text-gray-500'}`}>{s.label}</span>
              </div>
              {idx < 3 && <div className={`h-0.5 flex-1 mx-2 ${isCompleted ? 'bg-green-600' : 'bg-gray-700'}`} />}
            </div>
          )
        })}
      </div>

      {/* Step 1: Risk Profile */}
      {step === 'risk-profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Income Stability</h3>
            <p className="text-sm text-gray-400 mb-4">This determines how much buffer you need</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Employment Type</label>
                <select
                  value={riskProfile.employmentType}
                  onChange={(e) => setRiskProfile({ ...riskProfile, employmentType: e.target.value as EmploymentType })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value={EmploymentType.SALARIED}>Salaried (Fixed income)</option>
                  <option value={EmploymentType.CONTRACTOR}>Contractor (Variable income)</option>
                  <option value={EmploymentType.SELF_EMPLOYED}>Self-Employed (Irregular income)</option>
                  <option value={EmploymentType.RETIRED}>Retired (Fixed income)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Job Security</label>
                <select
                  value={riskProfile.jobSecurity}
                  onChange={(e) => setRiskProfile({ ...riskProfile, jobSecurity: e.target.value as JobSecurity })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value={JobSecurity.STABLE}>Stable (Low risk of job loss)</option>
                  <option value={JobSecurity.MODERATE}>Moderate (Some uncertainty)</option>
                  <option value={JobSecurity.VOLATILE}>Volatile (High risk of job loss)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Income Structure</label>
                <select
                  value={riskProfile.incomeStructure}
                  onChange={(e) => setRiskProfile({ ...riskProfile, incomeStructure: e.target.value as IncomeStructure })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value={IncomeStructure.SINGLE_INCOME}>Single Income</option>
                  <option value={IncomeStructure.DUAL_INCOME}>Dual Income</option>
                  <option value={IncomeStructure.MULTIPLE_INCOME}>Multiple Income Sources (3+)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of Income Sources</label>
                <input
                  type="number"
                  min="1"
                  value={riskProfile.numberOfIncomeSources}
                  onChange={(e) => setRiskProfile({ ...riskProfile, numberOfIncomeSources: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Number of Dependents</label>
                <input
                  type="number"
                  min="0"
                  value={riskProfile.numberOfDependents}
                  onChange={(e) => setRiskProfile({ ...riskProfile, numberOfDependents: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="soleEarner"
                  checked={riskProfile.isSoleEarner}
                  onChange={(e) => setRiskProfile({ ...riskProfile, isSoleEarner: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="soleEarner" className="text-sm">I am the sole earner in my household</label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Risk Tolerance</label>
                <select
                  value={riskProfile.riskTolerance}
                  onChange={(e) => setRiskProfile({ ...riskProfile, riskTolerance: e.target.value as RiskTolerance })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value={RiskTolerance.CONSERVATIVE}>Conservative (Prefer more safety)</option>
                  <option value={RiskTolerance.BALANCED}>Balanced</option>
                  <option value={RiskTolerance.AGGRESSIVE}>Aggressive (Willing to take more risk)</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep('expenses')}
            disabled={!canProceedToExpenses()}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-md font-medium"
          >
            Continue to Essential Expenses
          </button>
        </motion.div>
      )}

      {/* Step 2: Essential Expenses */}
      {step === 'expenses' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Survival Burn Rate</h3>
            <p className="text-sm text-gray-400 mb-4">
              Enter only essential expenses: housing, utilities, food, transport, insurance, minimum debt payments.
              <br />
              <strong>Do not include:</strong> entertainment, dining out, savings, investments, or lifestyle expenses.
            </p>
            
            <div>
              <label className="block text-sm font-medium mb-2">Monthly Essential Expenses</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monthlyEssentialExpenses}
                onChange={(e) => setMonthlyEssentialExpenses(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                placeholder="Enter total monthly essential expenses"
              />
              <p className="text-xs text-gray-500 mt-1">This is your survival burn rate - the minimum needed to live</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('risk-profile')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-medium"
            >
              Back
            </button>
            <button
              onClick={() => setStep('current-position')}
              disabled={!canProceedToCurrentPosition()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-md font-medium"
            >
              Continue to Current Position
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Current Position */}
      {step === 'current-position' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Current Safety Net</h3>
            <p className="text-sm text-gray-400 mb-4">Tell us what you have saved for emergencies right now</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Emergency Savings</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentEmergencySavings}
                  onChange={(e) => setCurrentEmergencySavings(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Liquidity Type</label>
                <select
                  value={liquidityType}
                  onChange={(e) => setLiquidityType(e.target.value as 'INSTANT' | 'DELAYED' | 'MIXED')}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="INSTANT">Instant Access (Checking/Savings)</option>
                  <option value="DELAYED">Delayed Access (CDs, Bonds)</option>
                  <option value="MIXED">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Monthly Surplus (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={monthlySurplus}
                  onChange={(e) => setMonthlySurplus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="Amount you can save monthly (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">If provided, we'll calculate how long to reach your target</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('expenses')}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-medium"
            >
              Back
            </button>
            <button
              onClick={handleCalculate}
              disabled={!canCalculate() || calculating}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-md font-medium"
            >
              {calculating ? 'Calculating...' : 'Calculate My Emergency Fund Target'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Results */}
      {step === 'results' && result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Core Output */}
          <div className="bg-blue-500/10 border-2 border-blue-500 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold">Your Emergency Fund Target</h3>
            </div>
            <div className="text-4xl font-bold text-blue-400 mb-2">
              {formatCurrencySimple(result.targetAmount)}
            </div>
            <p className="text-gray-300">
              This provides <strong>{result.recommendedMonthsCoverage} months</strong> of essential expense coverage
            </p>
          </div>

          {/* Current Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Current Coverage</div>
              <div className="text-2xl font-bold">{result.currentCoverageMonths.toFixed(1)} months</div>
            </div>
            <div className={`bg-gray-700/50 rounded-lg p-4 ${result.shortfall > 0 ? 'border-2 border-red-500' : 'border-2 border-green-500'}`}>
              <div className="text-sm text-gray-400 mb-1">{result.shortfall > 0 ? 'Shortfall' : 'Surplus'}</div>
              <div className={`text-2xl font-bold ${result.shortfall > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {formatCurrencySimple(Math.abs(result.shortfall > 0 ? result.shortfall : result.surplus))}
              </div>
            </div>
          </div>

          {/* Why This Target */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" />
              Why This Target
            </h4>
            <div className="text-sm text-gray-300 whitespace-pre-line">{result.whyThisTarget}</div>
          </div>

          {/* Coverage Explanation */}
          <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
            <h4 className="font-semibold mb-3">How This Target Was Calculated</h4>
            <div className="text-sm text-gray-300 whitespace-pre-line">{result.coverageExplanation}</div>
          </div>

          {/* Protected Risks */}
          <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              What This Protects Against
            </h4>
            <ul className="space-y-1 text-sm text-gray-300">
              {result.protectedRisks.map((risk, idx) => (
                <li key={idx}>• {risk}</li>
              ))}
            </ul>
          </div>

          {/* Unprotected Risks */}
          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="w-5 h-5" />
              What This Does NOT Protect Against
            </h4>
            <ul className="space-y-1 text-sm text-gray-300">
              {result.unprotectedRisks.map((risk, idx) => (
                <li key={idx}>• {risk}</li>
              ))}
            </ul>
          </div>

          {/* Action Plan - User-Driven Path to Safety */}
          {result.recommendedMonthlyContribution && result.estimatedMonthsToTarget && (
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
              <h4 className="font-semibold mb-4 flex items-center gap-2 text-blue-400">
                <Clock className="w-5 h-5" />
                Your Path to Safety
              </h4>
              
              {/* User Monthly Contribution Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Your Monthly Contribution
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={userMonthlyContribution || result.recommendedMonthlyContribution.toString()}
                    onChange={(e) => setUserMonthlyContribution(e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter your monthly contribution"
                  />
                  <button
                    type="button"
                    onClick={() => setUserMonthlyContribution(result.recommendedMonthlyContribution!.toString())}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-gray-300 whitespace-nowrap"
                  >
                    Use Recommended
                  </button>
                </div>
                {result.recommendedMonthlyContribution && (
                  <p className="text-xs text-gray-400 mt-1">
                    Recommended: {formatCurrencySimple(result.recommendedMonthlyContribution)} (based on your situation)
                  </p>
                )}
              </div>

              {/* Calculated Time to Target */}
              {(() => {
                const contribution = parseFloat(userMonthlyContribution) || result.recommendedMonthlyContribution || 0
                const shortfall = result.shortfall > 0 ? result.shortfall : 0
                const estimatedMonths = contribution > 0 
                  ? Math.ceil(shortfall / contribution)
                  : result.estimatedMonthsToTarget || 0
                const isUserCustom = userMonthlyContribution && parseFloat(userMonthlyContribution) !== result.recommendedMonthlyContribution
                
                return (
                  <div className="space-y-3">
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Your Monthly Contribution:</span>
                        <strong className="text-white text-lg">
                          {formatCurrencySimple(contribution)}
                        </strong>
                      </div>
                      {isUserCustom && result.recommendedMonthlyContribution && (
                        <p className="text-xs text-gray-400 mt-1">
                          {contribution > result.recommendedMonthlyContribution 
                            ? `✓ You're contributing more than recommended - you'll reach your goal faster!`
                            : `ℹ️ Recommended: ${formatCurrencySimple(result.recommendedMonthlyContribution)}/month`
                          }
                        </p>
                      )}
                    </div>
                    <div className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Estimated Time to Target:</span>
                        <strong className="text-white text-lg">
                          {estimatedMonths} {estimatedMonths === 1 ? 'month' : 'months'}
                        </strong>
                      </div>
                      {estimatedMonths > 0 && (
                        <p className="text-xs text-gray-400 mt-1">
                          {estimatedMonths < 12 
                            ? `You'll reach your goal in ${estimatedMonths} ${estimatedMonths === 1 ? 'month' : 'months'}`
                            : estimatedMonths < 24
                            ? `You'll reach your goal in ${(estimatedMonths / 12).toFixed(1)} years`
                            : `You'll reach your goal in ${Math.floor(estimatedMonths / 12)} years and ${estimatedMonths % 12} months`
                          }
                        </p>
                      )}
                    </div>
                    {contribution > 0 && shortfall > 0 && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                        <p className="text-sm text-green-400 mb-2">
                          <strong>Remaining to save:</strong> {formatCurrencySimple(shortfall)}
                        </p>
                        <div className="space-y-1 text-xs text-gray-400">
                          <p>
                            At {formatCurrencySimple(contribution)}/month, you'll save {formatCurrencySimple(contribution * 12)} per year
                          </p>
                          {isUserCustom && result.recommendedMonthlyContribution && (
                            <p className="text-yellow-400">
                              {contribution < result.recommendedMonthlyContribution
                                ? `Note: At recommended ${formatCurrencySimple(result.recommendedMonthlyContribution)}/month, you'd reach your goal in ${result.estimatedMonthsToTarget} months`
                                : `Great! You're ahead of the recommended pace`
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          {/* Mental Model Reminder */}
          <div className="bg-purple-500/10 border border-purple-500 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-purple-400 mt-0.5" />
              <div className="text-sm text-gray-300">
                <p className="font-semibold text-purple-400 mb-1">Remember: Emergency Fund = Oxygen</p>
                <p>This is not investment. Not growth. Not optimization.</p>
                <p>Just breathing room to think clearly when life applies pressure.</p>
              </div>
            </div>
          </div>

          {/* Save Artifact Button */}
          {result && (
            <div className="flex items-center gap-4 mb-4">
              <SaveArtifactButton
                productName="Emergency Fund Decision Clarifier"
                type="CALCULATION"
                title={`Emergency Fund Plan - ${formatCurrencySimple(result.targetAmount)} target`}
                description={`Emergency fund calculation based on ${result.recommendedMonthsCoverage} months coverage. Current coverage: ${result.currentCoverageMonths.toFixed(1)} months. ${result.shortfall > 0 ? `Shortfall: ${formatCurrencySimple(result.shortfall)}` : `Surplus: ${formatCurrencySimple(Math.abs(result.shortfall))}`}`}
                data={{
                  ...result,
                  userMonthlyContribution: userMonthlyContribution || result.recommendedMonthlyContribution,
                  estimatedMonths: result.shortfall > 0 && (parseFloat(userMonthlyContribution) || result.recommendedMonthlyContribution) 
                    ? Math.ceil(result.shortfall / (parseFloat(userMonthlyContribution) || result.recommendedMonthlyContribution || 1))
                    : result.estimatedMonthsToTarget,
                }}
                tags={['emergency-fund', 'cash-flow', 'savings']}
                className="flex-1"
              />
              <button
                onClick={() => {
                  setStep('risk-profile')
                  setResult(null)
                  setUserMonthlyContribution('')
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md font-medium"
              >
                Start Over
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

