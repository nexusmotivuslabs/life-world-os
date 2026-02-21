/**
 * Risk Mitigation Planner
 * Optionality mini-app: plan cash, health, and reputation buffers; track exposure.
 */
import { useState } from 'react'
import { Shield, DollarSign, Heart, Users, Plus, Trash2 } from 'lucide-react'

type BufferType = 'cash' | 'health' | 'reputation'

interface Buffer {
  id: string
  type: BufferType
  name: string
  target: string
  current: string
}

const bufferLabels: Record<BufferType, { label: string; icon: typeof DollarSign }> = {
  cash: { label: 'Cash reserve', icon: DollarSign },
  health: { label: 'Health capacity', icon: Heart },
  reputation: { label: 'Reputation goodwill', icon: Users },
}

export default function RiskMitigationPlanner() {
  const [buffers, setBuffers] = useState<Buffer[]>([])
  const [newType, setNewType] = useState<BufferType>('cash')
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')
  const [newCurrent, setNewCurrent] = useState('')

  const addBuffer = () => {
    if (!newName.trim()) return
    setBuffers((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: newType,
        name: newName.trim(),
        target: newTarget.trim(),
        current: newCurrent.trim(),
      },
    ])
    setNewName('')
    setNewTarget('')
    setNewCurrent('')
  }

  const removeBuffer = (id: string) => {
    setBuffers((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Shield className="w-4 h-4 text-blue-400" /> Risk buffers
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        Plan cash, health, and reputation buffers for irreversible risks.
      </p>
      <div className="space-y-2 mb-4">
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as BufferType)}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white"
        >
          {(Object.keys(bufferLabels) as BufferType[]).map((t) => (
            <option key={t} value={t}>
              {bufferLabels[t].label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="e.g. 6-month emergency fund"
          className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white placeholder-gray-500"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={newTarget}
            onChange={(e) => setNewTarget(e.target.value)}
            placeholder="Target"
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white placeholder-gray-500"
          />
          <input
            type="text"
            value={newCurrent}
            onChange={(e) => setNewCurrent(e.target.value)}
            placeholder="Current"
            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-sm text-white placeholder-gray-500"
          />
        </div>
        <button
          type="button"
          onClick={addBuffer}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm"
        >
          <Plus className="w-4 h-4" /> Add buffer
        </button>
      </div>
      <div className="space-y-2">
        {buffers.length === 0 ? (
          <p className="text-xs text-gray-500">No buffers yet. Add one above.</p>
        ) : (
          buffers.map((b) => {
            const { icon: Icon } = bufferLabels[b.type]
            return (
              <div
                key={b.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 border border-gray-600"
              >
                <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{b.name}</p>
                  <p className="text-xs text-gray-400">
                    Current: {b.current || '—'} → Target: {b.target || '—'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeBuffer(b.id)}
                  className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-gray-700"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
