# Custom Domains Quick Start

**Quick setup for custom domain routing**

## 🚀 Quick Setup (3 Steps)

### 1. Setup /etc/hosts
```bash
sudo ./scripts/setup-domains.sh
```

### 2. Start Services
```bash
docker-compose -f docker-compose.domains.yml up -d
```

### 3. Access
- **Dev**: http://dev.lifeworld.com
- **Staging**: http://staging.lifeworld.com
- **Prod**: http://prod.lifeworld.com
- **Local Dev**: http://localdev.lifeworld.com

## 📋 Domain Mapping

| Domain | Environment | Frontend Port | Backend Port |
|--------|------------|--------------|-------------|
| `localdev.lifeworld.com` | Localhost | 5173 | 3001 |
| `dev.lifeworld.com` | Docker Dev | 5173 | 3001 |
| `staging.lifeworld.com` | Docker Staging | 5174 | 3002 |
| `prod.lifeworld.com` | Docker Prod | 5175 | 3003 |

## 🔧 Commands

```bash
# Setup domains
npm run domains:setup

# Start all environments
npm run domains:up

# Stop all
npm run domains:down

# View logs
npm run domains:logs

# Test domains
curl http://dev.lifeworld.com/health
curl http://staging.lifeworld.com/health
curl http://prod.lifeworld.com/health
```

## 📚 Full Documentation

See [Custom Domains Setup Guide](./docs/CUSTOM_DOMAINS_SETUP.md) for detailed instructions.

## ☁️ AWS Migration

When migrating to AWS, replace Nginx with:
- **ALB** (Application Load Balancer) for routing
- **Route 53** for DNS
- **ACM** for SSL certificates

Domain structure remains the same!

