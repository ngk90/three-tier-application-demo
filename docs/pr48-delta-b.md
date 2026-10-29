# API & Database Tier — Onboarding Note

> Drawn from the README, `src/api/`, `src/db/`, and `docker-compose.yml`.  
> Scope: factual reference for engineers joining the project who need to understand the API and database tiers quickly.

---

## 1. What the API Does

The API tier is a lightweight **Express 5** HTTP server (Node.js 22) that sits between the Next.js web tier and the PostgreSQL database. It is the only service that talks to the database; the web tier never connects to Postgres directly. All external traffic reaches the API through the web tier — the API port is not published outside the Docker Compose network.

The API exposes four endpoints:

| Method | Path | Description | Success status |
|--------|------|-------------|----------------|
| `GET` | `/health` | Liveness check | 200 `{ "status": "ok" }` |
| `GET` | `/tasks` | Return all tasks ordered by `created_at ASC` | 200 — array of task rows |
| `POST` | `/tasks` | Create a new task | 201 — the created task row |
| `PATCH` | `/tasks/:id` | Update `completed` and/or `title` on an existing task | 200 — the updated task row |

### Request / response shapes

**POST /tasks**  
Request body: `{ "title": "<string>" }`  
Validation: `title` is required, must be a non-empty string after trimming whitespace.  
Error: `400 { "error": "title is required" }` when validation fails.

**PATCH /tasks/:id**  
Request body: `{ "completed": <boolean>, "title": "<string>" }` — both fields are optional.  
Behaviour: fields not supplied in the body are preserved from the current database row; `title` is trimmed before saving.  
Error: `404 { "error": "Not found" }` when the `id` does not exist.

### Middleware

- `express.json()` — parses JSON request bodies; no other middleware is registered.

---

## 2. How the API Connects to the Database

Connection is managed in **`src/api/db.js`** using the `pg` library's `Pool` class:

```js
// src/api/db.js
import pg from 'pg';
const { Pool } = pg;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

The pool is imported by `src/api/index.js` and used directly in route handlers via parameterised queries (e.g. `pool.query('SELECT * FROM tasks ORDER BY created_at ASC')`).

### Environment variables consumed by the API

| Variable | Local default (Docker Compose) | Purpose |
|----------|-------------------------------|---------|
| `DATABASE_URL` | `postgres://app:app@postgres:5432/app` | Full connection string for the `pg` pool |
| `PORT` | `3001` | Port the Express server listens on |

In production (Google Cloud Run) the `DATABASE_URL` is injected from **GCP Secret Manager** via Terraform.

---

## 3. Database Schema

The schema is built by two **node-pg-migrate** migrations applied in timestamp order:

### Migration 1 — `1718500000000_initial-schema.js`

Creates the `users` table (present for schema completeness; not used by current API endpoints):

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | serial | primary key |
| `email` | varchar(255) | not null, unique |
| `created_at` | timestamp | not null, default `now()` |

### Migration 2 — `1718500001000_create-tasks.js`

Creates the `tasks` table (the active domain table):

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | serial | primary key |
| `title` | varchar(500) | not null |
| `completed` | boolean | not null, default `false` |
| `created_at` | timestamp | not null, default `now()` |

---

## 4. Migration Approach

- **Tool:** [node-pg-migrate](https://salsita.github.io/node-pg-migrate/) v8.0.4, declared in `src/db/package.json`.
- **Migration files:** `src/db/migrations/` — named `<unix-timestamp-ms>_<description>.js`.
- **Append-only rule:** existing migration files must never be edited; all schema changes require a new migration file.
- **Apply:** `npm run migrate` (runs `npx node-pg-migrate up`) or `npx node-pg-migrate down` to roll back.
- **Automatic application in Docker Compose:** the `migrate` service builds from `src/db/`, depends on the `postgres` service being healthy (`service_healthy`), runs migrations on startup, and exits. The `api` service depends on `migrate` completing successfully (`service_completed_successfully`) before it starts.

### Docker Compose service dependency chain

```
postgres (healthy) → migrate (completed) → api (running) → web (running)
```

### PostgreSQL service environment (local)

| Variable | Value |
|----------|-------|
| `POSTGRES_DB` | `app` |
| `POSTGRES_USER` | `app` |
| `POSTGRES_PASSWORD` | `app` |

Data is persisted in the named Docker volume `postgres_data` mounted at `/var/lib/postgresql/data`.  
In production the database is **Cloud SQL (PostgreSQL 17)** provisioned by Terraform in `src/infrastructure/`.

---

## 5. Key Conventions

1. **Migrations are append-only.** Never edit an existing migration file; always create a new one with a fresh timestamp prefix.
2. **The API is internal.** Port 3001 is not published to the host in Docker Compose; all external traffic flows through the web tier at port 3000.
3. **`DATABASE_URL` is the single config boundary.** The connection string is passed via environment variable — no hardcoded credentials anywhere in application code.
4. **Node 22 / PostgreSQL 17.** All Dockerfiles and dependencies target these versions; match them in any new work.
5. **Parameterised queries only.** All SQL in `src/api/index.js` uses `$1`, `$2`, … placeholders via `pg`'s `pool.query()` — no string interpolation.
6. **Express 5.** The API uses Express 5 (`^5.2.1`), not Express 4; be aware of breaking-change differences (e.g. async error propagation).
