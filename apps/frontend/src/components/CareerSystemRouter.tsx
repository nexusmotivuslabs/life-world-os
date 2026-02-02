/**
 * Career System Router
 * 
 * Routes to the appropriate career system component based on systemId parameter
 * Handles: Trust, Reputation, Optionality
 */

import { useParams } from 'react-router-dom'
import { FeatureErrorBoundary } from './ErrorBoundary'
import CareerSystemDetail from './CareerSystemDetail'

export default function CareerSystemRouter() {
  const { systemId } = useParams<{ systemId: string }>()

  const validSystems = ['trust', 'reputation', 'optionality']

  if (!systemId || !validSystems.includes(systemId)) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-xl">System not found</div>
      </div>
    )
  }

  const getFeatureName = () => {
    switch (systemId) {
      case 'trust':
        return 'Trust System'
      case 'reputation':
        return 'Reputation System'
      case 'optionality':
        return 'Optionality System'
      default:
        return 'Career System'
    }
  }

  return (
    <FeatureErrorBoundary featureName={getFeatureName()}>
      <CareerSystemDetail systemId={systemId as 'trust' | 'reputation' | 'optionality'} />
    </FeatureErrorBoundary>
  )
}
