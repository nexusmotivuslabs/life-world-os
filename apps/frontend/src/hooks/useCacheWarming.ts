/**
 * Cache Warming Hook
 * 
 * Preloads critical hierarchy tree data on app startup for instant access.
 * Uses stale-while-revalidate pattern to show cached data immediately.
 */

import { useEffect } from 'react'
import { hierarchyCache } from '../lib/hierarchyCache'
import { realityNodeApi } from '../services/financeApi'

interface TreeNode {
  id: string
  label: string
  type: string
  category?: string
  immutable?: boolean
  children?: TreeNode[]
  data?: any
}

/**
 * Recursively load a node and its children
 */
async function loadNodeWithChildren(nodeId: string): Promise<TreeNode> {
  const [nodeResponse, childrenResponse] = await Promise.all([
    realityNodeApi.getNode(nodeId),
    realityNodeApi.getChildren(nodeId),
  ])

  const node: TreeNode = {
    id: nodeResponse.node.id,
    label: nodeResponse.node.title,
    type: nodeResponse.node.nodeType.toLowerCase(),
    category: nodeResponse.node.category || undefined,
    immutable: nodeResponse.node.immutable || false,
    data: nodeResponse.node.metadata || {},
    children: [],
  }

  if (childrenResponse.children && childrenResponse.children.length > 0) {
    node.children = await Promise.all(
      childrenResponse.children.map(child => loadNodeWithChildren(child.id))
    )
  }

  return node
}

/**
 * Warm cache for common hierarchy trees
 */
export function useCacheWarming() {
  useEffect(() => {
    const warmCache = async () => {
      try {
        // Common root nodes to preload
        const rootNodes = [
          'reality-root',
          'constraints-of-reality',
        ]

        // Warm cache for each root node
        for (const rootId of rootNodes) {
          try {
            // Check if cache is stale or missing
            const cached = await hierarchyCache.get(rootId)
            const isStale = !cached || hierarchyCache.isStale(rootId, 60 * 60 * 1000) // 1 hour

            if (isStale) {
              // Preload in background (don't block app startup)
              loadNodeWithChildren(rootId)
                .then(tree => hierarchyCache.set(rootId, tree))
                .catch(error => {
                  console.warn(`Failed to warm cache for ${rootId}:`, error)
                })
            }
          } catch (error) {
            console.warn(`Error warming cache for ${rootId}:`, error)
          }
        }
      } catch (error) {
        console.warn('Cache warming failed:', error)
      }
    }

    // Warm cache after a short delay to not block initial render
    const timeout = setTimeout(warmCache, 1000)
    return () => clearTimeout(timeout)
  }, [])
}

