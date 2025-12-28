/**
 * Example: Seeding Product Security
 * 
 * This example shows how to seed product security documentation
 * for products in the Master Money System.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Default security procedures for all products
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
 * Determine security level based on product type
 */
function determineSecurityLevel(productType: string): string {
  if (productType === 'CALCULATOR' || productType === 'TRACKER') {
    return 'HIGH' // Financial calculators and trackers handle sensitive data
  }
  return 'MEDIUM' // General financial tools
}

/**
 * Determine compliance standards based on security level
 */
function determineComplianceStandards(securityLevel: string): string[] {
  const standards: string[] = ['SOC2', 'GDPR']
  
  if (securityLevel === 'HIGH') {
    standards.push('PCI-DSS')
  }
  
  return standards
}

/**
 * Seed security for a product
 */
async function seedProductSecurity(productId: string) {
  // Get product
  const product = await prisma.product.findUnique({
    where: { id: productId },
  })

  if (!product) {
    throw new Error(`Product ${productId} not found`)
  }

  // Get Security Specialist agent
  const securitySpecialist = await prisma.agent.findUnique({
    where: { type: 'SECURITY_SPECIALIST' },
  })

  if (!securitySpecialist) {
    throw new Error('Security Specialist agent not found')
  }

  // Determine security configuration
  const securityLevel = determineSecurityLevel(product.type)
  const complianceStandards = determineComplianceStandards(securityLevel)
  const productSlug = product.name.toLowerCase().replace(/\s+/g, '-')

  // Create or update product security
  const security = await prisma.productSecurity.upsert({
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
      nextSecurityReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      securityReviewerId: securitySpecialist.id,
      riskAssessment: {
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
      } as any,
      vulnerabilities: [] as any,
    },
    update: {
      complianceStandards: complianceStandards as any,
      lastSecurityReview: new Date(),
      nextSecurityReview: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      securityReviewerId: securitySpecialist.id,
    },
  })

  // Update product with security level and URLs
  await prisma.product.update({
    where: { id: product.id },
    data: {
      securityLevel,
      url: product.url || `/products/${productSlug}`,
      accessUrl: product.accessUrl || `/master-money/products/${productSlug}`,
    },
  })

  console.log(`✅ Secured product: ${product.name} (${securityLevel} security level)`)
  
  return security
}

/**
 * Seed security for all products
 */
async function seedAllProductSecurity() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
  })

  for (const product of products) {
    await seedProductSecurity(product.id)
  }

  console.log(`✨ Product security seeding complete! ${products.length} products secured.`)
}

// Usage
// seedAllProductSecurity()

