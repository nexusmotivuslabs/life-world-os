# Deployment Strategy: MVP vs Release 3

**Managed By**: Atlas (DevOps Engineer) + Ledger (Financial Accountant)  
**Last Updated**: [Current Date]

## Overview

Life World OS has two distinct deployment phases:
- **MVP**: In-home WiFi access (local deployment)
- **Release 3**: AWS public link (SaaS production)

This document outlines infrastructure requirements, costs, and caching strategies for each phase.

---

## MVP: In-Home WiFi Access (Local Deployment)

### Infrastructure Requirements

**Deployment**: Local (home network)  
**Infrastructure**: None (local machine)  
**Cost**: $0/month

### Architecture

```
Home Network (WiFi)
│
├── Local Machine
│   ├── PostgreSQL (Docker/local)
│   ├── Backend (Node.js/Express)
│   └── Frontend (React/Vite)
│
└── Access: http://localhost:5173 (or local IP)
```

### Components

1. **Database**: Local PostgreSQL (Docker or native)
2. **Backend**: Node.js running locally (port 3001)
3. **Frontend**: Vite dev server (port 5173)
4. **Caching**: PostgreSQL cache (sufficient for MVP)

### Setup

```bash
# Start local database
docker-compose -f docker-compose.dev.yml up -d postgres-dev

# Run backend locally
cd apps/backend
npm run dev

# Run frontend locally
cd apps/frontend
npm run dev
```

### Caching Strategy

**PostgreSQL Cache Only** (no ElastiCache needed)

- Location queries cached in PostgreSQL
- Cache expiration handled in database
- Sufficient for single user or small household
- No performance bottlenecks expected

### Cost Breakdown

| Component | Cost | Notes |
|-----------|------|-------|
| Infrastructure | $0 | Local deployment |
| Database | $0 | Local PostgreSQL |
| Caching | $0 | PostgreSQL cache |
| **Total** | **$0/month** | ✅ |

### Performance Characteristics

- **Users**: 1-5 (household)
- **Queries/Day**: < 100
- **Latency**: 10-50ms (local)
- **Throughput**: ~100 queries/second
- **Cache Hit Rate**: 60-80% expected

---

## Release 3: AWS Public Link (SaaS Production)

### Infrastructure Requirements

**Deployment**: AWS Cloud  
**Infrastructure**: Tier 2 services  
**Cost**: $7-26/month (depending on phase)

### Architecture

```
AWS Cloud
│
├── VPC (Network Isolation)
│   ├── Public Subnet (ECS Fargate)
│   └── Private Subnet (RDS, ElastiCache)
│
├── ECS Fargate (Backend Services)
│   ├── life-world-os-backend
│   └── travel-system-backend
│
├── RDS PostgreSQL (Database)
│   └── Shared or per-system
│
├── ElastiCache Redis (Optional - Phase 2)
│   └── cache.t3.micro ($13/month)
│
└── CloudFront (Frontend CDN)
    └── S3 static hosting
```

### Phase 1: Start Without ElastiCache (Recommended)

**Cost**: ~$7-13/month

**Infrastructure**:
- VPC: FREE
- ECS Fargate: $5-10/month (dev/staging usage)
- RDS PostgreSQL: $0-15/month (free tier eligible)
- CloudWatch: $2-3/month
- ElastiCache: $0 (deferred)

**Caching Strategy**: PostgreSQL cache only

**When PostgreSQL Cache Works**:
- < 100 concurrent users
- < 1,000 location queries/day
- Cache hit rate > 60%
- Query response time < 500ms acceptable

**Performance**:
- Latency: 10-50ms (database queries)
- Throughput: ~100 queries/second
- Suitable for: Startup phase (10-50 users)

### Phase 2: Add ElastiCache When Needed

**Cost**: ~$20-26/month

**Infrastructure**:
- All Phase 1 services
- ElastiCache Redis: $13/month (cache.t3.micro)

**When ElastiCache Becomes Necessary**:

1. **High Query Volume**
   - > 1,000 location queries/day
   - > 50 concurrent users
   - Database becomes bottleneck

2. **Performance Requirements**
   - Query response time > 1 second
   - Cache hit rate < 50%
   - Database CPU > 70%

3. **Multi-User Scenarios**
   - Same locations queried by multiple users
   - Shared cache benefits multiple requests
   - Session data needs fast access

4. **Cost Optimization**
   - Reducing database load saves RDS costs
   - ElastiCache cheaper than scaling RDS

**Performance**:
- Latency: 1-5ms (in-memory Redis)
- Throughput: ~10,000 queries/second
- Suitable for: Growth phase (50-200+ users)

---

## Decision Matrix: ElastiCache Required?

| Scenario | Users | Queries/Day | ElastiCache Needed? | Reason |
|----------|-------|-------------|---------------------|--------|
| **MVP (Local)** | 1-5 | < 100 | ❌ **No** | Local PostgreSQL sufficient |
| **Release 3 (Startup)** | 10-50 | 100-500 | ❌ **No** | PostgreSQL cache works |
| **Release 3 (Growth)** | 50-200 | 500-2,000 | ⚠️ **Maybe** | Monitor performance first |
| **Release 3 (Scale)** | 200+ | 2,000+ | ✅ **Yes** | Database bottleneck likely |

---

## Progressive Scaling Strategy

### MVP → Release 3 Phase 1

**Migration Path**:
1. Keep local deployment for development
2. Deploy to AWS for production
3. Start with PostgreSQL cache only
4. Monitor performance metrics

**Cost Impact**: $0 → $7-13/month

### Release 3 Phase 1 → Phase 2

**Migration Path**:
1. Monitor database performance
2. Track query latency and cache hit rates
3. Add ElastiCache when metrics indicate need
4. Implement hybrid caching (Redis + PostgreSQL)

**Cost Impact**: $7-13/month → $20-26/month

---

## Performance Monitoring

### Key Metrics to Track

```typescript
interface PerformanceMetrics {
  queryLatency: number        // Average query time (ms)
  cacheHitRate: number        // Cache hits / total queries (%)
  dbCpuUsage: number          // RDS CPU percentage
  concurrentUsers: number     // Active users
  queriesPerDay: number       // Daily query volume
}
```

### ElastiCache Trigger Conditions

Add ElastiCache when **any** of these conditions are met:

1. **Query Latency**: Average > 1,000ms
2. **Database CPU**: > 70% consistently
3. **Concurrent Users**: > 50 active users
4. **Cache Hit Rate**: < 50%
5. **Daily Queries**: > 1,000 queries/day

### Monitoring Implementation

```typescript
// Example monitoring logic
const metrics = await collectMetrics()

if (metrics.queryLatency > 1000 || 
    metrics.dbCpuUsage > 70 || 
    metrics.concurrentUsers > 50 ||
    metrics.cacheHitRate < 50) {
  // Recommend adding ElastiCache
  recommendElastiCache(metrics)
}
```

---

## Cost Comparison

### MVP (Local)
- Infrastructure: $0
- Database: $0
- Caching: $0
- **Total**: **$0/month** ✅

### Release 3 Phase 1 (No ElastiCache)
- VPC: $0
- ECS Fargate: $5-10/month
- RDS PostgreSQL: $0-15/month
- CloudWatch: $2-3/month
- ElastiCache: $0 (deferred)
- **Total**: **~$7-13/month** ✅

### Release 3 Phase 2 (With ElastiCache)
- All Phase 1 services
- ElastiCache: $13/month
- **Total**: **~$20-26/month** ⚠️ (slightly over $20, but acceptable)

---

## Caching Implementation

### MVP: PostgreSQL Cache Only

```typescript
// Current implementation - works for MVP
const cacheRepository = new PrismaLocationCacheRepositoryAdapter(prisma)

// Check cache in database
const cached = await cacheRepository.findByGooglePlaceId(placeId)
if (cached && !isExpired(cached)) {
  return cached.data  // Fast enough for local/MVP
}
```

### Release 3 Phase 1: PostgreSQL Cache

Same as MVP - PostgreSQL handles caching effectively for startup phase.

### Release 3 Phase 2: Hybrid Caching (Redis + PostgreSQL)

```typescript
// Hybrid approach - Redis first, fallback to PostgreSQL
const redisCache = new ElastiCacheAdapter(redisClient)
const dbCache = new PrismaLocationCacheRepositoryAdapter(prisma)

// Check Redis first (fast), fallback to database
let cached = await redisCache.findByGooglePlaceId(placeId)
if (!cached) {
  cached = await dbCache.findByGooglePlaceId(placeId)
  // Populate Redis for next time
  if (cached) await redisCache.save(cached)
}
```

---

## Recommendations

### For MVP (Local Deployment)

✅ **Use PostgreSQL cache only**
- No cloud infrastructure needed
- Zero cost
- Sufficient for household use
- Simple setup

### For Release 3 Phase 1 (Startup)

✅ **Start without ElastiCache**
- PostgreSQL cache sufficient for < 100 users
- Saves $13/month (65% of $20 budget)
- Can add ElastiCache when needed
- Monitor performance metrics

### For Release 3 Phase 2 (Scale)

✅ **Add ElastiCache when metrics indicate need**
- Database CPU > 70%
- Query latency > 1 second
- > 50 concurrent users
- > 1,000 queries/day

---

## Migration Checklist

### MVP → Release 3 Phase 1

- [ ] Set up AWS account
- [ ] Configure VPC and networking
- [ ] Deploy RDS PostgreSQL
- [ ] Deploy ECS Fargate services
- [ ] Configure CloudWatch monitoring
- [ ] Set up cost tracking (Ledger)
- [ ] Test PostgreSQL cache performance
- [ ] Monitor initial metrics

### Release 3 Phase 1 → Phase 2

- [ ] Monitor performance metrics for 2-4 weeks
- [ ] Identify performance bottlenecks
- [ ] Evaluate ElastiCache necessity
- [ ] Deploy ElastiCache Redis cluster
- [ ] Implement hybrid caching strategy
- [ ] Update cost tracking
- [ ] Monitor performance improvements

---

## Summary

**MVP (Local)**:
- ✅ No cloud infrastructure
- ✅ PostgreSQL cache sufficient
- ✅ $0/month cost
- ✅ Simple setup

**Release 3 Phase 1 (Startup)**:
- ✅ Start without ElastiCache
- ✅ PostgreSQL cache works
- ✅ $7-13/month cost
- ✅ Monitor before scaling

**Release 3 Phase 2 (Scale)**:
- ✅ Add ElastiCache when needed
- ✅ Hybrid caching strategy
- ✅ $20-26/month cost
- ✅ Optimized performance

**Key Principle**: Start simple, scale when metrics indicate need.

---

**Last Updated**: [Current Date]  
**Maintained By**: Atlas (DevOps Engineer) + Ledger (Financial Accountant)

