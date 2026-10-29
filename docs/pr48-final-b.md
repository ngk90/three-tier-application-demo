# API & Database Onboarding Notes

1. **Tech stack**: API is Express 5 on Node.js 22 (`src/api/`); database is PostgreSQL 17 managed by Docker Compose or Cloud SQL.
2. **Run locally**: `docker compose up --build` starts postgres, runs migrations, then launches the API on port 3001 and the web frontend on port 3000.
3. **Migrations**: Managed by `node-pg-migrate`; files live in `src/db/migrations/`. Apply manually with `DATABASE_URL=postgres://app:app@localhost:5432/app npx node-pg-migrate up` or automatically via the `migrate` Docker Compose service.
4. **API access**: The API is internal to the Docker network (not exposed to the host); reach it through the web container or by temporarily mapping port 3001.
5. **Endpoints**: `GET /health` (health check), `GET /tasks` (list tasks), `POST /tasks` (create task, body `{ "title": "..." }`), `PATCH /tasks/:id` (update task, body `{ "completed": true }` or `{ "title": "..." }`).
6. **Database connection**: `src/api/db.js` holds the PostgreSQL connection pool; the connection string is passed via the `DATABASE_URL` environment variable.
7. **Rollback**: Roll back the last migration with `DATABASE_URL=... npx node-pg-migrate down`; migrations are append-only — never edit an existing migration file.
8. **Teardown**: `docker compose down` stops containers but keeps data; `docker compose down -v` also deletes the `postgres_data` volume.
