# SonarQube Setup Guide

**Last Updated**: 2025-01-15  
**Purpose**: Code quality analysis and monitoring  
**Status**: ✅ Configured

---

## Overview

SonarQube provides continuous code quality analysis, detecting bugs, vulnerabilities, code smells, and security issues. This guide covers setup and usage for Life World OS.

---

## Quick Start

### Option 1: Use SonarCloud (Cloud - Recommended)

1. **Sign up** at [sonarcloud.io](https://sonarcloud.io)
2. **Create project** and get token
3. **Configure**:
   ```bash
   npm run sonar:setup
   # Edit .sonarqube.env with your token
   ```
4. **Run analysis**:
   ```bash
   npm run sonar:analyze
   ```

### Option 2: Local SonarQube Server (Docker)

Uses the official SonarQube Docker image from Docker Hub.

1. **Start SonarQube** (Docker Compose):
   ```bash
   npm run sonar:up
   ```
   
   This starts:
   - SonarQube server (official `sonarqube:latest` image)
   - PostgreSQL database for SonarQube data

2. **Wait for startup** (first time takes 1-2 minutes):
   ```bash
   npm run sonar:logs
   ```
   Look for: "SonarQube is operational"

3. **Access SonarQube**:
   - URL: http://localhost:9000
   - Default credentials: `admin` / `admin` (change on first login)

3. **Generate token**:
   - Go to: User > My Account > Security > Generate Token
   - Copy token

4. **Configure**:
   ```bash
   npm run sonar:setup
   # Edit .sonarqube.env:
   # SONAR_HOST_URL=http://localhost:9000
   # SONAR_TOKEN=your-token-here
   ```

5. **Run analysis**:
   ```bash
   npm run sonar:analyze
   ```

---

## Configuration Files

### `sonar-project.properties`
Main SonarQube configuration file defining:
- Project key and name
- Source code locations
- Exclusions (node_modules, dist, etc.)
- Test coverage paths
- Module definitions (backend, frontend)

### `.sonarqube.env`
Environment-specific configuration (not in git):
- `SONAR_HOST_URL`: SonarQube server URL
- `SONAR_TOKEN`: Authentication token
- `SONAR_PROJECT_KEY`: Project identifier

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run sonar:setup` | Initial setup wizard |
| `npm run sonar:analyze` | Run code quality analysis (requires SonarScanner installed) |
| `npm run sonar:analyze:docker` | Run analysis using Docker (no local install needed) |
| `npm run sonar:up` | Start local SonarQube server (Docker - official image) |
| `npm run sonar:down` | Stop local SonarQube server |
| `npm run sonar:logs` | View SonarQube server logs |
| `npm run sonar:status` | Check SonarQube server status |

---

## Analysis Process

1. **Generate Coverage** (if available):
   - Backend: `cd apps/backend && npm run test:coverage`
   - Frontend: `cd apps/frontend && npm run test:coverage`

2. **Run Analysis** (choose one):
   ```bash
   # Option A: Using local SonarScanner (requires installation)
   npm run sonar:analyze
   
   # Option B: Using Docker (no local install needed - recommended)
   npm run sonar:analyze:docker
   ```

3. **View Results**:
   - Open SonarQube dashboard
   - Navigate to your project
   - Review code quality metrics

---

## What SonarQube Analyzes

### Code Quality
- **Bugs**: Potential runtime errors
- **Vulnerabilities**: Security issues
- **Code Smells**: Maintainability issues
- **Duplications**: Code duplication
- **Coverage**: Test coverage (if available)

### Metrics
- **Reliability**: Bugs and reliability issues
- **Security**: Vulnerabilities and security hotspots
- **Maintainability**: Code smells and technical debt
- **Coverage**: Test coverage percentage

---

## Integration with GitLab Flow

### CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# .gitlab-ci.yml example
sonarqube:
  stage: test
  script:
    - npm install
    - npm run build
    - npm run sonar:analyze
  only:
    - staging
    - main
```

### Branch Analysis

SonarQube automatically detects the current branch and creates separate analyses for:
- `main`: Production code quality
- `staging`: Staging code quality
- `feature/*`: Feature branch quality

---

## Quality Gates

### Default Quality Gate
- **New Code Coverage**: 80%+
- **No New Bugs**: 0
- **No New Vulnerabilities**: 0
- **No New Code Smells**: Threshold based on project size

### Custom Quality Gates

Configure in SonarQube:
1. Go to: Quality Gates > Create
2. Set thresholds:
   - Coverage: 80%
   - Duplications: < 3%
   - Maintainability Rating: A
   - Reliability Rating: A
   - Security Rating: A

---

## Troubleshooting

### SonarScanner Not Found
```bash
# macOS
brew install sonar-scanner

# Or download from:
# https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/

# Or use Docker (alternative):
docker run --rm \
  -v $(pwd):/usr/src \
  sonarsource/sonar-scanner-cli \
  -Dsonar.projectKey=life-world-os \
  -Dsonar.sources=apps \
  -Dsonar.host.url=http://host.docker.internal:9000 \
  -Dsonar.login=YOUR_TOKEN
```

### Connection Issues
- Check `SONAR_HOST_URL` in `.sonarqube.env`
- Verify SonarQube server is running: `npm run sonar:logs`
- Check token is valid: Regenerate in SonarQube UI

### Coverage Not Showing
- Ensure test coverage is generated before analysis
- Check `sonar-project.properties` coverage paths
- Verify coverage format (LCOV)

### Analysis Fails
- Check SonarQube server logs: `npm run sonar:logs`
- Verify project key matches SonarQube project
- Check file permissions and exclusions

---

## Best Practices

1. **Run Before Merging**: Analyze code before merging to `staging`
2. **Fix Critical Issues**: Address bugs and vulnerabilities immediately
3. **Monitor Trends**: Track code quality over time
4. **Set Quality Gates**: Enforce minimum quality standards
5. **Regular Analysis**: Run analysis on every commit or PR

---

## Resources

- [SonarQube Documentation](https://docs.sonarqube.org/)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [SonarScanner Installation](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/)

---

**Maintained By**: Platform Engineering  
**Review Cycle**: Quarterly

