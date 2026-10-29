# Frontend Onboarding Notes

1. The frontend uses Next.js 16, React 19, and Tailwind CSS.
2. Frontend source code lives in `src/web/`, with App Router pages and components under `src/web/app/`.
3. The Next.js frontend is containerised via `src/web/Dockerfile`.
4. The web service runs on port 3000 and is the only tier exposed to the host.
5. Traffic flows: Browser → Web (Next.js :3000) → API (Express :3001) → PostgreSQL.
6. Start the full stack locally with `docker compose up --build`; the frontend is then available at http://localhost:3000.
7. The API is internal only and not directly reachable from the browser; all external traffic goes through the web tier.
8. After any code change, rebuild with `docker compose up --build`.
9. For GCP deployment, the web frontend is deployed as a Cloud Run service using the `web_image` variable.
10. After a Terraform apply, `terraform output web_url` returns the public URL for the frontend.
