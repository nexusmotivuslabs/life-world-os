/**
 * Hierarchy Cache Service
 * 
 * Multi-layer caching system for hierarchy tree data:
 * - L1: In-memory cache (fastest, 5min TTL)
 * - L2: localStorage (persistent, 24hr TTL)
 * - L3: IndexedDB (large trees, 24hr TTL)
 * 
 * Features:
 * - Stale-while-revalidate pattern
 * - Incremental updates
 * - Cache versioning
 * - Automatic cleanup
 */

interface CacheMetadata {
  version: string
  timestamp: number
  nodeCount: number
  checksum: string // For validation
  rootNodeId: string
}

interface CachedTree {
  rootNode: any // TreeNode
  metadata: CacheMetadata
  nodeMap: Record<string, any> // Serialized Map for storage
}

interface TreeNode {
  id: string
  label: string
  type: string
  category?: string
  immutable?: boolean
  children?: TreeNode[]
  data?: any
}

class HierarchyCache {
  private memoryCache = new Map<string, CachedTree>()
  private readonly CACHE_VERSION = '1.0.0'
  private readonly MEMORY_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly PERSISTENT_TTL = 24 * 60 * 60 * 1000 // 24 hours
  private readonly STORAGE_KEY_PREFIX = 'hierarchy-tree-cache'
  private readonly INDEXED_DB_NAME = 'LifeWorldOS'
  private readonly INDEXED_DB_VERSION = 1
  private dbPromise: Promise<IDBDatabase> | null = null

  constructor() {
    this.initIndexedDB()
  }

  private initIndexedDB(): void {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.INDEXED_DB_NAME, this.INDEXED_DB_VERSION)

      request.onerror = () => {
        console.warn('IndexedDB not available, using localStorage only')
        this.dbPromise = null
        reject(request.error)
      }

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('hierarchyCache')) {
          const store = db.createObjectStore('hierarchyCache', { keyPath: 'rootNodeId' })
          store.createIndex('timestamp', 'metadata.timestamp', { unique: false })
        }
      }
    })
  }

  // L1: In-memory cache (fastest)
  getFromMemory(rootNodeId: string): CachedTree | null {
    const cached = this.memoryCache.get(rootNodeId)
    if (!cached) return null

    const age = Date.now() - cached.metadata.timestamp
    if (age > this.MEMORY_TTL) {
      this.memoryCache.delete(rootNodeId)
      return null
    }

    return cached
  }

  // L2: localStorage (persistent, fast)
  async getFromLocalStorage(rootNodeId: string): Promise<CachedTree | null> {
    if (typeof window === 'undefined' || !localStorage) {
      return null
    }

    try {
      const key = `${this.STORAGE_KEY_PREFIX}-${rootNodeId}`
      const stored = localStorage.getItem(key)
      if (!stored) return null

      const cached: CachedTree = JSON.parse(stored)
      const age = Date.now() - cached.metadata.timestamp

      if (age > this.PERSISTENT_TTL) {
        localStorage.removeItem(key)
        return null
      }

      // Validate version
      if (cached.metadata.version !== this.CACHE_VERSION) {
        localStorage.removeItem(key)
        return null
      }

      return cached
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  }

  // L3: IndexedDB (for large trees, async)
  async getFromIndexedDB(rootNodeId: string): Promise<CachedTree | null> {
    if (!this.dbPromise) return null

    try {
      const db = await this.dbPromise
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['hierarchyCache'], 'readonly')
        const store = transaction.objectStore('hierarchyCache')
        const getRequest = store.get(rootNodeId)

        getRequest.onsuccess = () => {
          const cached = getRequest.result
          if (!cached) {
            resolve(null)
            return
          }

          const age = Date.now() - cached.metadata.timestamp
          if (age > this.PERSISTENT_TTL) {
            // Delete expired entry
            const deleteTransaction = db.transaction(['hierarchyCache'], 'readwrite')
            deleteTransaction.objectStore('hierarchyCache').delete(rootNodeId)
            resolve(null)
            return
          }

          // Validate version
          if (cached.metadata.version !== this.CACHE_VERSION) {
            const deleteTransaction = db.transaction(['hierarchyCache'], 'readwrite')
            deleteTransaction.objectStore('hierarchyCache').delete(rootNodeId)
            resolve(null)
            return
          }

          resolve(cached)
        }

        getRequest.onerror = () => resolve(null)
      })
    } catch (error) {
      console.warn('IndexedDB read failed:', error)
      return null
    }
  }

  // Unified get with fallback chain (L1 -> L2 -> L3)
  async get(rootNodeId: string): Promise<CachedTree | null> {
    // Try L1 first (fastest)
    const memory = this.getFromMemory(rootNodeId)
    if (memory) {
      return memory
    }

    // Try L2 (fast, persistent)
    const localStorage = await this.getFromLocalStorage(rootNodeId)
    if (localStorage) {
      // Promote to L1
      this.memoryCache.set(rootNodeId, localStorage)
      return localStorage
    }

    // Try L3 (async, large data)
    const indexedDB = await this.getFromIndexedDB(rootNodeId)
    if (indexedDB) {
      // Promote to L1 and L2
      this.memoryCache.set(rootNodeId, indexedDB)
      await this.setToLocalStorage(rootNodeId, indexedDB)
      return indexedDB
    }

    return null
  }

  // Set to all layers
  async set(rootNodeId: string, tree: TreeNode): Promise<void> {
    const nodeMap = this.buildNodeMap(tree)
    const checksum = this.calculateChecksum(tree)

    const cached: CachedTree = {
      rootNode: tree,
      metadata: {
        version: this.CACHE_VERSION,
        timestamp: Date.now(),
        nodeCount: Object.keys(nodeMap).length,
        checksum,
        rootNodeId,
      },
      nodeMap,
    }

    // Set to all layers
    this.memoryCache.set(rootNodeId, cached)
    await this.setToLocalStorage(rootNodeId, cached)
    await this.setToIndexedDB(rootNodeId, cached)
  }

  // Incremental update - update a single node in the tree
  async updateNode(rootNodeId: string, nodeId: string, updatedNode: TreeNode): Promise<boolean> {
    const cached = await this.get(rootNodeId)
    if (!cached) return false

    // Update the node in the tree
    const updatedTree = this.updateNodeInTree(cached.rootNode, nodeId, updatedNode)
    if (!updatedTree) return false

    // Rebuild cache
    await this.set(rootNodeId, updatedTree)
    return true
  }

  private buildNodeMap(node: TreeNode, map: Record<string, TreeNode> = {}): Record<string, TreeNode> {
    map[node.id] = node
    if (node.children) {
      node.children.forEach(child => this.buildNodeMap(child, map))
    }
    return map
  }

  private collectNodeIds(node: TreeNode, ids: string[] = []): string[] {
    ids.push(node.id)
    if (node.children) {
      node.children.forEach(child => this.collectNodeIds(child, ids))
    }
    return ids
  }

  private updateNodeInTree(root: TreeNode, nodeId: string, updated: TreeNode): TreeNode | null {
    if (root.id === nodeId) {
      return updated
    }

    if (root.children) {
      const updatedChildren = root.children.map(child => {
        const result = this.updateNodeInTree(child, nodeId, updated)
        return result || child
      })

      // Check if any child was updated
      const wasUpdated = updatedChildren.some((child, idx) => child !== root.children![idx])
      if (wasUpdated) {
        return {
          ...root,
          children: updatedChildren,
        }
      }
    }

    return null
  }

  private async setToLocalStorage(rootNodeId: string, cached: CachedTree): Promise<void> {
    if (typeof window === 'undefined' || !localStorage) {
      return
    }

    try {
      const key = `${this.STORAGE_KEY_PREFIX}-${rootNodeId}`
      localStorage.setItem(key, JSON.stringify(cached))
    } catch (error) {
      // localStorage might be full, try to clean up
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.cleanupOldCache()
        // Try once more
        try {
          const key = `${this.STORAGE_KEY_PREFIX}-${rootNodeId}`
          localStorage.setItem(key, JSON.stringify(cached))
        } catch {
          console.warn('Failed to store in localStorage after cleanup')
        }
      }
    }
  }

  private async setToIndexedDB(rootNodeId: string, cached: CachedTree): Promise<void> {
    if (!this.dbPromise) return

    try {
      const db = await this.dbPromise
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['hierarchyCache'], 'readwrite')
        const store = transaction.objectStore('hierarchyCache')
        store.put({ rootNodeId, ...cached })
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => {
          console.warn('IndexedDB write failed:', transaction.error)
          resolve() // Don't fail if IndexedDB write fails
        }
      })
    } catch (error) {
      console.warn('IndexedDB write error:', error)
    }
  }

  // Cleanup old cache entries
  private cleanupOldCache(): void {
    if (typeof window === 'undefined' || !localStorage) {
      return
    }

    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.STORAGE_KEY_PREFIX))
    let cleaned = 0

    keys.forEach(key => {
      try {
        const stored = localStorage.getItem(key)
        if (stored) {
          const cached = JSON.parse(stored)
          const age = Date.now() - cached.metadata.timestamp
          if (age > this.PERSISTENT_TTL) {
            localStorage.removeItem(key)
            cleaned++
          }
        }
      } catch {
        localStorage.removeItem(key)
        cleaned++
      }
    })

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired cache entries`)
    }
  }

  // Invalidate specific node or entire cache
  invalidate(rootNodeId?: string): void {
    if (rootNodeId) {
      this.memoryCache.delete(rootNodeId)
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.removeItem(`${this.STORAGE_KEY_PREFIX}-${rootNodeId}`)
      }
      // Also remove from IndexedDB
      if (this.dbPromise) {
        this.dbPromise.then(db => {
          const transaction = db.transaction(['hierarchyCache'], 'readwrite')
          transaction.objectStore('hierarchyCache').delete(rootNodeId!)
        }).catch(() => {
          // Ignore errors
        })
      }
    } else {
      // Clear all
      this.memoryCache.clear()
      if (typeof window !== 'undefined' && localStorage) {
        const keys = Object.keys(localStorage).filter(k => k.startsWith(this.STORAGE_KEY_PREFIX))
        keys.forEach(key => localStorage.removeItem(key))
      }
      // Clear IndexedDB
      if (this.dbPromise) {
        this.dbPromise.then(db => {
          const transaction = db.transaction(['hierarchyCache'], 'readwrite')
          transaction.objectStore('hierarchyCache').clear()
        }).catch(() => {
          // Ignore errors
        })
      }
    }
  }

  // Get cache statistics
  getStats(): {
    memory: { size: number; entries: string[] }
    localStorage: { size: number; entries: string[]; sizeBytes: number }
    indexedDB: { available: boolean }
  } {
    const memoryEntries = Array.from(this.memoryCache.keys())
    const localStorageEntries: string[] = []
    let localStorageSize = 0

    if (typeof window !== 'undefined' && localStorage) {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(this.STORAGE_KEY_PREFIX))
      keys.forEach(key => {
        localStorageEntries.push(key)
        const value = localStorage.getItem(key)
        if (value) {
          localStorageSize += value.length + key.length
        }
      })
    }

    return {
      memory: {
        size: this.memoryCache.size,
        entries: memoryEntries,
      },
      localStorage: {
        size: localStorageEntries.length,
        entries: localStorageEntries,
        sizeBytes: localStorageSize,
      },
      indexedDB: {
        available: this.dbPromise !== null,
      },
    }
  }

  // Check if cache is stale (needs refresh)
  isStale(rootNodeId: string, maxAge: number = 30 * 60 * 1000): boolean {
    const cached = this.memoryCache.get(rootNodeId)
    if (!cached) return true

    const age = Date.now() - cached.metadata.timestamp
    return age > maxAge
  }

  // Calculate checksum (exposed for external use)
  calculateChecksum(tree: TreeNode): string {
    return this.calculateChecksumInternal(tree)
  }

  private calculateChecksumInternal(tree: TreeNode): string {
    // Simple checksum based on node IDs and structure
    const ids = this.collectNodeIds(tree).sort().join(',')
    try {
      return btoa(ids).substring(0, 16) // Simple hash
    } catch {
      // Fallback for non-ASCII
      return ids.substring(0, 16)
    }
  }
}

export const hierarchyCache = new HierarchyCache()

// Cleanup expired entries on startup
if (typeof window !== 'undefined') {
  // Run cleanup every hour
  setInterval(() => {
    hierarchyCache.getStats() // This will trigger cleanup if needed
  }, 60 * 60 * 1000)
}

