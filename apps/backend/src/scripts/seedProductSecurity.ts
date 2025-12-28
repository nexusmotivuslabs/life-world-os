/**
 * Seed Product Security Script
 * 
 * Creates security documentation and procedures for products.
 * This is managed by Security Specialist agents.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const NEXUS_MOTIVUS_ORG_ID = 'nexus-motivus-org-id'

/**
 * Security procedures template for financial products
 */
const defaultSecurityProcedures = [
  {
    title: 'Data Encryption',
    description: 'All financial data encrypted at rest (AES-256) and in transit (TLS 1.3)',
    implemented: true,
    lastReviewed: new Date().toISOString(),
  },
  {
    title: 'Access Control',
    description: 'Role-based access control (RBAC) with least privilege principle',
    implemented: true,
    lastReviewed: new Date().toISOString(),
  },
  {
    title: 'Authentication',
    description: 'Multi-factor authentication (MFA) required for all financial data access',
    implemented: true,
    lastReviewed: new Date().toISOString(),
  },
  {
    title: 'Audit Logging',
    description: 'Comprehensive audit logging of all data access and modifications',
    implemented: true,
    lastReviewed: new Date().toISOString(),
  },
  {
    title: 'Security Monitoring',
    description: 'Continuous security monitoring and alerting for suspicious activities',
    implemented: true,
    lastReviewed: new Date().toISOString(),
  },
  {
    title: 'Vulnerability Management',
    description: 'Regular vulnerability scanning and patch management',
    implemented: true,
    lastReviewed: new Date().toISOString(),
  },
  {
    title: 'Incident Response',
    description: 'Documented incident response plan with defined procedures',
    implemented: true,
    lastReviewed: new Date().toISOString(),
  },
]

/**
 * Default risk assessment template
 */
const defaultRiskAssessment = {
  overallRisk: 'MEDIUM',
  dataSensitivity: 'HIGH',
  accessComplexity: 'MEDIUM',
  threatLevel: 'MEDIUM',
  mitigations: [
    'Encryption at rest and in transit',
    'Strong authentication and authorization',
    'Regular security audits',
    'Comprehensive monitoring',
  ],
}

async function main() {
  console.log('🔒 Seeding product security documentation...')

  // Get Security Specialist agent
  const securitySpecialist = await prisma.agent.findUnique({
    where: { type: 'SECURITY_SPECIALIST' },
  })

  if (!securitySpecialist) {
    console.error('❌ Security Specialist agent not found. Please run seedAgents.ts first.')
    process.exit(1)
  }

  // Get all active products
  const products = await prisma.product.findMany({
    where: {
      organizationId: NEXUS_MOTIVUS_ORG_ID,
      isActive: true,
    },
  })

  console.log(`Found ${products.length} products to secure...`)

  for (const product of products) {
    // Determine security level based on product type
    let securityLevel = 'MEDIUM'
    let complianceStandards: string[] = ['SOC2', 'GDPR']
    
    if (product.type === 'CALCULATOR' || product.type === 'TRACKER') {
      securityLevel = 'HIGH' // Financial calculators and trackers handle sensitive data
      complianceStandards.push('PCI-DSS')
    }

    // Create or update product security
    await prisma.productSecurity.upsert({
      where: { productId: product.id },
      create: {
        productId: product.id,
        complianceStandards: complianceStandards as any,
        encryptionAtRest: true,
        encryptionInTransit: true,
        encryptionAlgorithm: 'AES-256 (at rest), TLS 1.3 (in transit)',
        authenticationMethod: 'OAuth2 with MFA',
        authorizationModel: 'RBAC',
        securityProcedures: defaultSecurityProcedures as any,
        incidentResponsePlan: `Incident response plan for ${product.name}. Contact Security Specialist immediately upon detection of security incident.`,
        auditLogging: true,
        lastSecurityReview: new Date(),
        nextSecurityReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
        securityReviewerId: securitySpecialist.id,
        riskAssessment: defaultRiskAssessment as any,
        vulnerabilities: [] as any,
      },
      update: {
        complianceStandards: complianceStandards as any,
        lastSecurityReview: new Date(),
        nextSecurityReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        securityReviewerId: securitySpecialist.id,
      },
    })

    // Update product with security level and ensure URLs are set if missing
    const productSlug = product.name.toLowerCase().replace(/\s+/g, '-')
    await prisma.product.update({
      where: { id: product.id },
      data: { 
        securityLevel,
        // Set default internal routes if not already set (products are part of the same app)
        url: product.url || `/products/${productSlug}`, // Internal route
        accessUrl: product.accessUrl || `/master-money/products/${productSlug}`, // User-facing route
      },
    })

    console.log(`  ✅ Secured product: ${product.name} (${securityLevel} security level)`)
  }

  console.log('✨ Product security seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

