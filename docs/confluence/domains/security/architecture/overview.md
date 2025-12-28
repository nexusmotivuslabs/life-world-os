# Security Architecture Overview

## Architecture Pattern

The Security domain follows **Hexagonal Architecture** (Ports and Adapters), ensuring:
- Business logic is independent of infrastructure
- Easy to test and maintain
- Flexible and adaptable

## Domain Structure

```
security/
├── domain/                    # Business logic (core)
│   ├── entities/
│   │   └── ProductSecurity.ts
│   └── services/
│       └── SecurityReviewService.ts
├── application/              # Use cases (application layer)
│   └── useCases/
│       ├── CreateProductSecurityUseCase.ts
│       ├── ConductSecurityReviewUseCase.ts
│       └── UpdateSecurityProceduresUseCase.ts
├── infrastructure/           # External adapters
│   └── adapters/
│       └── database/
│           └── PrismaProductSecurityAdapter.ts
└── presentation/            # API layer
    └── controllers/
        └── ProductSecurityController.ts
```

## Core Entities

### ProductSecurity Entity

```typescript
export class ProductSecurity {
  private constructor(
    public readonly id: string,
    public readonly productId: string,
    public readonly complianceStandards: string[],
    public readonly encryptionAtRest: boolean,
    public readonly encryptionInTransit: boolean,
    public readonly encryptionAlgorithm: string,
    public readonly authenticationMethod: string,
    public readonly authorizationModel: string,
    public readonly securityProcedures: SecurityProcedure[],
    public readonly incidentResponsePlan: string,
    public readonly auditLogging: boolean,
    public readonly lastSecurityReview: Date | null,
    public readonly nextSecurityReview: Date | null,
    public readonly securityReviewerId: string | null,
    public readonly riskAssessment: RiskAssessment,
    public readonly vulnerabilities: Vulnerability[]
  ) {}

  static create(data: CreateProductSecurityData): ProductSecurity {
    // Validation and creation logic
  }

  static fromPersistence(data: PersistenceData): ProductSecurity {
    // Map from database to entity
  }

  needsSecurityReview(): boolean {
    if (!this.nextSecurityReview) return true
    return new Date() >= this.nextSecurityReview
  }

  updateSecurityReview(reviewerId: string): ProductSecurity {
    return new ProductSecurity(
      this.id,
      this.productId,
      // ... update review dates
      new Date(), // lastSecurityReview
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // nextSecurityReview
      reviewerId
    )
  }
}
```

## Use Cases

### CreateProductSecurityUseCase

```typescript
export class CreateProductSecurityUseCase {
  constructor(
    private productSecurityRepository: ProductSecurityRepositoryPort
  ) {}

  async execute(productId: string, securityData: SecurityData): Promise<ProductSecurity> {
    // 1. Validate product exists
    // 2. Determine security level
    // 3. Create ProductSecurity entity
    // 4. Save to repository
    // 5. Return created entity
  }
}
```

### ConductSecurityReviewUseCase

```typescript
export class ConductSecurityReviewUseCase {
  constructor(
    private productSecurityRepository: ProductSecurityRepositoryPort,
    private securityReviewService: SecurityReviewService
  ) {}

  async execute(productId: string, reviewerId: string): Promise<SecurityReviewResult> {
    // 1. Get ProductSecurity
    // 2. Conduct review (check procedures, compliance, vulnerabilities)
    // 3. Update review dates
    // 4. Document findings
    // 5. Save updated security
  }
}
```

## Ports (Interfaces)

### ProductSecurityRepositoryPort

```typescript
export interface ProductSecurityRepositoryPort {
  findById(id: string): Promise<ProductSecurity | null>
  findByProductId(productId: string): Promise<ProductSecurity | null>
  save(security: ProductSecurity): Promise<ProductSecurity>
  findProductsNeedingReview(): Promise<ProductSecurity[]>
}
```

## Adapters

### PrismaProductSecurityAdapter

```typescript
export class PrismaProductSecurityAdapter implements ProductSecurityRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findByProductId(productId: string): Promise<ProductSecurity | null> {
    const data = await this.prisma.productSecurity.findUnique({
      where: { productId },
    })

    if (!data) return null

    return ProductSecurity.fromPersistence(data)
  }

  async save(security: ProductSecurity): Promise<ProductSecurity> {
    const data = await this.prisma.productSecurity.upsert({
      where: { productId: security.productId },
      create: {
        // Map entity to database
      },
      update: {
        // Map entity to database
      },
    })

    return ProductSecurity.fromPersistence(data)
  }
}
```

## Database Schema

### ProductSecurity Model

```prisma
model ProductSecurity {
  id                    String      @id @default(uuid())
  productId             String      @unique
  complianceStandards   Json?
  encryptionAtRest      Boolean     @default(true)
  encryptionInTransit   Boolean     @default(true)
  encryptionAlgorithm   String?
  authenticationMethod  String?
  authorizationModel    String?
  securityProcedures    Json?
  incidentResponsePlan   String?     @db.Text
  auditLogging          Boolean     @default(true)
  lastSecurityReview    DateTime?
  nextSecurityReview    DateTime?
  securityReviewerId    String?
  riskAssessment        Json?
  vulnerabilities       Json?
  
  product               Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
}
```

## Security Flow

### Product Creation with Security

```
1. Create Product
   └─> Set securityLevel, requiresAuth, url, accessUrl

2. Create ProductSecurity
   └─> Determine compliance standards
   └─> Set encryption configuration
   └─> Document security procedures
   └─> Schedule security review

3. Display Security Info
   └─> Show security level badge
   └─> Display compliance standards
   └─> Show encryption status
```

### Security Review Flow

```
1. Check Review Schedule
   └─> Find products needing review (nextSecurityReview <= today)

2. Conduct Review
   └─> Review security procedures
   └─> Check compliance status
   └─> Scan for vulnerabilities
   └─> Update risk assessment

3. Update Security
   └─> Update lastSecurityReview
   └─> Set nextSecurityReview (90 days)
   └─> Document findings
```

## Integration Points

### With Product Domain
- Products reference ProductSecurity
- Security level affects product access
- Security information displayed with products

### With Platform Engineering
- Security monitoring integration
- CI/CD security scanning
- Deployment security checks

## Security Principles

1. **Defense in Depth**: Multiple layers of security
2. **Least Privilege**: Users only have necessary access
3. **Security by Design**: Security built in from the start
4. **Continuous Monitoring**: Always watching for threats
5. **Regular Reviews**: Security reviewed every 90 days

## Related Documentation

- [Security Procedures](../implementation/security-procedures.md)
- [Product Security Guide](../implementation/product-security.md)
- [Compliance Guide](../implementation/compliance.md)

