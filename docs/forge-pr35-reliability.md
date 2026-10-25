# PR35 Reliability Architecture Note

## Architecture Overview

This three-tier application follows a classic layered architecture:

**Request Path:** Browser → Web (Next.js :3000) → API (Express :3001) → PostgreSQL

### Technology Stack

| Layer | Technology | Entry Point |
|-------|-----------|-------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS | `src/web/app/page.tsx` |
| **API** | Express 5, Node.js 22 | `src/api/index.js` |
| **Database** | PostgreSQL 17 | Managed by Docker / Cloud SQL |

### Frontend (`src/web/`)

- **Framework:** Next.js 16 with React 19
- **Entry Point:** `src/web/app/page.tsx` (App Router)
- **Communication:** Server actions (`getTasks`, `createTask`, `toggleTask`) call the API at `http://api:3001`
- **Dependencies:** next, react, react-dom, tailwindcss

### API (`src/api/`)

- **Framework:** Express 5 on Node.js 22
- **Entry Point:** `src/api/index.js`
- **Endpoints:**
  - `GET /health` — Health check
  - `GET /tasks` — List all tasks
  - `POST /tasks` — Create a task (requires `title`)
  - `PATCH /tasks/:id` — Update a task (`completed` or `title`)
- **Database:** PostgreSQL connection pool via `src/api/db.js`
- **Dependencies:** express, pg

### Database

- **Engine:** PostgreSQL 17
- **Migrations:** `src/db/migrations/` (node-pg-migrate)
- **Schema:** Tasks table with `id`, `title`, `completed`, `created_at` columns

### Local Deployment (docker-compose.yml)

Four services start in order:
1. **postgres** — PostgreSQL 17, waits until healthy
2. **migrate** — Runs schema migrations, then exits
3. **api** — Express API on port 3001 (internal only)
4. **web** — Next.js frontend on port 3000 (exposed to host)

### GCP Deployment (src/infrastructure/)

Terraform provisions:
- VPC network with private Cloud SQL PostgreSQL 17 instance
- Cloud Run services for API and web frontend
- Secret Manager for database URL
- Service accounts and IAM bindings

---

**Marker:** PR35-RELIABILITY-C90B6EA
