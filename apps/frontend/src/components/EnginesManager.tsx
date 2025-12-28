import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Save, Briefcase, TrendingUp, DollarSign, BookOpen } from 'lucide-react'
import { Engine, EngineType, EngineStatus } from '../types'
import { enginesApi } from '../services/api'
import { useGameStore } from '../store/useGameStore'
import { getEngineTypeDisplayName, getEngineStatusDisplayName } from '../utils/enumDisplayNames'

const engineSchema = z.object({
  type: z.nativeEnum(EngineType),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  fragilityScore: z.number().min(0).max(100),
  currentOutput: z.number().min(0),
  status: z.nativeEnum(EngineStatus),
})

type EngineFormData = z.infer<typeof engineSchema>

interface EnginesManagerProps {
  engines: Engine[]
  onUpdate: () => void
}

const engineTypeConfig: Record<EngineType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  [EngineType.CAREER]: { label: getEngineTypeDisplayName(EngineType.CAREER), icon: Briefcase, color: 'bg-blue-500' },
  [EngineType.BUSINESS]: { label: getEngineTypeDisplayName(EngineType.BUSINESS), icon: TrendingUp, color: 'bg-green-500' },
  [EngineType.INVESTMENT]: { label: getEngineTypeDisplayName(EngineType.INVESTMENT), icon: DollarSign, color: 'bg-yellow-500' },
  [EngineType.LEARNING]: { label: getEngineTypeDisplayName(EngineType.LEARNING), icon: BookOpen, color: 'bg-purple-500' },
}

export default function EnginesManager({ engines, onUpdate }: EnginesManagerProps) {
  const { isDemo } = useGameStore()
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EngineFormData>({
    resolver: zodResolver(engineSchema),
    defaultValues: {
      type: EngineType.CAREER,
      status: EngineStatus.ACTIVE,
      fragilityScore: 50,
      currentOutput: 0,
    },
  })

  const onSubmit = async (data: EngineFormData) => {
    if (isDemo) return

    setLoading(true)
    try {
      if (editingId) {
        await enginesApi.updateEngine(editingId, data)
      } else {
        await enginesApi.createEngine(data)
      }
      reset()
      setIsCreating(false)
      setEditingId(null)
      onUpdate()
    } catch (error) {
      console.error('Failed to save engine:', error)
      alert(error instanceof Error ? error.message : 'Failed to save engine')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (isDemo || !confirm('Are you sure you want to delete this engine?')) return

    setLoading(true)
    try {
      await enginesApi.deleteEngine(id)
      onUpdate()
    } catch (error) {
      console.error('Failed to delete engine:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete engine')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (engine: Engine) => {
    setEditingId(engine.id)
    setIsCreating(false)
    setValue('type', engine.type)
    setValue('name', engine.name)
    setValue('description', engine.description || '')
    setValue('fragilityScore', engine.fragilityScore)
    setValue('currentOutput', engine.currentOutput)
    setValue('status', engine.status)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    reset()
  }

  const getFragilityColor = (score: number) => {
    if (score >= 70) return 'text-red-400'
    if (score >= 40) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getStatusColor = (status: EngineStatus) => {
    switch (status) {
      case EngineStatus.ACTIVE:
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case EngineStatus.INACTIVE:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      case EngineStatus.PLANNING:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Engines</h2>
        {!isDemo && !isCreating && !editingId && (
          <button
            onClick={() => {
              setIsCreating(true)
              setEditingId(null)
              reset()
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Engine
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(isCreating || editingId) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-700 rounded-lg border border-gray-600"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    disabled={isDemo}
                  >
                    {Object.values(EngineType).map((type) => (
                      <option key={type} value={type}>
                        {engineTypeConfig[type].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    disabled={isDemo}
                  >
                    {Object.values(EngineStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  <input
                    {...register('name')}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    disabled={isDemo}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <input
                    {...register('description')}
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    disabled={isDemo}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Fragility Score (0-100)
                  </label>
                  <input
                    type="number"
                    {...register('fragilityScore', { valueAsNumber: true })}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    disabled={isDemo}
                  />
                  {errors.fragilityScore && (
                    <p className="text-red-400 text-xs mt-1">{errors.fragilityScore.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Current Output</label>
                  <input
                    type="number"
                    {...register('currentOutput', { valueAsNumber: true })}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white"
                    disabled={isDemo}
                  />
                  {errors.currentOutput && (
                    <p className="text-red-400 text-xs mt-1">{errors.currentOutput.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading || isDemo}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm font-medium disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Engines List */}
      <div className="space-y-3">
        {engines.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No engines yet. Add your first engine to get started.</p>
        ) : (
          engines.map((engine) => {
            const config = engineTypeConfig[engine.type]
            const Icon = config.icon

            if (editingId === engine.id) {
              return null // Form is shown above
            }

            return (
              <motion.div
                key={engine.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-700 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`${config.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{engine.name}</h3>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                            engine.status
                          )}`}
                        >
                          {getEngineStatusDisplayName(engine.status)}
                        </span>
                      </div>
                      {engine.description && (
                        <p className="text-gray-400 text-sm mb-2">{engine.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Output: </span>
                          <span className="text-white font-medium">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(engine.currentOutput)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Fragility: </span>
                          <span className={`font-medium ${getFragilityColor(engine.fragilityScore)}`}>
                            {engine.fragilityScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!isDemo && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(engine)}
                        className="p-2 hover:bg-gray-600 rounded text-gray-400 hover:text-white"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(engine.id)}
                        className="p-2 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

