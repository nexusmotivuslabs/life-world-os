/**
 * Navigation Hook
 * 
 * Provides consistent navigation patterns and breadcrumb data.
 * Integrates React Router with Zustand navigation store.
 */

import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { buildBreadcrumbs, getMasterRoute, getMasterProductRoute, RouteConfig } from '../config/routes'
import { MasterDomain } from '../types'
import { useNavigationStore } from '../store/useNavigationStore'
import { getNavigationPath } from '../services/navigationService'

export function useNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Zustand navigation store
  const {
    currentPath: storePath,
    previousPath,
    history,
    setCurrentPath,
    navigateTo: storeNavigateTo,
    goBack: storeGoBack,
    getNavigationStats,
  } = useNavigationStore()

  // Sync React Router location with Zustand store
  useEffect(() => {
    if (location.pathname !== storePath) {
      setCurrentPath(location.pathname)
    }
  }, [location.pathname, storePath, setCurrentPath])

  /**
   * Get breadcrumbs for current route
   * Uses hierarchical navigation ontology with fallback to route config
   */
  const getBreadcrumbs = (): RouteConfig[] => {
    // Try hierarchical navigation path first
    const navPath = getNavigationPath(location.pathname)
    
    if (navPath.length > 0) {
      // Convert navigation nodes to route configs
      const breadcrumbs: RouteConfig[] = navPath.map(node => {
        // Try to find matching route config for icons
        const routeConfig = buildBreadcrumbs(node.path)[0]
        return {
          path: node.path,
          label: node.title,
          icon: routeConfig?.icon,
        }
      })
      
      return breadcrumbs
    }
    
    // Fallback to original breadcrumb system
    return buildBreadcrumbs(location.pathname)
  }

  /**
   * Navigate to master domain route
   */
  const navigateToMaster = (domain: MasterDomain) => {
    const path = getMasterRoute(domain)
    storeNavigateTo(path)
    navigate(path)
  }

  /**
   * Navigate to master product route
   */
  const navigateToMasterProduct = (domain: MasterDomain, productId: string) => {
    const path = getMasterProductRoute(domain, productId)
    storeNavigateTo(path)
    navigate(path)
  }

  /**
   * Navigate to route by path
   */
  const navigateTo = (path: string, options?: { replace?: boolean; state?: unknown }) => {
    storeNavigateTo(path, options)
    navigate(path, options)
  }

  /**
   * Navigate back
   */
  const goBack = () => {
    storeGoBack()
    navigate(-1)
  }

  return {
    // Current navigation state
    currentPath: location.pathname,
    previousPath,
    history,
    breadcrumbs: getBreadcrumbs(),
    
    // Navigation methods
    navigateToMaster,
    navigateToMasterProduct,
    navigateTo,
    goBack,
    
    // Navigation statistics
    getNavigationStats,
  }
}

