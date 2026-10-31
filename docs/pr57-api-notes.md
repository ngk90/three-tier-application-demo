# PR57: API Endpoints Documentation

## GET /health

**Response:**
```json
{
  "status": "ok"
}
```

**Status Code:** 200

**Purpose:** Health check endpoint. Returns a simple JSON object indicating the API is running and healthy.

---

## GET /tasks

**Response:**
```json
[
  {
    "id": 1,
    "title": "Sample task",
    "completed": false,
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "title": "Another task",
    "completed": true,
    "created_at": "2024-01-15T11:00:00.000Z"
  }
]
```

**Status Code:** 200

**Purpose:** Retrieves all tasks from the database, ordered by creation time (oldest first).

**Query Details:**
- Executes: `SELECT * FROM tasks ORDER BY created_at ASC`
- Returns an array of task objects
- Each task includes: `id`, `title`, `completed` status, and `created_at` timestamp
- Returns an empty array if no tasks exist

---

## Notes

- Both endpoints are read-only (GET methods)
- The API also provides POST /tasks (create) and PATCH /tasks/:id (update) endpoints (not documented here)
- All database queries use parameterized statements to prevent SQL injection
- The API runs on port 3001 (or the PORT environment variable if set)
