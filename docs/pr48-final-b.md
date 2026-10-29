# API & Database Onboarding Notes

1. The API is an Express 5 application running on Node.js 22, listening on port 3001 (internal only — not exposed outside the Docker network).
2. All external traffic reaches the API through the Next.js web tier on port 3000.
3. `GET /health` — health check endpoint.
4. `GET /tasks` — returns all tasks.
5. `POST /tasks` — creates a task; request body: `{ "title": "..." }`.
6. `PATCH /tasks/:id` — updates a task; accepts `{ "completed": true }` or `{ "title": "..." }`.
7. The database is PostgreSQL 17, managed by Docker Compose locally or by Cloud SQL on GCP.
8. Migrations use [node-pg-migrate](https://salsita.github.io/node-pg-migrate/) and live in `src/db/migrations/`.
9. Apply migrations manually: `DATABASE_URL=postgres://app:app@localhost:5432/app npx node-pg-migrate up` (inside `src/db/`).
10. When using Docker Compose, the `migrate` service runs `node-pg-migrate up` automatically on startup before the API starts.
