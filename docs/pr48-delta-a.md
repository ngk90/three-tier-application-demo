# Frontend (Web Tier) Onboarding Note

> **PR48 delta parallel onboarding verification — agent A**
> Source: `README.md`, `docker-compose.yml`, `src/web/` (Dockerfile, `next.config.ts`, `app/actions.ts`, `AGENTS.md`)

---

## What the frontend is

The web tier is a **Next.js 16 / React 19** application written in **TypeScript 5**, styled with **Tailwind CSS 4**.  
It lives in `src/web/` and implements the browser-facing layer of a simple task-manager (to-do list).  
It uses the **App Router** (`src/web/app/`) and Next.js **Server Actions** (`'use server'`) for all data mutations — there is no separate client-side API layer.

---

## How it is built and run

### Local development (inside Docker Compose — the normal path)

```bash
# from the repo root
docker compose up --build
```

The `web` service is the fourth service to start, after `postgres`, `migrate`, and `api`.  
It is available at **http://localhost:3000** once running.

### npm scripts (for standalone / outside Docker)

| Command | Effect |
|---------|--------|
| `npm run dev` | Next.js development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint 9 |

### Docker build (multi-stage, `src/web/Dockerfile`)

| Stage | Base image | What it does |
|-------|-----------|--------------|
| `deps` | `node:22-alpine` | `npm ci` — installs dependencies |
| `builder` | `node:22-alpine` | `npm run build` — produces `.next/standalone` |
| `runner` | `node:22-alpine` | Copies the standalone output; runs `node server.js` |

`next.config.ts` sets `output: "standalone"` so the runner stage is self-contained (no `node_modules` copy needed at runtime).  
`NODE_ENV=production` is set in the runner stage.

---

## How it connects to the other tiers

```
Browser → Web (Next.js :3000) → API (Express :3001) → PostgreSQL :5432
```

The frontend **never talks to the database directly**.  
All data access goes through the Express API tier.

### Environment variable: `API_URL`

| Context | Value |
|---------|-------|
| Docker Compose | `http://api:3001` (internal Docker DNS) |
| Fallback / local dev | `http://localhost:3001` |

`API_URL` is set in `docker-compose.yml` and consumed in `src/web/app/actions.ts`:

```ts
const API_URL = process.env.API_URL || 'http://localhost:3001';
```

### API endpoints called by the frontend

| Server Action | Method | Path | Payload |
|---------------|--------|------|---------|
| `getTasks()` | GET | `/tasks` | — (returns `Task[]`) |
| `createTask(formData)` | POST | `/tasks` | `{ "title": "..." }` |
| `toggleTask(id, completed)` | PATCH | `/tasks/:id` | `{ "completed": true\|false }` |

All requests set `Content-Type: application/json`.  
`getTasks` uses `cache: 'no-store'` (always fresh).  
`createTask` and `toggleTask` call `revalidatePath('/')` after the fetch to invalidate the Next.js page cache.

### `Task` type (shared shape between frontend and API)

```ts
type Task = {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
};
```

### Docker Compose service definition (summary)

```yaml
web:
  build:
    context: ./src/web
  environment:
    PORT: 3000
    API_URL: http://api:3001
  ports:
    - "3000:3000"
  depends_on:
    - api
```

The `api` service is only `expose`d (not `ports`-mapped), so the API is **not reachable from the host** — all external traffic enters through the web tier on port 3000.

---

## Key conventions

| Convention | Detail |
|------------|--------|
| **Node version** | Node 22 (Alpine) — match this in any new Dockerfiles or dependencies |
| **No direct DB access** | The web tier must never hold a `DATABASE_URL`; it calls the API only |
| **Environment variables as config boundary** | Connection strings, ports, and URLs are passed via env vars — no hardcoded values |
| **Server Actions for mutations** | Data writes use Next.js `'use server'` actions, not a client-side fetch layer |
| **App Router** | Pages and layouts live under `src/web/app/`; the entry page is `app/page.tsx` |
| **Standalone output** | `output: "standalone"` in `next.config.ts` — required for the Docker runner stage |
| **API is internal** | The API is not exposed outside the Docker network; all external traffic goes through the web tier |
| **Next.js version awareness** | `src/web/AGENTS.md` notes that this version may have breaking changes vs. older training data — read `node_modules/next/dist/docs/` before writing Next.js-specific code |
