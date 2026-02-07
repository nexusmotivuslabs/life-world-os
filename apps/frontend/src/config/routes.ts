/**
 * Centralized Route Configuration
 * 
 * Single source of truth for all routes in the application.
 * Provides type-safe route helpers and route metadata for navigation.
 */

import { MasterDomain } from '../types'
import { 
  DollarSign, 
  TrendingUp, 
  Zap, 
  MapPin,
  BarChart3,
  Settings,
  Home,
  Shield,
  BookOpen,
  Target,
  Eye,
  HeartPulse,
  Sparkles,
  Layers,
  Search,
  List,
  Sword
} from 'lucide-react'
import { ComponentType } from 'react'

/**
 * Route configuration interface
 */
export interface RouteConfig {
  path: string
  label: string
  parent?: string
  icon?: ComponentType<{ className?: string }>
  requiresAuth?: boolean
  description?: string
}

/**
 * Route helper functions for master domains
 */
export const getMasterRoute = (domain: MasterDomain): string => `/master/${domain}`

export const getMasterProductRoute = (domain: MasterDomain, productId: string): string => 
  `/master/${domain}/products/${productId}`

export const getSystemHealthRoute = (systemId: string, view: 'observability' | 'components' | 'dependencies'): string =>
  `/system-health/${systemId}/${view}`

/**
 * Route definitions
 */
export const routes: Record<string, RouteConfig> = {
  home: {
    path: '/',
    label: 'Home',
    icon: Home,
    requiresAuth: false,
  },
  explore: {
    path: '/explore',
    label: 'Explore Systems',
    parent: '/',
    requiresAuth: false,
  },
  tiers: {
    path: '/tiers',
    label: 'System Tiers',
    parent: '/choose-plane',
    icon: Layers,
    requiresAuth: false,
    description: 'Universal system hierarchy: Survival, Stability, Growth, Leverage, Expression',
  },
  choosePlane: {
    path: '/choose-plane',
    label: 'Choose Mode',
    parent: '/',
    requiresAuth: true,
  },
  knowledge: {
    path: '/knowledge',
    label: 'Knowledge',
    parent: '/choose-plane',
    icon: BookOpen,
    requiresAuth: true,
    description: 'Understand - Laws, frameworks, and guides',
  },
  knowledgeSearch: {
    path: '/knowledge/search',
    label: 'Search',
    parent: '/knowledge',
    icon: Search,
    requiresAuth: true,
    description: 'Search across all knowledge content',
  },
  knowledgeOverview: {
    path: '/knowledge/overview',
    label: 'Reality',
    parent: '/knowledge',
    icon: Layers,
    requiresAuth: true,
    description: 'Full hierarchical view of all laws, principles, and frameworks',
  },
  knowledgeLaws: {
    path: '/knowledge/laws',
    label: 'Laws, Principles & Frameworks',
    parent: '/knowledge',
    icon: BookOpen,
    requiresAuth: true,
    description: '48 Laws of Power, Bible Laws, Principles, and strategic frameworks',
  },
  knowledgeConstraints: {
    path: '/knowledge/constraints',
    label: 'Constraints of Reality',
    parent: '/knowledge',
    icon: Target,
    requiresAuth: true,
    description: 'constraints of reality',
  },
  knowledgeMeaning: {
    path: '/knowledge/meaning',
    label: 'Meaning System',
    parent: '/knowledge',
    icon: Sparkles,
    requiresAuth: true,
    description: 'Purpose, values alignment, and Awareness Layers',
  },
  systems: {
    path: '/systems',
    label: 'Systems',
    parent: '/choose-plane',
    icon: Zap,
    requiresAuth: true,
    description: 'Operate - Executable, state-changing systems',
  },
  insight: {
    path: '/insight',
    label: 'Insight',
    parent: '/choose-plane',
    icon: Eye,
    requiresAuth: true,
    description: 'Reflect - Analytics, trends, and reports',
  },
  configuration: {
    path: '/configuration',
    label: 'Configuration',
    parent: '/',
    icon: Settings,
    requiresAuth: true,
    description: 'Settings, preferences, and thresholds',
  },
  systemsTiers: {
    path: '/systems/tiers',
    label: 'System tiers',
    parent: '/systems',
    icon: Layers,
    requiresAuth: true,
    description: 'Systems organized by tier hierarchy',
  },
  systemsList: {
    path: '/systems/list',
    label: 'List view',
    parent: '/systems',
    icon: List,
    requiresAuth: true,
    description: 'All systems in list format',
  },
  systemsArtifacts: {
    path: '/systems/artifacts',
    label: 'Artifacts',
    parent: '/systems',
    icon: Sparkles,
    requiresAuth: true,
    description: 'Significant pieces of the OS',
  },
  dashboard: {
    path: '/dashboard',
    label: 'Dashboard',
    parent: '/systems',
    icon: BarChart3,
    requiresAuth: true,
  },
  login: {
    path: '/login',
    label: 'Login',
    requiresAuth: false,
  },
  register: {
    path: '/register',
    label: 'Register',
    requiresAuth: false,
  },
  setFirstName: {
    path: '/set-first-name',
    label: 'Set First Name',
    requiresAuth: true,
  },
  admin: {
    path: '/admin',
    label: 'Admin',
    parent: '/systems',
    icon: Settings,
    requiresAuth: true,
  },
  loadouts: {
    path: '/loadouts',
    label: 'Loadouts',
    parent: '/choose-plane',
    icon: Target,
    requiresAuth: true,
    description: 'Weapons and armour. Equip tools, strategies, and capabilities.',
  },
  loadoutsManage: {
    path: '/loadouts/manage',
    label: 'Manage Loadout',
    parent: '/loadouts',
    icon: Target,
    requiresAuth: true,
    description: 'Full loadout management: weapons, armour, grenades, tactical, support',
  },
  blogs: {
    path: '/blogs',
    label: 'Blog',
    parent: '/choose-plane',
    icon: BookOpen,
    requiresAuth: true,
    description: 'Technical articles and insights',
  },
  masterFinance: {
    path: getMasterRoute(MasterDomain.FINANCE),
    label: 'Finance',
    parent: '/explore',
    icon: DollarSign,
    requiresAuth: true,
    description: 'Financial guidance with AI agents, domain teams, and interactive products',
  },
  masterEnergy: {
    path: getMasterRoute(MasterDomain.ENERGY),
    label: 'Energy',
    parent: '/explore',
    icon: Zap,
    requiresAuth: true,
    description: 'Track and manage your energy levels and capacity',
  },
  masterTravel: {
    path: getMasterRoute(MasterDomain.TRAVEL),
    label: 'Travel',
    parent: '/explore',
    icon: MapPin,
    requiresAuth: true,
    description: 'Find location alternatives and travel recommendations',
  },
  masterSoftware: {
    path: getMasterRoute(MasterDomain.SOFTWARE),
    label: 'Software',
    parent: '/explore',
    icon: BarChart3,
    requiresAuth: true,
    description: 'Design, build, and operate software systems for tech practitioners',
  },
  masterHealth: {
    path: getMasterRoute(MasterDomain.HEALTH),
    label: 'Health',
    parent: '/explore',
    icon: HeartPulse,
    requiresAuth: true,
    description: 'Human operating stability: physical health, mental resilience, cognitive efficiency, and recovery elasticity',
  },
  masterMeaning: {
    path: getMasterRoute(MasterDomain.MEANING),
    label: 'Meaning',
    parent: '/explore',
    icon: Sparkles,
    requiresAuth: true,
    description: 'Purpose, values alignment, and spiritual/psychological resilience. Includes Awareness Layers as interpretation context.',
  },
  masterFinanceProduct: {
    path: getMasterProductRoute(MasterDomain.FINANCE, ':productId'),
    label: 'Product Details',
    parent: getMasterRoute(MasterDomain.FINANCE),
    requiresAuth: true,
  },
  systemHealth: {
    path: '/system-health/:systemId/:view',
    label: 'System Health',
    parent: '/explore',
    icon: Eye,
    requiresAuth: true,
    description: 'System health observability, components, and dependencies',
  },
  weapons: {
    path: '/weapons',
    label: 'Weapons',
    parent: '/choose-plane',
    icon: Sword,
    requiresAuth: true,
    description: 'Equip powerful tools, strategies, and capabilities (Coming Soon)',
  },
  artifactsMode: {
    path: '/artifacts-mode',
    label: 'Artifacts',
    parent: '/choose-plane',
    icon: Sparkles,
    requiresAuth: true,
    description: 'Discover and collect significant pieces of your OS (Coming Soon)',
  },
}

/**
 * Get route config by path
 */
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return Object.values(routes).find(route => route.path === path)
}

/**
 * Get route config by key
 */
export const getRoute = (key: string): RouteConfig | undefined => {
  return routes[key]
}

/**
 * Build breadcrumb trail from current path
 */
export const buildBreadcrumbs = (currentPath: string): RouteConfig[] => {
  const breadcrumbs: RouteConfig[] = []
  let currentRoute = getRouteByPath(currentPath)
  
  // Special case: root path '/' should show "Home > Choose your mode"
  if (currentPath === '/') {
    return [routes.home, routes.choosePlane]
  }
  
  // Handle knowledge plane sub-routes
  if (!currentRoute && currentPath.startsWith('/knowledge/')) {
    // Try to match knowledge sub-routes
    if (currentPath === '/knowledge/overview' || currentPath.startsWith('/knowledge/overview')) {
      currentRoute = routes.knowledgeOverview
    } else if (currentPath === '/knowledge/laws' || currentPath.startsWith('/knowledge/laws')) {
      currentRoute = routes.knowledgeLaws
    } else if (currentPath === '/knowledge/constraints' || currentPath.startsWith('/knowledge/constraints')) {
      currentRoute = routes.knowledgeConstraints
    } else if (currentPath === '/knowledge/meaning' || currentPath.startsWith('/knowledge/meaning')) {
      currentRoute = routes.knowledgeMeaning
    } else if (currentPath === '/knowledge/search' || currentPath.startsWith('/knowledge/search')) {
      currentRoute = routes.knowledgeSearch
    } else if (currentPath === '/knowledge' || currentPath === '/knowledge/') {
      currentRoute = routes.knowledge
    }
  }
  
  // Handle dynamic routes (e.g., /master/:domain)
  if (!currentRoute) {
    // Try to match master routes
    const masterMatch = currentPath.match(/^\/master\/([^/]+)(?:\/(.+))?$/)
    if (masterMatch) {
      const domain = masterMatch[1]
      const subPath = masterMatch[2]
      
      // Map domain to route key
      const domainMap: Record<string, string> = {
        [MasterDomain.FINANCE]: 'masterFinance',
        [MasterDomain.ENERGY]: 'masterEnergy',
        [MasterDomain.TRAVEL]: 'masterTravel',
        [MasterDomain.SOFTWARE]: 'masterSoftware',
        [MasterDomain.HEALTH]: 'masterHealth',
        [MasterDomain.MEANING]: 'masterMeaning',
      }
      
      const routeKey = domainMap[domain]
      if (routeKey) {
        currentRoute = routes[routeKey]
        
        // If there's a subpath (like products/:productId), add product route
        if (subPath && subPath.startsWith('products/')) {
          const productRoute = { ...routes.masterFinanceProduct }
          breadcrumbs.push(productRoute)
        }
      }
    }
  }
  
  // Handle systems plane sub-routes
  if (!currentRoute && currentPath.startsWith('/systems/')) {
    if (currentPath === '/systems/tiers' || currentPath.startsWith('/systems/tiers')) {
      currentRoute = routes.systemsTiers
    } else if (currentPath === '/systems/list' || currentPath.startsWith('/systems/list')) {
      currentRoute = routes.systemsList
    } else if (currentPath === '/systems/artifacts' || currentPath.startsWith('/systems/artifacts')) {
      currentRoute = routes.systemsArtifacts
    } else {
      currentRoute = routes.systems
    }
  }
  
  // Build breadcrumb trail by following parent chain
  while (currentRoute) {
    breadcrumbs.unshift(currentRoute)
    
    if (currentRoute.parent) {
      currentRoute = getRouteByPath(currentRoute.parent)
    } else {
      break
    }
  }
  
  // Always start with home as root if not already included
  if (breadcrumbs.length === 0) {
    breadcrumbs.push(routes.home)
  } else if (breadcrumbs[0].path !== '/' && currentPath !== '/') {
    // Add home as root unless we're already at home
    breadcrumbs.unshift(routes.home)
  }
  
  return breadcrumbs
}

