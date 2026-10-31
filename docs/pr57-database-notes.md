# PR57: Database Notes

## PostgreSQL Container and Migrate Service Startup Ordering

### PostgreSQL Container (postgres)

The PostgreSQL 17 Alpine container is configured with:
- **Image**: `postgres:17-alpine` — lightweight Alpine Linux base
- **Credentials**: User `app`, password `app`, database `app`
- **Healthcheck**: Uses `pg_isready` to verify the database is accepting connections
  - Checks every 5 seconds with a 5-second timeout
  - Requires 5 consecutive successful checks before the service is considered healthy
- **Persistence**: Data is stored in the `postgres_data` named volume

### Migrate Service Startup Ordering

The migrate service depends on PostgreSQL being healthy before it starts:

```yaml
depends_on:
  postgres:
    condition: service_healthy
```

This ensures:
1. PostgreSQL container is running
2. The database is accepting connections (verified by healthcheck)
3. Only then does the migrate service start and run migrations

### API Service Startup Ordering

The API service depends on the migrate service completing successfully:

```yaml
depends_on:
  migrate:
    condition: service_completed_successfully
```

This ensures:
1. All database migrations have been applied
2. The schema is ready for the API to use
3. The API starts only after the database is fully initialized

### Startup Sequence

When `docker compose up` runs, the services start in this order:

1. **postgres** — starts and waits for healthcheck to pass
2. **migrate** — waits for postgres to be healthy, then runs migrations
3. **api** — waits for migrate to complete successfully, then starts
4. **web** — waits for api to be ready, then starts

This dependency chain ensures the database is fully initialized before any application code attempts to connect to it.
