/**
 * BibleLawController
 * 
 * Presentation layer controller for Bible Laws endpoints.
 */

import { Router, Request, Response } from 'express'
import { prisma } from '../../../../lib/prisma.js'
import { BibleLawDomain } from '@prisma/client'
import { logger } from '../lib/logger.js'

const router = Router()

/**
 * GET /api/bible-laws/domains
 * Get all available Bible Law domains with counts
 */
router.get('/domains', async (req: Request, res: Response) => {
  try {
    const domains = Object.values(BibleLawDomain)
    
    const domainsWithCounts = await Promise.all(
      domains.map(async (domain) => {
        const count = await prisma.bibleLaw.count({
          where: { domain },
        })
        return { domain, count }
      })
    )

    res.json({ domains: domainsWithCounts })
  } catch (error: any) {
    logger.error('Error listing Bible law domains:', error)
    res.status(500).json({ error: error.message || 'Failed to list domains' })
  }
})

/**
 * GET /api/bible-laws
 * List all Bible laws for a domain, optionally filtered by category
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const domain = req.query.domain as BibleLawDomain | undefined
    const category = req.query.category as string | undefined
    
    const where: any = {}
    if (domain) {
      where.domain = domain
    }
    if (category) {
      where.category = category
    }
    
    const laws = await prisma.bibleLaw.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    res.json({
      laws,
      count: laws.length,
    })
  } catch (error: any) {
    logger.error('Error listing Bible laws:', error)
    res.status(500).json({ error: error.message || 'Failed to list Bible laws' })
  }
})

/**
 * GET /api/bible-laws/categories
 * Get all available categories with counts
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.bibleLaw.groupBy({
      by: ['category'],
      _count: {
        category: true,
      },
      where: {
        category: { not: null },
      },
    })

    const categoriesWithCounts = categories.map((cat) => ({
      category: cat.category,
      count: cat._count.category,
    }))

    res.json({ categories: categoriesWithCounts })
  } catch (error: any) {
    logger.error('Error listing Bible law categories:', error)
    res.status(500).json({ error: error.message || 'Failed to list categories' })
  }
})

/**
 * GET /api/bible-laws/:id
 * Get a specific Bible law by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const law = await prisma.bibleLaw.findUnique({
      where: { id: req.params.id },
    })

    if (!law) {
      return res.status(404).json({ error: 'Bible law not found' })
    }

    res.json(law)
  } catch (error: any) {
    logger.error('Error getting Bible law:', error)
    res.status(500).json({ error: error.message || 'Failed to get Bible law' })
  }
})

/**
 * GET /api/bible-laws/by-number/:lawNumber
 * Get a Bible law by number and domain
 */
router.get('/by-number/:lawNumber', async (req: Request, res: Response) => {
  try {
    const lawNumber = parseInt(req.params.lawNumber)
    const domain = (req.query.domain as BibleLawDomain) || BibleLawDomain.MONEY

    if (isNaN(lawNumber) || lawNumber < 1) {
      return res.status(400).json({ error: 'Law number must be greater than 0' })
    }

    const law = await prisma.bibleLaw.findUnique({
      where: {
        domain_lawNumber: {
          domain,
          lawNumber,
        },
      },
    })

    if (!law) {
      return res.status(404).json({ error: 'Bible law not found' })
    }

    res.json(law)
  } catch (error: any) {
    logger.error('Error getting Bible law by number:', error)
    res.status(500).json({ error: error.message || 'Failed to get Bible law' })
  }
})

export default router

