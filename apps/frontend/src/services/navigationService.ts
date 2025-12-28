/**
 * Navigation Service
 * 
 * Manages hierarchical navigation ontology and current node tracking.
 * Implements the navigation framework: Home -> System Tiers -> [System] -> [Sub-System]
 */

import { SystemTier } from '../types'

export interface NavigationNode {
  id: string
  title: string
  path: string
  parentId: string | null
  nodeType: 'root' | 'tier' | 'system' | 'subsystem'
  tier?: SystemTier
  metadata?: {
    description?: string
    icon?: string
  }
}

/**
 * Navigation hierarchy structure
 */
const navigationHierarchy: NavigationNode[] = [
  // Root
  {
    id: 'home',
    title: 'Home',
    path: '/',
    parentId: null,
    nodeType: 'root',
  },
  // Choose Mode
  {
    id: 'choose-mode',
    title: 'Choose your mode',
    path: '/choose-plane',
    parentId: 'home',
    nodeType: 'root',
  },
  // System Tiers
  {
    id: 'system-tiers',
    title: 'System Tiers',
    path: '/tiers',
    parentId: 'home',
    nodeType: 'tier',
  },
  // Systems (inherent systems in Root 0)
  {
    id: 'money-system',
    title: 'Money',
    path: '/master/money',
    parentId: 'system-tiers',
    nodeType: 'system',
    tier: SystemTier.STABILITY,
  },
  {
    id: 'energy-system',
    title: 'Energy',
    path: '/master/energy',
    parentId: 'system-tiers',
    nodeType: 'system',
    tier: SystemTier.STABILITY,
  },
  {
    id: 'health-system',
    title: 'Health',
    path: '/master/health',
    parentId: 'system-tiers',
    nodeType: 'system',
    tier: SystemTier.SURVIVAL,
  },
  {
    id: 'travel-system',
    title: 'Travel',
    path: '/master/travel',
    parentId: 'system-tiers',
    nodeType: 'system',
    tier: SystemTier.EXPRESSION,
  },
  {
    id: 'meaning-system',
    title: 'Meaning',
    path: '/master/meaning',
    parentId: 'system-tiers',
    nodeType: 'system',
    tier: SystemTier.EXPRESSION,
  },
]

/**
 * Get current navigation node from path
 */
export function getCurrentNode(path: string): NavigationNode | null {
  return navigationHierarchy.find(node => {
    if (node.path === path) return true
    // Handle dynamic routes
    if (path.startsWith('/master/')) {
      const domain = path.split('/')[2]
      return node.path === `/master/${domain}`
    }
    return false
  }) || null
}

/**
 * Get navigation path (breadcrumb trail) for current node
 */
export function getNavigationPath(currentPath: string): NavigationNode[] {
  // Special case: root path '/' should show "Home > Choose your mode"
  if (currentPath === '/') {
    const homeNode = navigationHierarchy.find(n => n.id === 'home')
    const chooseModeNode = navigationHierarchy.find(n => n.id === 'choose-mode')
    if (homeNode && chooseModeNode) {
      return [homeNode, chooseModeNode]
    }
  }

  const currentNode = getCurrentNode(currentPath)
  if (!currentNode) return []

  const path: NavigationNode[] = []
  let node: NavigationNode | null = currentNode

  // Traverse up the hierarchy
  while (node) {
    path.unshift(node)
    if (node.parentId) {
      node = navigationHierarchy.find(n => n.id === node!.parentId) || null
    } else {
      node = null
    }
  }

  // Always include home as root
  if (path.length === 0 || path[0].id !== 'home') {
    const homeNode = navigationHierarchy.find(n => n.id === 'home')
    if (homeNode) {
      path.unshift(homeNode)
    }
  }

  return path
}

/**
 * Get children of a node
 */
export function getNodeChildren(nodeId: string): NavigationNode[] {
  return navigationHierarchy.filter(node => node.parentId === nodeId)
}

/**
 * Check if a path is a system node (inherent system in Root 0)
 */
export function isSystemNode(path: string): boolean {
  const node = getCurrentNode(path)
  return node?.nodeType === 'system' || false
}

