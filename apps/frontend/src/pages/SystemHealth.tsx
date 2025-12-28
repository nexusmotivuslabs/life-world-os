/**
 * SystemHealth Page
 * 
 * Dedicated system health page with navigation to:
 * - Observability view
 * - Components view
 * - Dependencies view
 */

import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import SystemHealthObservabilityView from '../components/SystemHealthObservabilityView'
import SystemHealthComponentsView from '../components/SystemHealthComponentsView'
import SystemHealthDependenciesView from '../components/SystemHealthDependenciesView'

type SystemId = 'money' | 'energy' | 'travel' | 'dashboard'
type ViewType = 'observability' | 'components' | 'dependencies'

export default function SystemHealth() {
  const { systemId, view } = useParams<{ systemId: SystemId; view: ViewType }>()
  const navigate = useNavigate()

  if (!systemId || !view) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="text-center py-12 text-gray-400">
          <p>Invalid system health route</p>
          <button
            onClick={() => navigate('/tiers')}
            className="mt-4 text-blue-400 hover:text-blue-300"
          >
            Go to System Tiers
          </button>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (view) {
      case 'observability':
        return <SystemHealthObservabilityView systemId={systemId} />
      case 'components':
        return <SystemHealthComponentsView systemId={systemId} />
      case 'dependencies':
        return <SystemHealthDependenciesView systemId={systemId} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">System Health</h1>
            <p className="text-gray-400 text-sm mt-1">
              {systemId.toUpperCase()} System - {view.charAt(0).toUpperCase() + view.slice(1)}
            </p>
          </div>
        </div>

        {renderView()}
      </div>
    </div>
  )
}

