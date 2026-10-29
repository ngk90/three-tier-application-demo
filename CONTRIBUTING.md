# Contributing to example-three-tier-application

## Getting started

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin).

```bash
# Clone the repository
git clone https://github.com/ngk90/three-tier-application-demo.git
cd three-tier-application-demo

# Install API dependencies (for local development / running tests outside Docker)
cd src/api && npm install && cd ../..

# Install web dependencies (for local development / linting outside Docker)
cd src/web && npm install && cd ../..

# Start the full stack
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000) once all services are healthy.

To stop the stack:

```bash
docker compose down        # keeps the postgres_data volume
docker compose down -v     # removes all data
```

---

## Architecture overview

```
Browser → Web (Next.js :3000) → API (Express :3001) → PostgreSQL 17
```

| Tier | Technology | Source |
|------|-----------|--------|
| Web | Next.js 16, React 19, Tailwind CSS | `src/web/` |
| API | Express 5, Node.js 22 | `src/api/` |
| Database | PostgreSQL 17, node-pg-migrate | `src/db/` |
| Infrastructure | Terraform (GCP) | `src/infrastructure/` |

**Web tier** — Next.js app served on port 3000. Communicates with the API via server-side fetch calls using the `API_URL` environment variable. This is the only tier exposed to the host.

**API tier** — Express REST API on port 3001. Handles all business logic and database access. It is only reachable from within the Docker network; external traffic must go through the web tier.

**Database tier** — PostgreSQL 17 managed by Docker Compose locally and by Cloud SQL on GCP. Schema is managed exclusively through node-pg-migrate migration files in `src/db/migrations/`.

---

## Project conventions

### Migrations are append-only
Never edit an existing migration file. Always create a new migration file for schema changes:

```bash
# Migration filenames use a timestamp prefix
src/db/migrations/1718500001000_create-tasks.js
```

### The API is internal
The API service is not exposed outside the Docker network (`expose` rather than `ports` in `docker-compose.yml`). All client-facing traffic routes through the web tier.

### Environment variables are the config boundary
All configuration (connection strings, ports, service URLs) is passed via environment variables. No values are hardcoded in source files. See `docker-compose.yml` for the full set of variables used locally.

### Node 22 / PostgreSQL 17
Match these versions in any new Dockerfiles or when adding dependencies. The API and web services both target Node 22.

---

## Running tests

The API has a Jest + Supertest test suite. Run it from the `src/api` directory:

```bash
cd src/api
npm test
```

The web tier uses ESLint for static analysis:

```bash
cd src/web
npm run lint
```

There are no automated tests for the database migrations or infrastructure code.

---

## Submitting a pull request

1. Create a feature branch from the integration branch (not `main`):
   ```bash
   git checkout -b my-feature
   ```
2. Make your changes. Follow the conventions above — one migration per schema change, no hardcoded config values.
3. Run the API tests (`cd src/api && npm test`) and lint (`cd src/web && npm run lint`) before pushing.
4. Push your branch and open a pull request against the integration branch.
5. Describe what changed and why in the PR description. Reference any related issues.
