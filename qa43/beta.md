# Three-Tier Architecture Overview

This repository demonstrates a **three-tier web application** architecture, a foundational pattern for scalable, maintainable applications.

## The Three Tiers

```
Browser → Web Tier → API Tier → Database Tier
```

### 1. **Web Tier (Frontend)**
- **Technology**: Next.js 16, React 19, Tailwind CSS
- **Location**: `src/web/`
- **Port**: 3000 (exposed to host)
- **Responsibility**: Renders the user interface, handles client-side interactions, and communicates with the API tier
- **Example**: The task manager UI where users create and toggle tasks

### 2. **API Tier (Backend)**
- **Technology**: Express 5, Node.js 22
- **Location**: `src/api/`
- **Port**: 3001 (internal only, not exposed outside Docker network)
- **Responsibility**: Processes business logic, validates requests, and manages database operations
- **Example**: REST endpoints like `GET /tasks`, `POST /tasks`, `PATCH /tasks/:id`

### 3. **Database Tier (Data)**
- **Technology**: PostgreSQL 17
- **Location**: Managed by Docker / Cloud SQL (GCP)
- **Responsibility**: Persists data and ensures data integrity
- **Example**: `tasks` table storing task records with id, title, and completed status

## Communication Flow

1. **User Action** → Browser makes HTTP request to web tier
2. **Web Tier** → Next.js server-side action calls the API tier via `http://api:3001`
3. **API Tier** → Express handler validates input and queries the database
4. **Database Tier** → PostgreSQL executes the query and returns results
5. **Response** → Data flows back through API → Web → Browser

## Key Architectural Benefits

- **Separation of Concerns**: Each tier has a single responsibility
- **Scalability**: Tiers can be scaled independently (e.g., multiple API instances behind a load balancer)
- **Security**: The API tier is internal-only; external traffic flows through the web tier
- **Testability**: Each tier can be tested in isolation
- **Deployment Flexibility**: Tiers can be deployed to different infrastructure (Docker Compose locally, Cloud Run on GCP)

## Local Development

All three tiers run in Docker containers via `docker-compose.yml`:

```bash
docker compose up --build
```

This orchestrates:
1. **postgres** service (database)
2. **migrate** service (applies schema migrations, then exits)
3. **api** service (backend)
4. **web** service (frontend)

Services communicate via Docker's internal network using service names (e.g., `http://api:3001`).

## Production Deployment

The `src/infrastructure/` directory contains Terraform that provisions the same three-tier architecture on Google Cloud Platform:

- **Web Tier**: Cloud Run service
- **API Tier**: Cloud Run service
- **Database Tier**: Cloud SQL PostgreSQL instance
- **Networking**: VPC, subnet, and private IP connectivity

This demonstrates that the three-tier pattern is infrastructure-agnostic—the same application logic runs locally and in production.
