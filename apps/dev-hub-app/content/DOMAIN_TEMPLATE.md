# Domain Documentation Template

Use this template when creating documentation for a new domain.

## Domain Structure

```
domains/[domain-name]/
├── README.md                 # Domain overview (required)
├── architecture/             # Architecture documentation
│   ├── overview.md
│   ├── entities.md
│   ├── use-cases.md
│   └── ports-adapters.md
├── implementation/           # Implementation guides
│   ├── getting-started.md
│   ├── security.md          # Security considerations
│   └── best-practices.md
├── api/                      # API documentation
│   ├── endpoints.md
│   └── examples.md
└── examples/                 # Code examples
    ├── entities/
    ├── use-cases/
    └── controllers/
```

## README.md Template

```markdown
# [Domain Name] Domain

**Lead**: [Agent Name] Agent  
**Focus**: [Domain focus and purpose]

## Overview

[Brief description of the domain]

## Quick Links

- [Architecture](./architecture/overview.md) - Domain architecture
- [Getting Started](./implementation/getting-started.md) - Implementation guide
- [Security](./implementation/security.md) - Security considerations
- [API](./api/endpoints.md) - API documentation
- [Examples](./examples/) - Code examples

## Key Features

- Feature 1
- Feature 2
- Feature 3

## Architecture

[Brief architecture overview]

## Getting Started

1. Step 1
2. Step 2
3. Step 3

## [Domain] Agent

The [Domain] agent provides:
- Expertise area 1
- Expertise area 2
- Expertise area 3

**Expertise**: [List of expertise areas]

## Related Domains

- [Related Domain 1](../related-domain-1/README.md)
- [Related Domain 2](../related-domain-2/README.md)
```

## Required Sections

### 1. Overview
- Domain purpose
- Key responsibilities
- Main entities

### 2. Architecture
- Architecture pattern used
- Domain structure
- Core entities
- Use cases
- Ports and adapters

### 3. Implementation
- Getting started guide
- Security considerations
- Best practices
- Common patterns

### 4. API Documentation
- Endpoints
- Request/response examples
- Error handling

### 5. Examples
- Code examples
- Real implementations
- Templates

## Security Section

Every domain must include a security section covering:
- Security requirements for the domain
- Data protection measures
- Authentication/authorization
- Compliance considerations
- Reference to Security domain procedures

## Best Practices

1. **Follow Hexagonal Architecture** - Separate domain, application, infrastructure, and presentation layers
2. **Document Security** - Always include security considerations
3. **Provide Examples** - Include real code examples
4. **Cross-Reference** - Link to related domains
5. **Keep Updated** - Update documentation as code changes

## Example: Security Domain

See [Security Domain](./domains/security/README.md) for a complete example of domain documentation.

