# Production Database Configuration

This document describes how to configure PostgreSQL for production deployments.

## PostgreSQL Configuration

PostgreSQL tuning parameters should be configured via a custom `postgresql.conf` file or by mounting a configuration file. The Docker image doesn't read all tuning parameters from environment variables.

### Recommended Approach: Custom postgresql.conf

Create a `postgresql.conf` file with production-optimized settings:

```conf
# Connection Settings
max_connections = 100

# Memory Settings
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
work_mem = 4MB

# Write-Ahead Logging
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 4GB
checkpoint_completion_target = 0.9

# Query Planner
random_page_cost = 1.1
effective_io_concurrency = 200
default_statistics_target = 100

# Logging (Production)
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d.log'
log_rotation_age = 1d
log_rotation_size = 100MB
log_min_messages = warning
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 0
log_autovacuum_min_duration = 0
log_error_verbosity = default

# Performance Monitoring
track_io_timing = on
track_functions = all
```

### Mount Configuration in Docker Compose

Update `docker-compose.prod.yml`:

```yaml
postgres-prod:
  volumes:
    - postgres_prod_data:/var/lib/postgresql/data
    - ./config/postgres/postgresql.conf:/etc/postgresql/postgresql.conf
  command: postgres -c config_file=/etc/postgresql/postgresql.conf
```

## Connection Pooling

Application-level connection pooling is handled by Prisma. Configure via environment variables:

```env
PROD_DB_POOL_MIN=2
PROD_DB_POOL_MAX=10
PROD_DB_POOL_IDLE_TIMEOUT_MS=30000
PROD_DB_POOL_CONNECTION_TIMEOUT_MS=20000
```

## Backup Configuration

### Automated Backups

Use a cron job or container to perform regular backups:

```yaml
postgres-backup:
  image: postgres:15-alpine
  volumes:
    - postgres_prod_data:/var/lib/postgresql/data:ro
    - postgres_prod_backups:/backups
  environment:
    PGHOST: postgres-prod
    PGPORT: 5432
    PGUSER: ${PROD_DB_USER}
    PGPASSWORD: ${PROD_DB_PASSWORD}
    PGDATABASE: ${PROD_DB_NAME}
  command: >
    sh -c "while true; do
      pg_dump -Fc > /backups/backup-$$(date +%Y%m%d-%H%M%S).dump;
      # Keep only last 7 days of backups
      find /backups -name 'backup-*.dump' -mtime +7 -delete;
      sleep 3600;
    done"
```

### Manual Backup

```bash
# Create backup
docker exec postgres-prod pg_dump -U ${PROD_DB_USER} -Fc ${PROD_DB_NAME} > backup.dump

# Restore backup
docker exec -i postgres-prod pg_restore -U ${PROD_DB_USER} -d ${PROD_DB_NAME} -c < backup.dump
```

## Recommended: Managed Database Services

For production, use managed database services:

- **AWS**: RDS PostgreSQL
- **GCP**: Cloud SQL for PostgreSQL
- **Azure**: Azure Database for PostgreSQL
- **DigitalOcean**: Managed Databases
- **Heroku**: Heroku Postgres

Benefits:
- Automated backups
- High availability
- Automatic failover
- Performance monitoring
- Security patches
- Scalability

## Security Best Practices

1. **Network Isolation**: Database should not be publicly accessible
2. **Strong Passwords**: Use long, random passwords (32+ characters)
3. **SSL/TLS**: Enable SSL connections
4. **Least Privilege**: Grant minimum required permissions
5. **Regular Updates**: Keep PostgreSQL updated
6. **Audit Logging**: Enable connection and query logging
7. **Encryption**: Encrypt data at rest and in transit

## Monitoring

### Key Metrics to Monitor

- Connection count
- Query performance (slow queries)
- Cache hit ratio
- Disk I/O
- WAL file generation
- Lock waits
- Deadlocks
- Replication lag (if using replication)

### Monitoring Tools

- **pg_stat_statements**: Built-in query performance monitoring
- **pgAdmin**: PostgreSQL administration tool
- **Grafana + Prometheus**: Metrics visualization
- **CloudWatch / Cloud Monitoring**: Cloud provider monitoring

## Performance Tuning Tips

1. **shared_buffers**: Set to 25% of available RAM (up to 8GB)
2. **effective_cache_size**: Set to 50-75% of available RAM
3. **work_mem**: Set based on max_connections (work_mem * max_connections should be < RAM)
4. **maintenance_work_mem**: Set to 1-2GB for large databases
5. **checkpoint_completion_target**: Set to 0.9 for smoother writes
6. **random_page_cost**: Lower for SSDs (1.1) vs HDDs (4.0)
7. **effective_io_concurrency**: Higher for SSDs (200-300)

## Connection String Format

```env
PROD_DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?sslmode=require&connect_timeout=20&pool_timeout=20
```

Parameters:
- `sslmode=require`: Enforce SSL connections
- `connect_timeout=20`: Connection timeout in seconds
- `pool_timeout=20`: Pool timeout in seconds

