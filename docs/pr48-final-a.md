# Frontend Onboarding Notes

1. The frontend is a Next.js 16 / React 19 / Tailwind CSS application located in `src/web/`.
2. It runs on port 3000 and is exposed to the host; the API (port 3001) is internal only.
3. Start the full stack (including the frontend) with `docker compose up --build`.
4. Once running, open the app at [http://localhost:3000](http://localhost:3000).
5. The app is a simple task manager (to-do list) that demonstrates three-tier communication.
6. The request path is: Browser → Web (Next.js :3000) → API (Express :3001) → PostgreSQL.
7. Frontend source uses the Next.js App Router; pages and components live in `src/web/app/`.
8. The frontend Docker image is built from `src/web/Dockerfile`.
9. To rebuild after code changes, run `docker compose up --build` again.
10. For GCP deployment, the web frontend runs on Cloud Run; `terraform output web_url` gives the public URL.
