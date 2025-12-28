/**
 * PowerLawController
 * 
 * Presentation layer controller for 48 Laws of Power endpoints.
 */

import { Router, Request, Response } from 'express'
import { prisma } from '../../../../lib/prisma.js'
import { PowerLawDomain } from '@prisma/client'

const router = Router()

/**
 * GET /api/power-laws/domains
 * Get all available Power Law domains with counts
 */
router.get('/domains', async (req: Request, res: Response) => {
  try {
    const domains = Object.values(PowerLawDomain)
    
    const domainsWithCounts = await Promise.all(
      domains.map(async (domain) => {
        const count = await prisma.powerLaw.count({
          where: { domain },
        })
        return { domain, count }
      })
    )

    res.json({ domains: domainsWithCounts })
  } catch (error: any) {
    console.error('Error listing Power law domains:', error)
    res.status(500).json({ error: error.message || 'Failed to list domains' })
  }
})

/**
 * GET /api/power-laws
 * List all power laws for a domain, optionally filtered by category
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const domain = req.query.domain as PowerLawDomain | undefined
    const category = req.query.category as string | undefined
    
    const where: any = {}
    if (domain) {
      where.domain = domain
    }
    if (category) {
      where.category = category
    }
    
    const laws = await prisma.powerLaw.findMany({
      where,
      orderBy: { order: 'asc' },
    })

    res.json({
      laws,
      count: laws.length,
    })
  } catch (error: any) {
    console.error('Error listing power laws:', error)
    res.status(500).json({ error: error.message || 'Failed to list power laws' })
  }
})

/**
 * GET /api/power-laws/categories
 * Get all available categories with counts
 */
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.powerLaw.groupBy({
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
    console.error('Error listing Power law categories:', error)
    res.status(500).json({ error: error.message || 'Failed to list categories' })
  }
})

/**
 * GET /api/power-laws/:id
 * Get a specific power law by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const law = await prisma.powerLaw.findUnique({
      where: { id: req.params.id },
    })

    if (!law) {
      return res.status(404).json({ error: 'Power law not found' })
    }

    res.json(law)
  } catch (error: any) {
    console.error('Error getting power law:', error)
    res.status(500).json({ error: error.message || 'Failed to get power law' })
  }
})

/**
 * GET /api/power-laws/by-number/:lawNumber
 * Get a power law by number and domain
 */
router.get('/by-number/:lawNumber', async (req: Request, res: Response) => {
  try {
    const lawNumber = parseInt(req.params.lawNumber)
    const domain = (req.query.domain as PowerLawDomain) || PowerLawDomain.MONEY

    if (isNaN(lawNumber) || lawNumber < 1 || lawNumber > 48) {
      return res.status(400).json({ error: 'Law number must be between 1 and 48' })
    }

    const law = await prisma.powerLaw.findUnique({
      where: {
        domain_lawNumber: {
          domain,
          lawNumber,
        },
      },
    })

    if (!law) {
      return res.status(404).json({ error: 'Power law not found' })
    }

    res.json(law)
  } catch (error: any) {
    console.error('Error getting power law by number:', error)
    res.status(500).json({ error: error.message || 'Failed to get power law' })
  }
})

export default router

