# PR33: Three-Tier Architecture Reference

## Overview

This document provides a reference for the three-tier architecture of the application, as documented in README.md. It serves as a guide for understanding how changes flow across the layers.

## Architecture Layers

```
Browser → Web (Next.js :3000) → API (Express :3001) → PostgreSQL
```

### Frontend (Web Tier)

- **Technology**: Next.js 16, React 19, Tailwind CSS
- **Location**: `src/web/`
- **Port**: 3000 (exposed to host)
- **Role**: Serves the user interface and handles client-side interactions

### API Tier

- **Technology**: Express 5, Node.js 22
- **Location**: `src/api/`
- **Port**: 3001 (internal only, not exposed outside Docker network)
- **Role**: Provides REST endpoints for the frontend to interact with the database

### Database Tier

- **Technology**: PostgreSQL 17
- **Location**: Managed by Docker Compose locally, Cloud SQL on GCP
- **Role**: Persists application data

### Migrations

- **Technology**: node-pg-migrate
- **Location**: `src/db/migrations/`
- **Role**: Manages database schema changes in a version-controlled, append-only manner

## Communication Flow

1. **Browser** makes requests to the **Web tier** (Next.js on port 3000)
2. **Web tier** makes requests to the **API tier** (Express on port 3001, internal only)
3. **API tier** queries the **Database tier** (PostgreSQL)
4. Results flow back through each layer to the browser

## Running Locally

Docker Compose orchestrates all services in dependency order:

1. `postgres` — starts first, waits until healthy
2. `migrate` — applies schema migrations, then exits
3. `api` — starts after migrations complete
4. `web` — starts after API is ready

See README.md for full setup instructions.

## References

- README.md — Complete architecture overview and deployment guide
- `src/web/` — Frontend source code
- `src/api/` — API source code
- `src/db/migrations/` — Database schema migrations
