# Security Domain

**Lead**: Security Specialist Agent  
**Focus**: Product security, data protection, compliance, secure development lifecycle

## Overview

The Security domain ensures all products and features in the Master Money System meet bank-level security standards. Security Specialist agents lead security implementation, documentation, and reviews for all products.

## Quick Links

- [Architecture](./architecture/overview.md) - Security architecture and design
- [Security Procedures](./implementation/security-procedures.md) - Step-by-step security implementation
- [Product Security](./implementation/product-security.md) - How to secure products
- [Compliance](./implementation/compliance.md) - Compliance standards and requirements
- [API Security](./api/security-endpoints.md) - Security-related API endpoints
- [Examples](./examples/) - Code examples and templates

## Key Features

### 🔒 Product Security Model
- Comprehensive security documentation for all products
- Security level classification (HIGH, MEDIUM, LOW)
- Compliance standards tracking (SOC2, GDPR, PCI-DSS)
- Encryption at rest and in transit
- Authentication and authorization models

### 🛡️ Security Procedures
1. Data Encryption (AES-256 at rest, TLS 1.3 in transit)
2. Access Control (RBAC with least privilege)
3. Authentication (OAuth2 with MFA)
4. Audit Logging
5. Security Monitoring
6. Vulnerability Management
7. Incident Response

### 📋 Security Reviews
- Conducted every 90 days
- Documented in ProductSecurity model
- Tracked by Security Specialist agents

## Architecture

The Security domain follows Hexagonal Architecture:

```
security/
├── domain/
│   ├── entities/
│   │   └── ProductSecurity.ts      # Security entity
│   └── services/
│       └── SecurityReviewService.ts
├── application/
│   └── useCases/
│       ├── CreateProductSecurityUseCase.ts
│       └── ConductSecurityReviewUseCase.ts
├── infrastructure/
│   └── adapters/
│       └── database/
│           └── PrismaProductSecurityAdapter.ts
└── presentation/
    └── controllers/
        └── ProductSecurityController.ts
```

## Database Schema

### ProductSecurity Model
```prisma
model ProductSecurity {
  id                    String      @id @default(uuid())
  productId             String      @unique
  complianceStandards   Json?       // ["SOC2", "GDPR", "PCI-DSS"]
  encryptionAtRest      Boolean     @default(true)
  encryptionInTransit   Boolean     @default(true)
  encryptionAlgorithm   String?     // "AES-256", "TLS 1.3"
  authenticationMethod  String?     // "OAuth2", "SAML", "MFA"
  authorizationModel   String?     // "RBAC", "ABAC"
  securityProcedures    Json?       // Array of procedures
  incidentResponsePlan   String?     @db.Text
  auditLogging          Boolean     @default(true)
  lastSecurityReview    DateTime?
  nextSecurityReview    DateTime?
  securityReviewerId    String?     // Security Specialist agent ID
  riskAssessment        Json?
  vulnerabilities       Json?
}
```

### Product Model (Security Fields)
```prisma
model Product {
  url               String?         // Internal route
  accessUrl         String?         // User-facing route
  securityLevel     String?         // "HIGH", "MEDIUM", "LOW"
  requiresAuth      Boolean         @default(true)
  security         ProductSecurity?
}
```

## Security Levels

### HIGH Security
- Financial calculators and trackers
- Products handling sensitive financial data
- Compliance: SOC2, GDPR, PCI-DSS
- Encryption: AES-256 (at rest), TLS 1.3 (in transit)
- Authentication: OAuth2 with MFA required

### MEDIUM Security
- General financial tools
- Products with moderate data sensitivity
- Compliance: SOC2, GDPR
- Encryption: AES-256 (at rest), TLS 1.3 (in transit)
- Authentication: OAuth2 with MFA

### LOW Security
- Public information tools
- Products with minimal data sensitivity
- Compliance: SOC2
- Encryption: TLS 1.3 (in transit)
- Authentication: OAuth2

## Getting Started

1. **Review Security Procedures** - [Security Procedures Guide](./implementation/security-procedures.md)
2. **Understand Product Security** - [Product Security Guide](./implementation/product-security.md)
3. **Check Compliance Requirements** - [Compliance Guide](./implementation/compliance.md)
4. **See Examples** - [Code Examples](./examples/)

## Security Specialist Agent

The Security Specialist agent provides:
- Security expertise and guidance
- Security review and documentation
- Compliance verification
- Incident response planning
- Security best practices

**Expertise**: Data encryption, access control, compliance (SOC2, GDPR, PCI-DSS), security architecture, threat modeling, vulnerability assessment, incident response

## Related Domains

- [Platform Engineering](../platform-engineering/README.md) - System health and deployment
- [Money Domain](../money/README.md) - Financial products requiring security

