# Database & Docker Architecture

This document describes MigrationGuard's database configuration, local Docker services, and the crucial separation between application storage and disposable test databases.

---

## 1. Two Distinct Database Roles

MigrationGuard interacts with PostgreSQL in two completely different ways:

```text
+------------------------------------------------------------------+
| MigrationGuard Application                                      |
+------------------------------------------------------------------+
          |                                       |
          v                                       v
+-----------------------+              +-----------------------+
| Application Database  |              | Disposable Test DB    |
| (Persistent)          |              | (Ephemeral / Sandbox) |
+-----------------------+              +-----------------------+
| Stores:               |              | Purpose:              |
| - Migration history   |              | - Executes submitted  |
| - Safety reports      |              |   user migrations     |
| - Analysis metadata   |              | - Measures timing     |
|                       |              | - Discarded / wiped   |
+-----------------------+              +-----------------------+
```

### Application Database
- Defined by `DATABASE_URL` in `.env`.
- Intended for storing saved migration analysis reports and history.
- Never runs untrusted user-submitted SQL migrations.

### Disposable Test Database
- Defined by `POSTGRES_TEST_IMAGE` (`postgres:16-alpine`).
- Spun up in an isolated, sandboxed environment (Docker container).
- Executes user migrations to test execution viability, syntax errors, and locking.
- Terminated and removed immediately after execution test finishes.

---

## 2. Local Docker Setup for Application Database

A `docker-compose.yml` file is provided in the repository root to start a local PostgreSQL 16 container for development.

### Starting PostgreSQL
```bash
docker compose up -d
```

### Checking Status
```bash
docker compose ps
```

### Stopping PostgreSQL
```bash
docker compose down
```

### Resetting Data
To stop the database and erase the persistent volume:
```bash
docker compose down -v
```

---

## 3. Connection Parameters

| Parameter | Default Value | Notes |
| :--- | :--- | :--- |
| **Host** | `localhost` | Container mapped to port 5432 |
| **Port** | `5432` | Standard PostgreSQL port |
| **User** | `migrationguard` | Configured in `docker-compose.yml` |
| **Password** | `migrationguard` | For local development only |
| **Database** | `migrationguard` | Default database |
| **URL** | `postgresql://migrationguard:migrationguard@localhost:5432/migrationguard` | Matching `.env.example` |

---

## 4. Production Safety Guardrail

MigrationGuard strictly enforces that test migrations are **never** executed against real databases:
- The server checks whether database connection targets appear to be remote/production hosts.
- Arbitrary SQL execution is confined solely to ephemeral containers with strict timeouts (`MIGRATION_TIMEOUT_MS=30000`) and size limits (`MAX_MIGRATION_SIZE_BYTES=102400`).
