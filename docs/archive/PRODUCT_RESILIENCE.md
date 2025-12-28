# Product Resilience Architecture

## Overview
Products are designed to remain available even when team/domain data has issues. This document explains the technical implementation.

## Key Principles

1. **Independent Ownership**: Products are owned by organizations (Nexus Motivus), not teams
2. **Graceful Degradation**: If team associations fail, fall back to all active products
3. **Error Isolation**: Product failures don't cascade to teams, and vice versa
4. **Circuit Breaker Pattern**: Prevent repeated failures from overwhelming the system

## Implementation Layers

### 1. Database Layer
- Products stored in `products` table (owned by `organizationId`)
- Team associations in `team_product_associations` (many-to-many)
- Products can be queried independently: `SELECT * FROM products WHERE isActive = true`

### 2. Repository Layer (`PrismaProductRepositoryAdapter`)

**Resilience Features:**
- `findByTeamId()`: Returns empty array on failure (doesn't throw)
- `findActiveProducts(teamId?)`: Falls back to all active products if team associations fail
- Independent queries: Products can be queried without team context

**Example:**
```typescript
// If team associations fail, gracefully return empty array
async findByTeamId(teamId: string): Promise<Product[]> {
  try {
    // ... query associations
  } catch (error) {
    console.warn('Team associations failed, returning empty array')
    return [] // Don't throw - products still exist independently
  }
}
```

### 3. Controller Layer (`ProductController`)

**Resilience Features:**
- Try team-specific products first
- Fall back to all active products if team query fails
- Always return 200 status (never 500) with products array (even if empty)

**Example:**
```typescript
// If team products fail, fall back to all products
try {
  products = await productRepository.findByTeamId(teamId)
} catch (teamError) {
  products = await productRepository.findActiveProducts() // Fallback
}
```

### 4. Frontend Layer (`TeamDetailView`)

**Resilience Features:**
- Use `Promise.allSettled()` to prevent one failure from blocking others
- Fallback: If team-specific products fail, try loading all products
- Continue rendering with available data (don't block UI)

**Example:**
```typescript
// Try team products, fallback to all products
try {
  productsRes = await productsApi.list(team.id)
} catch (error) {
  productsRes = await productsApi.list() // Fallback to all products
}
```

## Error Scenarios & Responses

### Scenario 1: Team Table Has Issues
- **Impact**: Team associations can't be queried
- **Response**: Products still available via `findActiveProducts()`
- **User Experience**: See all active products instead of team-specific ones

### Scenario 2: TeamProductAssociation Table Has Issues
- **Impact**: Can't query which products belong to which teams
- **Response**: Fall back to all active products
- **User Experience**: Products still accessible, just not filtered by team

### Scenario 3: Complete Team Data Failure
- **Impact**: Can't load team info at all
- **Response**: Products API endpoint still works independently
- **User Experience**: Can still access products via `/api/products` endpoint

### Scenario 4: Database Connection Issues
- **Impact**: Can't query any data
- **Response**: Return empty array with warning (don't crash)
- **User Experience**: UI shows "no products available" message

## Monitoring

### Key Metrics to Monitor:
1. Product query success rate (by team vs. all)
2. Fallback activation frequency
3. Circuit breaker state changes
4. Response times for product queries

### Log Messages:
- `⚠️ Warning: Failed to load products for team X, falling back to all active products`
- `🔴 Circuit breaker OPEN for team-products due to N failures`
- `✅ Circuit breaker CLOSED for team-products after recovery`

## Testing Resilience

### Test Cases:
1. **Team Table Missing**: Mock team query failure, verify products still load
2. **Association Table Corrupted**: Mock association query failure, verify fallback
3. **Slow Team Queries**: Add delay, verify timeout and fallback
4. **Partial Failure**: One team fails, others succeed

### Example Test:
```typescript
// Simulate team data failure
jest.spyOn(prisma.team, 'findUnique').mockRejectedValue(new Error('Team data unavailable'))

// Products should still load
const products = await productRepository.findActiveProducts()
expect(products.length).toBeGreaterThan(0)
```

## Future Enhancements

1. **Caching Layer**: Cache products independently to reduce database load
2. **Health Checks**: Separate health endpoints for products vs. teams
3. **Retry Logic**: Automatic retry with exponential backoff
4. **Circuit Breaker Dashboard**: Visual monitoring of circuit breaker states

