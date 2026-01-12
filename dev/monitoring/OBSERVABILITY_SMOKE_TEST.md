# Observability Stack in Smoke Tests

**Status**: ✅ Integrated  
**Purpose**: Verify observability tools are running during smoke tests

---

## Observability Tools Checked

The smoke test now verifies that the following observability tools are running:

1. **Prometheus** (Metrics Collection)
   - Container: `life-world-os-prometheus`
   - Health: `http://localhost:9090/-/healthy`
   - Status: Optional for local, required for staging/production

2. **Grafana** (Dashboards & Visualization)
   - Container: `life-world-os-grafana`
   - Health: `http://localhost:3000/api/health`
   - Status: Optional for local, required for staging/production

3. **SonarQube** (Code Quality)
   - Container: `life-world-os-sonarqube`
   - Health: `http://localhost:9000/api/system/status`
   - Status: Optional for local, required for staging/production

---

## Local vs Staging/Production

### Local Development
- **Status**: Optional
- **Reason**: Observability tools are nice-to-have for local development
- **Action**: Smoke test will pass even if tools aren't running (with info message)

### Staging/Production
- **Status**: Required
- **Reason**: Full observability is essential for production monitoring
- **Action**: Smoke test should verify all tools are running before deployment

---

## Starting Observability Stack

### Before Smoke Tests
```bash
# Start all observability tools
npm run observability:up  # Prometheus + Grafana
npm run sonar:up          # SonarQube

# Or start individually
npm run dev:prometheus
npm run portainer:up
npm run sonar:start
```

### Verify They're Running
```bash
# Check containers
docker ps | grep -E "prometheus|grafana|sonarqube"

# Check health
curl http://localhost:9090/-/healthy      # Prometheus
curl http://localhost:3000/api/health    # Grafana
curl http://localhost:9000/api/system/status  # SonarQube
```

---

## Smoke Test Integration

The smoke test now includes observability checks in Phase 1:

```
📋 Phase 1: Environment Setup
───────────────────────────────────────────────────────
✅ PASS: Docker is running
✅ PASS: Prometheus is running
✅ PASS: Grafana is running
✅ PASS: SonarQube is running
✅ PASS: Observability stack is running
```

If tools aren't running, the test will show info messages but won't fail (for local development).

---

## AWS Deployment

When deploying to AWS:
- Prometheus, Grafana, and SonarQube will run in separate containers/services
- They will be required for staging and production environments
- Smoke tests will enforce their presence in staging/production

---

## Quick Commands

```bash
# Start everything
npm run phase1:up          # Observability + Portainer
npm run observability:up   # Prometheus + Grafana
npm run sonar:start       # SonarQube

# Check status
npm run phase1:status
npm run sonar:status

# View logs
npm run observability:logs
npm run sonar:logs
```

---

**Note**: For local development, observability tools are optional. For staging/production, they should be running and verified by smoke tests.

