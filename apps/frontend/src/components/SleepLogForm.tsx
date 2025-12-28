import { useState } from 'react'
import { sleepApi } from '../services/energyApi'
import { Moon, Clock, Save } from 'lucide-react'
import { motion } from 'framer-motion'

interface SleepLogFormProps {
  onSleepLogged: () => void
}

export default function SleepLogForm({ onSleepLogged }: SleepLogFormProps) {
  const [hoursSlept, setHoursSlept] = useState(7.5)
  const [quality, setQuality] = useState(8)
  const [bedTime, setBedTime] = useState('')
  const [wakeTime, setWakeTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Default to yesterday's date (most recent sleep)
  const [date, setDate] = useState(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await sleepApi.logSleep({
        date,
        hoursSlept,
        quality,
        bedTime: bedTime || undefined,
        wakeTime: wakeTime || undefined,
        notes: notes || undefined,
      })

      setSuccess(true)
      // Reset form
      setHoursSlept(7.5)
      setQuality(8)
      setBedTime('')
      setWakeTime('')
      setNotes('')
      
      // Notify parent
      onSleepLogged()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log sleep')
    } finally {
      setLoading(false)
    }
  }

  // Calculate estimated restoration preview
  const estimatedRestoration = Math.min(
    Math.floor(Math.min(hoursSlept, 8) * (0.5 + (quality / 10) * 1.0)) + 
    (hoursSlept >= 7 && hoursSlept <= 9 && quality >= 8 ? 20 : 0),
    110
  )

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Moon className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold">Log Sleep</h2>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-500/50 rounded-lg">
          <p className="text-sm text-green-400">Sleep logged successfully! Base energy will be restored.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date of Sleep
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            required
          />
        </div>

        {/* Hours Slept */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Hours Slept: {hoursSlept.toFixed(1)}h
          </label>
          <input
            type="range"
            min="0"
            max="24"
            step="0.5"
            value={hoursSlept}
            onChange={(e) => setHoursSlept(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0h</span>
            <span>12h</span>
            <span>24h</span>
          </div>
        </div>

        {/* Quality */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Sleep Quality: {quality}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Poor (1)</span>
            <span>Excellent (10)</span>
          </div>
        </div>

        {/* Bed Time & Wake Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Bed Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={bedTime}
              onChange={(e) => setBedTime(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Wake Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            placeholder="Any notes about your sleep..."
          />
        </div>

        {/* Restoration Preview */}
        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-blue-300">Estimated Energy Restoration</div>
              <div className="text-xs text-blue-400">
                Based on {hoursSlept.toFixed(1)}h sleep, quality {quality}/10
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              +{estimatedRestoration}
            </div>
          </div>
          {hoursSlept >= 7 && hoursSlept <= 9 && quality >= 8 && (
            <div className="mt-2 text-xs text-green-400">
              ✓ Optimal sleep detected - bonus restoration applied!
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Logging Sleep...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Log Sleep
            </>
          )}
        </button>
      </form>
    </div>
  )
}

