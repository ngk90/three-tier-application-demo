# PR47 Delivery: Three-Step Request Flow

This document describes the concise request flow through the three-tier application.

## Request Flow

1. **Browser → Web Tier (Nginx)**
   The browser sends an HTTP request to the Nginx web tier. Static assets are served directly; API calls are reverse-proxied to the API service on the internal Docker network.

2. **Web Tier → API (Node/Express)**
   Nginx forwards `/api/*` requests to the Express API. The API validates input, applies business logic, and queries the database using `node-postgres` (`pg`).

3. **API → PostgreSQL**
   The API executes parameterised SQL queries against the PostgreSQL database. Results are returned up the chain: database → API (JSON) → Nginx → browser.

<!-- PR47_DELIVERY_VERIFIED -->
