# MigrationGuard build progress

## Project objective

Build an understandable, portfolio-quality developer tool that analyzes PostgreSQL migrations, optionally tests them in disposable Docker databases, and reports only evidence it can support.

## Current development status

- **Current focus**: Completing the Day 1–2 Foundation with full interview-grade depth.
- **Active development day**: Day 2 Foundation (Finalizing PostgreSQL client & schema) / Day 3 SQL Analysis.

---

## Detailed Milestone Status

### ✅ Completed Milestones

#### Day 1, Milestone 1 — Architecture and safety plan
- Inspected the workspace and toolchain (Node.js `v24.17.0`, Git `2.54.0`).
- Documented application architecture, security boundaries, visual palette, and technical risks in `docs/ARCHITECTURE.md`.
- Added `.env.example` template and `.gitignore` rules.
- Added project `README.md`.

#### Day 1, Milestone 2 — Next.js application scaffold
- Created Next.js 16 application with React 19 and strict TypeScript.
- Configured ESLint 9, root layout, and package scripts (`dev`, `build`, `start`, `lint`, `typecheck`, `test`).
- Pinned `pnpm@10.26.1` via Corepack with committed `pnpm-lock.yaml`.
- Created `docs/DEPENDENCIES.md` inventory documenting every package, purpose, and lifecycle commands.

#### Day 1, Milestone 3 — Migration editor and design system
- Built the responsive migration review workspace in `src/components/migration-editor.tsx`.
- Established warm developer design system tokens in `src/app/globals.css` (`#f5f2ec` canvas, `#1c1c1a` ink, `#0f766e` teal accent).
- Added character counter, draft state indicators, and keyboard skip-navigation.

#### Day 2, Milestone 1 — Backend API foundation & Docker configuration
- Added `docker-compose.yml` for local PostgreSQL 16 containerization with health checks and volume persistence.
- Added `docs/DATABASE.md` documenting the separation between persistent application storage and disposable test databases.
- Added `src/lib/config.ts` providing type-safe runtime environment validation and production host guardrails (`isLikelyProductionUrl`).
- Added `src/app/api/health/route.ts` providing a lightweight system status endpoint.
- Added `src/app/api/analyze/route.ts` providing the server-side migration analysis endpoint with JSON validation and payload size protection.
- Added automated unit tests in `tests/config.test.ts` and `tests/api.test.ts`.

#### Day 2, Milestone 2 — Full-stack integration, UX states & Approach page
- Connected `src/components/migration-editor.tsx` to `/api/analyze` using asynchronous `fetch`.
- Added loading state (`isAnalyzing`), disabled button states, and accessible `.alert-error` banners for API error handling.
- Eliminated the homepage 404 broken link by creating a dedicated, responsive Next.js page at `src/app/approach/page.tsx`.

#### Day 3, Milestone 1 & 2 — Deterministic SQL analysis rules & unit testing
- Built client-side & server-side deterministic analysis engine in `src/lib/analysis.ts`.
- Rules detect 6 core risk patterns: `DROP TABLE`, `DROP COLUMN`, `ALTER COLUMN TYPE`, `NOT NULL` additions, unvalidated constraints, and non-concurrent indexes.
- Added comment masking (`--`, `/* */`) and string literal masking.
- Fixed line-extraction bug in `evidenceAt` to capture full statement lines.
- Set up zero-dependency Node.js test runner (`node:test` + `--experimental-strip-types`) with 19 passing tests in `tests/analysis.test.ts`.

---

### ⏳ Current Pending Milestone

#### Day 2, Final Foundation Milestone — PostgreSQL Client Driver & Schema
- Install `pg` (Node PostgreSQL driver) and `@types/pg` dev dependency.
- Create `src/lib/db.ts` connection pool with query helpers and graceful connection fallback when DB is offline.
- Create `src/db/schema.sql` defining the `migration_reviews` table for storing analysis results.
- Add database health check integration into `GET /api/health`.
- Add unit tests for database configuration and connection handling.

---

## Important architecture decisions

- **Three Pillars**: Strict separation between Static Findings, Execution Observations, and AI Guidance.
- **Monolithic Next.js Structure**: Keep UI, server endpoints, and analysis rules in one repository for interview clarity.
- **Safe Database Boundaries**: Untrusted SQL is never executed against application or production databases; testing will target only disposable Docker containers.
- **Zero-Dependency Testing**: Use Node.js built-in `node:test` and `node:assert/strict` with native TypeScript strip-types (`--experimental-strip-types`).
- **Production Host Guardrail**: Server rejects database connection attempts to external/cloud hosts (`isLikelyProductionUrl`).

## Technologies and dependencies

- **Framework**: Next.js 16.4.6, React 19.3.1, React DOM 19.3.1
- **Language**: TypeScript 5.9.3 (strict mode, ES2022)
- **Package Manager**: pnpm 10.26.1 via Corepack
- **Testing**: Node.js built-in test runner (`node:test`, `node:assert/strict`)
- **Linting**: ESLint 9.39.5 (`eslint-config-next`)
- **Infrastructure**: Docker Compose (`postgres:16-alpine`)

## Key files and responsibilities

| File | Responsibility |
| --- | --- |
| `AGENTS.md` | Master project requirements, workflow rules, architecture standards, and schedule. |
| `.progress/BUILD_PROGRESS.md` | Temporary build progress and milestone tracker across sessions. |
| `docker-compose.yml` | Local PostgreSQL 16 container definition with health check and volume. |
| `docs/ARCHITECTURE.md` | Application structure, safety model, visual palette, and technical risks. |
| `docs/DATABASE.md` | Database and Docker operational guide and safety boundaries. |
| `docs/DEPENDENCIES.md` | Dependency inventory and test runner documentation. |
| `.env.example` | Safe local environment-variable contract. |
| `README.md` | Project overview, verification commands, and documentation entry point. |
| `package.json` | Project scripts, package configuration, and package-manager version. |
| `src/app/` | Next.js pages, API route handlers, layout, and responsive styles. |
| `src/app/approach/page.tsx` | Dedicated approach and architecture explanation page. |
| `src/components/migration-editor.tsx` | Interactive, accessible SQL editor connected to backend API. |
| `src/lib/config.ts` | Type-safe runtime environment configuration and safety checks. |
| `src/lib/analysis.ts` | Deterministic migration risk rules, evidence extraction, and finding types. |
| `tests/analysis.test.ts` | Automated unit test suite verifying deterministic SQL risk analysis. |
| `tests/config.test.ts` | Automated tests for environment variable parsing and production URL checks. |
| `tests/api.test.ts` | Automated integration tests for `/api/health` and `/api/analyze` routes. |

## Tests executed and actual results

- `corepack pnpm run test`: 19/19 tests passing across 3 suites in ~400ms.
- `corepack pnpm run typecheck`: Passed with 0 errors (`tsc --noEmit`).
- `corepack pnpm run build`: Production build succeeded (`/`, `/_not-found`, `/approach`, `/api/analyze`, `/api/health`).

## Next recommended action

Implement Day 2 Final Milestone: Install `pg` and `@types/pg`, build `src/lib/db.ts` with connection pooling, and create `src/db/schema.sql`.
