# Dev Hub App Deployment Guide

This document describes how to deploy the Developer Hub as a standalone application.

## Overview

The Dev Hub App is a Next.js application that can be deployed independently from the main Life World OS application. It serves as a centralized documentation site accessible to all development teams.

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides excellent Next.js support with zero configuration.

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Import your repository
   - Set root directory to `apps/dev-hub-app`

2. **Configure Build**
   - Framework Preset: Next.js
   - Root Directory: `apps/dev-hub-app`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables**
   - No environment variables required for basic setup

4. **Deploy**
   - Vercel will automatically deploy on every push to main
   - Preview deployments for pull requests

### Option 2: Docker

The app includes a Dockerfile for containerized deployment.

1. **Build Image**
   ```bash
   cd apps/dev-hub-app
   docker build -t dev-hub-app .
   ```

2. **Run Container**
   ```bash
   docker run -p 3001:3000 dev-hub-app
   ```

3. **Using Docker Compose**
   ```bash
   cd apps/dev-hub-app
   docker-compose up -d
   ```

### Option 3: Static Export

For static hosting (GitHub Pages, S3, etc.):

1. **Update next.config.js**
   ```javascript
   const nextConfig = {
     output: 'export',
     // ... other config
   }
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Deploy**
   - The `out/` directory contains static files
   - Upload to your static host

### Option 4: Traditional Server

1. **Build**
   ```bash
   npm run build
   ```

2. **Start**
   ```bash
   npm start
   ```

3. **Use PM2 for Production**
   ```bash
   pm2 start npm --name "dev-hub" -- start
   ```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Dev Hub

on:
  push:
    branches: [main]
    paths:
      - 'apps/dev-hub-app/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd apps/dev-hub-app && npm ci
      - run: cd apps/dev-hub-app && npm run build
      - run: cd apps/dev-hub-app && npm start
```

## Environment-Specific Deployments

### Development
- URL: `https://dev-hub-dev.yourdomain.com`
- Auto-deploy from `develop` branch

### Staging
- URL: `https://dev-hub-staging.yourdomain.com`
- Auto-deploy from `staging` branch

### Production
- URL: `https://dev-hub.yourdomain.com`
- Manual deployment from `main` branch

## Updating Content

Documentation is stored in the `content/` directory as Markdown files. To update:

1. Edit markdown files in `content/`
2. Commit and push changes
3. Deployment will automatically rebuild and redeploy

## Monitoring

- **Health Check**: `GET /api/health`
- **Metrics**: Monitor response times and error rates
- **Uptime**: Ensure 99.9% availability

## Security

- Enable HTTPS/TLS
- Set appropriate CORS headers if needed
- Use environment variables for sensitive config
- Regular dependency updates

## Backup

Since this is a documentation site:
- Content is version-controlled in Git
- No database to backup
- Static assets can be cached via CDN

## Troubleshooting

### Build Fails
- Check Node.js version (requires >= 20.0.0)
- Verify all dependencies are installed
- Check for TypeScript errors

### Content Not Updating
- Clear Next.js cache: `.next/` directory
- Rebuild the application
- Check file paths in `content/` directory

### Performance Issues
- Enable Next.js caching
- Use CDN for static assets
- Optimize images if any
- Consider ISR (Incremental Static Regeneration)


