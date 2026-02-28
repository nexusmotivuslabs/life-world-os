/**
 * Resolve a reality node for a given systemId by applying system lens overrides.
 * Used when GET /api/reality-nodes/:id?systemId= returns content specific to that system.
 */

import type { RealityNode } from '@prisma/client'
import { MONEY_PRINCIPLE_LEARNING } from '../scripts/principleLearningData.js'

type Metadata = Record<string, unknown> | null

function applyLawLens(meta: Metadata, lens: Record<string, unknown>): Metadata {
  if (!meta || !lens) return meta
  const out = { ...meta }
  const keys = ['statement', 'derivedFrom', 'recursiveBehavior', 'violationOutcome', 'whyThisLawPersists'] as const
  for (const k of keys) {
    if (lens[k] !== undefined) (out as Record<string, unknown>)[k] = lens[k]
  }
  return out
}

function applyPrincipleLens(meta: Metadata, lens: Record<string, unknown>): Metadata {
  if (!meta || !lens) return meta
  const out = { ...meta }
  const keys = ['principle', 'alignedWith', 'whyItWorks', 'violationPattern', 'predictableResult'] as const
  for (const k of keys) {
    if (lens[k] !== undefined) (out as Record<string, unknown>)[k] = lens[k]
  }
  return out
}

function applyFrameworkLens(meta: Metadata, lens: Record<string, unknown>): Metadata {
  if (!meta || !lens) return meta
  const out = { ...meta }
  const keys = ['purpose', 'basedOn', 'structure', 'whenToUse', 'whenNotToUse', 'descriptionStrong'] as const
  for (const k of keys) {
    if (lens[k] !== undefined) (out as Record<string, unknown>)[k] = lens[k]
  }
  return out
}

/**
 * Returns the node with system lens applied when the node (or its source) has systemLenses[systemId].
 * - If node is a reference (metadata.isReference, sourceRealityNodeId), pass the loaded source node as sourceNode;
 *   the lens is taken from sourceNode.metadata.systemLenses[systemId].
 * - Otherwise lens is taken from node.metadata.systemLenses[systemId].
 * Returns a plain object suitable for JSON response (id preserved from original node when it's a reference).
 */
export function resolveNodeForSystem(
  node: RealityNode & { metadata?: Metadata },
  systemId: string,
  sourceNode?: (RealityNode & { metadata?: Metadata }) | null
): Record<string, unknown> {
  const meta = (sourceNode ?? node).metadata as Record<string, unknown> | null | undefined
  const systemLenses = meta?.systemLenses as Record<string, Record<string, unknown>> | undefined
  const lens = systemId && systemLenses?.[systemId]
  if (!lens) {
    return {
      ...node,
      metadata: node.metadata,
    } as unknown as Record<string, unknown>
  }

  const base = (sourceNode ?? node) as RealityNode & { metadata?: Metadata }
  let title = (lens.title as string) ?? base.title
  let description = (lens.description as string) ?? base.description ?? null
  const baseMeta = base.metadata && typeof base.metadata === 'object' && !Array.isArray(base.metadata) ? base.metadata as Record<string, unknown> : {}
  let metadata: Metadata = { ...baseMeta }

  const templateType = (base.metadata as Record<string, unknown>)?._templateType as string
  if (templateType === 'law') {
    metadata = applyLawLens(metadata, lens)
  } else if (templateType === 'principle') {
    metadata = applyPrincipleLens(metadata, lens)
    // Attach "children for learning" when viewing a Money principle
    if (systemId === 'money' && base.title && MONEY_PRINCIPLE_LEARNING[base.title]) {
      ;(metadata as Record<string, unknown>).learningChildren = MONEY_PRINCIPLE_LEARNING[base.title]
    }
  } else if (templateType === 'framework') {
    metadata = applyFrameworkLens(metadata, lens)
  }

  return {
    id: node.id,
    title,
    description,
    nodeType: node.nodeType,
    category: node.category,
    parentId: node.parentId,
    orderIndex: node.orderIndex,
    immutable: node.immutable,
    metadata,
    createdAt: node.createdAt,
    updatedAt: node.updatedAt,
    ...('parent' in node && { parent: (node as any).parent }),
    ...('children' in node && { children: (node as any).children }),
  } as Record<string, unknown>
}
