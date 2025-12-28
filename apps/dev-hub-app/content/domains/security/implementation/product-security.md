# Product Security Implementation Guide

This guide shows how to implement security for products in the Master Money System.

## Overview

Every product must have security documentation managed by Security Specialist agents. This includes:
- Security level classification
- Compliance standards
- Encryption configuration
- Authentication requirements
- Security procedures
- Regular security reviews

## Step 1: Determine Security Level

Based on product type and data sensitivity:

```typescript
function determineSecurityLevel(productType: TeamProductType): string {
  // HIGH: Calculators and Trackers (handle sensitive financial data)
  if (productType === 'CALCULATOR' || productType === 'TRACKER') {
    return 'HIGH'
  }
  
  // MEDIUM: General financial tools
  if (productType === 'ANALYZER' || productType === 'DASHBOARD') {
    return 'MEDIUM'
  }
  
  // LOW: Public information tools
  return 'LOW'
}
```

## Step 2: Create Product with Security Fields

When creating a product, include security fields:

```typescript
// In seedTeams.ts or product creation
const product = await prisma.product.create({
  data: {
    name: 'Portfolio Tracker & Analyzer',
    description: 'Track investment performance',
    type: TeamProductType.ANALYZER,
    url: '/products/portfolio-tracker', // Internal route
    accessUrl: '/master-money/products/portfolio-tracker', // User-facing route
    securityLevel: 'HIGH',
    requiresAuth: true,
    // ... other fields
  }
})
```

## Step 3: Create ProductSecurity Record

After creating the product, create security documentation:

```typescript
// In seedProductSecurity.ts
const security = await prisma.productSecurity.create({
  data: {
    productId: product.id,
    complianceStandards: ['SOC2', 'GDPR', 'PCI-DSS'], // Based on security level
    encryptionAtRest: true,
    encryptionInTransit: true,
    encryptionAlgorithm: 'AES-256 (at rest), TLS 1.3 (in transit)',
    authenticationMethod: 'OAuth2 with MFA',
    authorizationModel: 'RBAC',
    securityProcedures: [
      {
        title: 'Data Encryption',
        description: 'All financial data encrypted at rest (AES-256) and in transit (TLS 1.3)',
        implemented: true,
        lastReviewed: new Date().toISOString(),
      },
      // ... other procedures
    ],
    incidentResponsePlan: 'Incident response plan for Portfolio Tracker...',
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
    },
    vulnerabilities: [],
  }
})
```

## Step 4: Update Product API to Include Security

In ProductController, include security information:

```typescript
// GET /api/products/:productId
router.get('/:productId', async (req: Request, res: Response) => {
  const product = await productRepository.findById(req.params.productId)
  const security = await prisma.productSecurity.findUnique({
    where: { productId: product.id },
  })

  res.json({
    ...product,
    security: security ? {
      complianceStandards: security.complianceStandards,
      encryptionAtRest: security.encryptionAtRest,
      encryptionInTransit: security.encryptionInTransit,
      authenticationMethod: security.authenticationMethod,
      lastSecurityReview: security.lastSecurityReview,
      nextSecurityReview: security.nextSecurityReview,
    } : undefined,
  })
})
```

## Step 5: Display Security in Frontend

Show security information to users:

```typescript
// In TeamDetailView.tsx
{product.security && (
  <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <Shield className="w-4 h-4 text-blue-400" />
      <span className="text-sm font-semibold">Security & Compliance</span>
    </div>
    <div className="space-y-1 text-xs text-gray-400">
      {product.security.complianceStandards && (
        <div>
          <span className="text-gray-500">Compliance: </span>
          {product.security.complianceStandards.join(', ')}
        </div>
      )}
      {product.security.encryptionAtRest && product.security.encryptionInTransit && (
        <div className="flex items-center gap-1">
          <Lock className="w-3 h-3 text-green-400" />
          <span>Encrypted at rest & in transit</span>
        </div>
      )}
    </div>
  </div>
)}
```

## Security Level Configuration

### HIGH Security Products
```typescript
{
  securityLevel: 'HIGH',
  complianceStandards: ['SOC2', 'GDPR', 'PCI-DSS'],
  encryptionAtRest: true,
  encryptionInTransit: true,
  authenticationMethod: 'OAuth2 with MFA',
  requiresAuth: true,
}
```

### MEDIUM Security Products
```typescript
{
  securityLevel: 'MEDIUM',
  complianceStandards: ['SOC2', 'GDPR'],
  encryptionAtRest: true,
  encryptionInTransit: true,
  authenticationMethod: 'OAuth2 with MFA',
  requiresAuth: true,
}
```

### LOW Security Products
```typescript
{
  securityLevel: 'LOW',
  complianceStandards: ['SOC2'],
  encryptionAtRest: false,
  encryptionInTransit: true,
  authenticationMethod: 'OAuth2',
  requiresAuth: false,
}
```

## Security Review Process

### Schedule Reviews
```typescript
// Set next review date (90 days from now)
const nextReview = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

await prisma.productSecurity.update({
  where: { productId },
  data: {
    lastSecurityReview: new Date(),
    nextSecurityReview: nextReview,
    securityReviewerId: securitySpecialist.id,
  }
})
```

### Conduct Review
1. Review security procedures
2. Check compliance status
3. Scan for vulnerabilities
4. Update risk assessment
5. Document findings

## Default Security Procedures

All products include these default procedures:

```typescript
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
```

## Implementation Checklist

- [ ] Determine security level based on product type
- [ ] Create product with security fields (url, accessUrl, securityLevel, requiresAuth)
- [ ] Create ProductSecurity record with compliance standards
- [ ] Configure encryption (at rest and in transit)
- [ ] Set authentication method
- [ ] Document security procedures
- [ ] Create incident response plan
- [ ] Schedule security review (90 days)
- [ ] Update API to include security information
- [ ] Display security information in frontend
- [ ] Test security measures

## Related Documentation

- [Security Procedures](./security-procedures.md)
- [Compliance Guide](./compliance.md)
- [Security Architecture](../architecture/overview.md)

