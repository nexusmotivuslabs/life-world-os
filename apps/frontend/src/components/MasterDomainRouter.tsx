/**
 * Master Domain Router
 * 
 * Routes to the appropriate master system component based on domain parameter
 */

import { useParams, Navigate } from 'react-router-dom'
import MasterFinance from '../pages/MasterFinance'
import MasterEnergy from '../pages/MasterEnergy'
import MasterTravel from '../pages/MasterTravel'
import MasterHealth from '../pages/MasterHealth'
import MasterSoftware from '../pages/MasterSoftware'
import MasterCareer from '../pages/MasterCareer'
import MasterRelationships from '../pages/MasterRelationships'
import { MasterDomain } from '../types'
import { FeatureErrorBoundary } from './ErrorBoundary'

export default function MasterDomainRouter() {
  const { domain } = useParams<{ domain: string }>()

  const getFeatureName = () => {
    switch (domain) {
      case MasterDomain.FINANCE:
        return 'Master Finance System'
      case MasterDomain.ENERGY:
        return 'Master Energy System'
      case MasterDomain.TRAVEL:
        return 'Master Travel System'
      case MasterDomain.SOFTWARE:
        return 'Master Software System'
      case MasterDomain.HEALTH:
        return 'Health / Capacity System'
      case MasterDomain.MEANING:
        return 'Meaning System'
      case MasterDomain.CAREER:
        return 'Career System'
      case MasterDomain.RELATIONSHIPS:
        return 'Relationships System'
      default:
        return 'Master System'
    }
  }

  switch (domain) {
    case MasterDomain.FINANCE:
      return (
        <FeatureErrorBoundary featureName={getFeatureName()}>
          <MasterFinance />
        </FeatureErrorBoundary>
      )
    case MasterDomain.ENERGY:
      return (
        <FeatureErrorBoundary featureName={getFeatureName()}>
          <MasterEnergy />
        </FeatureErrorBoundary>
      )
    case MasterDomain.TRAVEL:
      return (
        <FeatureErrorBoundary featureName={getFeatureName()}>
          <MasterTravel />
        </FeatureErrorBoundary>
      )
    case MasterDomain.SOFTWARE:
      return (
        <FeatureErrorBoundary featureName={getFeatureName()}>
          <MasterSoftware />
        </FeatureErrorBoundary>
      )
    case MasterDomain.HEALTH:
      return (
        <FeatureErrorBoundary featureName={getFeatureName()}>
          <MasterHealth />
        </FeatureErrorBoundary>
      )
    case MasterDomain.MEANING:
      // Meaning System is in Knowledge Plane, not Systems Plane
      return <Navigate to="/knowledge/meaning" replace />
    case MasterDomain.CAREER:
      return (
        <FeatureErrorBoundary featureName={getFeatureName()}>
          <MasterCareer />
        </FeatureErrorBoundary>
      )
    case MasterDomain.RELATIONSHIPS:
      return (
        <FeatureErrorBoundary featureName={getFeatureName()}>
          <MasterRelationships />
        </FeatureErrorBoundary>
      )
    default:
      return (
        <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
          <div className="text-xl">System not found</div>
        </div>
      )
  }
}

