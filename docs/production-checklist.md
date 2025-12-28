# Production Deployment Checklist

This checklist ensures your production deployment is configured correctly for a live system.

## Pre-Deployment Checklist

### Security
- [ ] All secrets are stored in a secrets manager (AWS Secrets Manager, Azure Key Vault, HashiCorp Vault)
- [ ] JWT_SECRET is at least 32 characters and randomly generated (`openssl rand -base64 32`)
- [ ] Database password is strong and unique
- [ ] API keys are rotated and stored securely
- [ ] CORS origins are restricted to your actual domain(s)
- [ ] Rate limiting is enabled
- [ ] Security headers are configured (CSP, HSTS, etc.)
- [ ] SSL/TLS certificates are valid and auto-renewing
- [ ] Database ports are not exposed publicly (behind VPN/VPC)

### Environment Variables
- [ ] All required environment variables are set
- [ ] `.env.prod` file is NOT committed to git
- [ ] Environment variables match the example template
- [ ] Database connection string uses managed database (not localhost)
- [ ] API URLs point to production domains (HTTPS)
- [ ] Log level is set to `warn` or `error` (not `debug`)

### Database
- [ ] Using managed database service (RDS, Cloud SQL, Azure Database)
- [ ] Database backups are enabled and tested
- [ ] Connection pooling is configured (min: 2, max: 10)
- [ ] Database performance tuning is applied
- [ ] Database is in the same region/VPC as application
- [ ] Database access is restricted to application servers only

### Application Configuration
- [ ] Resource limits are set (CPU, memory)
- [ ] Health checks are configured and working
- [ ] Graceful shutdown is configured
- [ ] Request timeouts are set appropriately
- [ ] Maximum request size is limited
- [ ] Application runs as non-root user

### Monitoring & Logging
- [ ] Error tracking is configured (Sentry, etc.)
- [ ] Application performance monitoring is enabled (APM)
- [ ] Log aggregation is configured (CloudWatch, Loggly, etc.)
- [ ] Health check endpoints are monitored
- [ ] Alerts are configured for critical errors
- [ ] Uptime monitoring is configured

### Infrastructure
- [ ] Load balancer is configured with SSL termination
- [ ] CDN is configured for static assets (frontend)
- [ ] Auto-scaling is configured (if applicable)
- [ ] Backup strategy is documented and tested
- [ ] Disaster recovery plan is documented
- [ ] Resource limits are appropriate for expected load

### DNS & Domains
- [ ] DNS records point to correct IPs
- [ ] SSL certificates are issued and valid
- [ ] Subdomains are configured (api.yourdomain.com, www.yourdomain.com)
- [ ] Domain redirects are configured (HTTP -> HTTPS, www -> non-www)

### CI/CD
- [ ] Build process includes tests
- [ ] Deployment is automated
- [ ] Rollback strategy is documented
- [ ] Version tags are used for deployments
- [ ] Build metadata is captured (version, commit, timestamp)

## Post-Deployment Checklist

### Verification
- [ ] Health checks are passing
- [ ] Application is responding to requests
- [ ] Database connection is working
- [ ] Authentication is working
- [ ] API endpoints are accessible
- [ ] Frontend is loading correctly
- [ ] SSL certificates are valid and working

### Monitoring
- [ ] Error rates are normal
- [ ] Response times are acceptable
- [ ] Resource usage is within limits
- [ ] Database connections are stable
- [ ] No critical errors in logs
- [ ] Monitoring dashboards are set up

### Security
- [ ] Security headers are present
- [ ] CORS is working correctly
- [ ] Rate limiting is active
- [ ] No sensitive data in logs
- [ ] Database is not publicly accessible

## Production Configuration Files

### Required Files
- `.env.prod` - Environment variables (gitignored)
- `docker-compose.prod.yml` - Docker Compose configuration
- SSL certificates (managed by load balancer/CDN)

### Recommended Files
- `nginx.conf` - Nginx configuration (if using)
- Backup scripts
- Monitoring configuration files
- Infrastructure as Code (Terraform, CloudFormation, etc.)

## Critical Production Settings

### Must Configure
1. **JWT_SECRET** - Must be at least 32 characters, randomly generated
2. **Database Connection** - Use managed database, not localhost
3. **API URLs** - Must use HTTPS
4. **CORS Origins** - Must restrict to your actual domain(s)
5. **Log Level** - Set to `warn` or `error`
6. **Resource Limits** - Set appropriate CPU and memory limits

### Recommended Settings
1. **Error Tracking** - Configure Sentry or similar
2. **APM** - Configure application performance monitoring
3. **Backups** - Enable automated database backups
4. **Rate Limiting** - Enable to prevent abuse
5. **Health Checks** - Configure with appropriate intervals
6. **Graceful Shutdown** - Configure timeout for graceful shutdowns

## Common Production Issues

### Database Connection Issues
- Ensure database is in same VPC/network
- Check security groups/firewall rules
- Verify connection string format
- Check connection pool settings

### Performance Issues
- Check resource limits (CPU, memory)
- Review database query performance
- Check connection pool sizing
- Review application logs for slow requests

### Security Issues
- Verify CORS origins are restricted
- Check that rate limiting is enabled
- Ensure security headers are present
- Verify SSL/TLS is configured correctly

## Support & Documentation

- Review logs: `docker-compose -f docker-compose.prod.yml logs`
- Check health: `curl https://api.yourdomain.com/api/health`
- Monitor resources: `docker stats`
- Review configuration: `docker-compose -f docker-compose.prod.yml config`

## Emergency Procedures

### Rollback
1. Stop current deployment: `docker-compose -f docker-compose.prod.yml down`
2. Deploy previous version using version tag
3. Verify health checks pass

### Database Issues
1. Check database health and connectivity
2. Review database logs
3. Verify connection pool settings
4. Check database resource usage

### Application Crashes
1. Check application logs
2. Review resource limits
3. Check for memory leaks
4. Review error tracking dashboard

