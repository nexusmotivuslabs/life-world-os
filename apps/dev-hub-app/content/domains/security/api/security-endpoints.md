# Security API Endpoints

## Overview

Security-related API endpoints for managing product security and conducting security reviews.

## Endpoints

### GET /api/products/:productId
Get product details including security information.

**Response:**
```json
{
  "id": "product-id",
  "name": "Portfolio Tracker & Analyzer",
  "securityLevel": "HIGH",
  "requiresAuth": true,
  "accessUrl": "/master-money/products/portfolio-tracker",
  "security": {
    "complianceStandards": ["SOC2", "GDPR", "PCI-DSS"],
    "encryptionAtRest": true,
    "encryptionInTransit": true,
    "authenticationMethod": "OAuth2 with MFA",
    "lastSecurityReview": "2024-01-15T00:00:00Z",
    "nextSecurityReview": "2024-04-15T00:00:00Z"
  }
}
```

### GET /api/products
List all products with security information.

**Query Parameters:**
- `teamId` (optional): Filter by team

**Response:**
```json
{
  "products": [
    {
      "id": "product-id",
      "name": "Portfolio Tracker",
      "securityLevel": "HIGH",
      "security": { ... }
    }
  ]
}
```

## Implementation

### ProductController

```typescript
// GET /api/products/:productId
router.get('/:productId', async (req: Request, res: Response) => {
  try {
    const product = await productRepository.findById(req.params.productId)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    // Get security information
    const security = await prisma.productSecurity.findUnique({
      where: { productId: product.id },
    })

    res.json({
      id: product.id,
      name: product.name,
      description: product.description,
      securityLevel: product.securityLevel,
      requiresAuth: product.requiresAuth,
      accessUrl: product.accessUrl,
      security: security ? {
        complianceStandards: security.complianceStandards,
        encryptionAtRest: security.encryptionAtRest,
        encryptionInTransit: security.encryptionInTransit,
        authenticationMethod: security.authenticationMethod,
        lastSecurityReview: security.lastSecurityReview,
        nextSecurityReview: security.nextSecurityReview,
      } : undefined,
    })
  } catch (error: any) {
    console.error('Error getting product:', error)
    res.status(500).json({ error: error.message || 'Failed to get product' })
  }
})
```

## Security Information in Frontend

### Displaying Security Info

```typescript
// In TeamDetailView.tsx
{product.security && (
  <div className="mb-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
    <div className="flex items-center gap-2 mb-2">
      <Shield className="w-4 h-4 text-blue-400" />
      <span className="text-sm font-semibold text-gray-300">Security & Compliance</span>
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

## Future Endpoints

### POST /api/security/reviews
Conduct security review for a product.

### GET /api/security/reviews/pending
Get products needing security review.

### PUT /api/security/:productId
Update security configuration for a product.

