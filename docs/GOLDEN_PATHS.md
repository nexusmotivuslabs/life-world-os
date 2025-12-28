# Golden Paths - User Workflows

This document outlines all critical user workflows (golden paths) in Life World OS. These are the primary user journeys that must work reliably.

## Overview

Golden paths are the most important user workflows - the core value delivery paths. All other features support these primary journeys.

## 1. Authentication & Onboarding

### Path: New User Registration → First Login → Dashboard

**Steps:**
1. User visits `/register`
2. Creates account (email, password, username)
3. Redirected to `/login`
4. Logs in successfully
5. Sees dashboard with initial state
6. Completes questionnaire (optional)
7. System initializes user resources (energy, capacity, etc.)

**Success Criteria:**
- ✅ User can register
- ✅ User can log in
- ✅ JWT token is issued
- ✅ Dashboard loads with user data
- ✅ Resources initialized (energy: 100, capacity: 100)

**Error Handling:**
- 400: Invalid registration data
- 401: Invalid credentials
- 409: Email already exists
- 500: Server error during registration

---

## 2. Knowledge Plane - Artifacts Exploration

### Path: View Artifacts → Explore Hierarchy → View Details

**Steps:**
1. User navigates to `/knowledge/artifacts`
2. Sees artifact grid/museum view
3. Clicks "Full Hierarchy Tree"
4. Expands REALITY node
5. Clicks on a Law/Principle/Framework
6. Views detailed modal with all template fields
7. Can filter by category
8. Can switch between grid and museum view

**Success Criteria:**
- ✅ Artifacts page loads
- ✅ Hierarchy tree displays
- ✅ Nodes are expandable
- ✅ Details modal shows all fields
- ✅ Filters work correctly
- ✅ View modes switch correctly

**Error Handling:**
- 404: Artifact not found
- 500: Database connection error
- "Unable to load hierarchy data" → Check database connection

---

## 3. Systems Plane - Energy & Capacity Management

### Path: View Energy → Perform Action → See Results

**Steps:**
1. User views dashboard (`/dashboard`)
2. Sees current energy and capacity
3. Performs an activity (e.g., `/api/xp/activity`)
4. System calculates energy cost
5. System applies capacity modifier
6. System records XP gain
7. User sees updated energy and XP

**Success Criteria:**
- ✅ Energy displayed correctly
- ✅ Capacity modifier applied
- ✅ Energy deducted after action
- ✅ XP gained and displayed
- ✅ Burnout detection works
- ✅ Recovery actions tracked

**Error Handling:**
- 400: Invalid activity type
- 401: Not authenticated
- 403: Insufficient energy
- 500: Calculation error

---

## 4. Money System - Financial Tracking

### Path: Add Expense → View Dashboard → Analyze Trends

**Steps:**
1. User navigates to Money System
2. Adds an expense (`/api/expenses`)
3. Expense is categorized
4. Dashboard updates with new expense
5. User views financial overview
6. Sees trends and patterns

**Success Criteria:**
- ✅ Expense added successfully
- ✅ Categorization works
- ✅ Dashboard updates
- ✅ Trends calculated
- ✅ Historical data visible

**Error Handling:**
- 400: Invalid expense data
- 401: Not authenticated
- 500: Database error

---

## 5. Systems Exploration

### Path: Choose System → View Details → Interact

**Steps:**
1. User visits `/systems/list`
2. Sees all systems organized by tier
3. Clicks on a system (e.g., Finance)
4. Views system details
5. Can interact with system features
6. Sees system-specific data

**Success Criteria:**
- ✅ Systems list loads
- ✅ Tiers display correctly
- ✅ System details accessible
- ✅ Interactions work
- ✅ Data loads correctly

**Error Handling:**
- 404: System not found
- 500: System unavailable

---

## 6. Blog System - Content Consumption

### Path: View Blog List → Read Post → Navigate Categories

**Steps:**
1. User navigates to blog section
2. Sees list of blog posts
3. Clicks on a post
4. Reads full content
5. Can filter by category
6. Can navigate between posts

**Success Criteria:**
- ✅ Blog posts load
- ✅ Categories filter correctly
- ✅ Post content displays
- ✅ Navigation works
- ✅ All users see all posts (system-wide)

**Error Handling:**
- 404: Post not found
- 500: Content loading error

---

## 7. Health & Capacity Monitoring

### Path: Check Health → View Status → Take Recovery Action

**Steps:**
1. User checks health status (`/api/health/status`)
2. Sees capacity level
3. Sees energy status
4. Sees burnout risk
5. Takes recovery action if needed
6. System updates capacity

**Success Criteria:**
- ✅ Health endpoint responds
- ✅ Capacity displayed correctly
- ✅ Energy status accurate
- ✅ Burnout detection works
- ✅ Recovery actions tracked

**Error Handling:**
- 401: Not authenticated
- 404: User data not found
- 500: Health check failed

---

## 8. Reality Hierarchy - Knowledge Navigation

### Path: Explore Hierarchy → Understand Relationships → Apply Knowledge

**Steps:**
1. User navigates to `/knowledge/artifacts`
2. Views full hierarchy tree
3. Expands nodes to see structure
4. Clicks on Laws/Principles/Frameworks
5. Reads derived relationships
6. Understands how concepts connect
7. Can apply knowledge to decisions

**Success Criteria:**
- ✅ Hierarchy loads from database
- ✅ Nodes expand/collapse
- ✅ Relationships visible
- ✅ Template fields display
- ✅ Navigation intuitive

**Error Handling:**
- 500: Database connection error
- "Unable to load hierarchy data" → Database not seeded

---

## 9. Local Development Workflow

### Path: Start Services → Develop → Test → Deploy

**Steps:**
1. Developer starts dev database (`docker-compose up -d postgres-dev`)
2. Starts backend (`PORT=5001 npm run dev`)
3. Starts frontend (`npm run dev`)
4. Makes code changes
5. Sees hot reload
6. Tests changes
7. Verifies in browser
8. Commits and deploys

**Success Criteria:**
- ✅ All services start
- ✅ Hot reload works
- ✅ Database connection works
- ✅ Changes reflect immediately
- ✅ No connection errors

**Error Handling:**
- Port conflicts → Kill existing processes
- Database connection → Check DATABASE_URL
- Build errors → Fix TypeScript errors

---

## 10. Observability - Monitoring & Debugging

### Path: View Metrics → Identify Issues → Resolve

**Steps:**
1. Developer/Admin views metrics (`/api/metrics`)
2. Checks error rates (`/api/metrics/errors`)
3. Views health status (`/api/metrics/health`)
4. Identifies 4xx/5xx errors
5. Checks logs
6. Fixes issues
7. Verifies resolution

**Success Criteria:**
- ✅ Metrics endpoint accessible
- ✅ Error tracking works
- ✅ Health checks accurate
- ✅ Prometheus scraping works
- ✅ Grafana dashboards show data

**Error Handling:**
- 500: Metrics collection error
- No data: Prometheus not scraping

---

## Critical Dependencies

### Database
- ✅ Must be running and accessible
- ✅ Must be seeded with required data
- ✅ Connection string must be correct

### Authentication
- ✅ JWT secret must be configured
- ✅ Token validation must work
- ✅ User sessions must persist

### Services
- ✅ Backend must be running
- ✅ Frontend must be running
- ✅ Database must be running
- ✅ Services must communicate

---

## Error Monitoring

### 4xx Errors (Client Errors)
- **400**: Bad Request - Invalid input data
- **401**: Unauthorized - Missing/invalid token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Resource already exists

### 5xx Errors (Server Errors)
- **500**: Internal Server Error - Unexpected error
- **502**: Bad Gateway - Upstream service error
- **503**: Service Unavailable - Service down

### Monitoring
- Track error rates via `/api/metrics/errors`
- View in Grafana dashboards
- Alert on high error rates (>10%)

---

## Success Metrics

### Performance
- ✅ API response time < 200ms (p95)
- ✅ Page load time < 2s
- ✅ Database query time < 100ms

### Reliability
- ✅ Uptime > 99.9%
- ✅ Error rate < 1%
- ✅ 4xx errors < 5%
- ✅ 5xx errors < 0.1%

### User Experience
- ✅ All golden paths complete successfully
- ✅ No blocking errors
- ✅ Fast page loads
- ✅ Smooth interactions

---

## Testing Golden Paths

### Manual Testing
1. Test each golden path end-to-end
2. Verify success criteria
3. Check error handling
4. Verify observability

### Automated Testing
- E2E tests for critical paths
- API tests for endpoints
- Integration tests for workflows

---

## Maintenance

### Regular Checks
- ✅ Monitor error rates daily
- ✅ Review golden paths weekly
- ✅ Update documentation when paths change
- ✅ Test after major changes

### When Paths Break
1. Check observability dashboards
2. Review error logs
3. Identify root cause
4. Fix issue
5. Verify path works
6. Update documentation if needed

---

## Related Documents

- [Local Database Setup](./LOCAL_DATABASE_SETUP.md)
- [Observability Guide](./OBSERVABILITY_DEV.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Troubleshooting](./RUNBOOKS.md)

