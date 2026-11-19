# MigrationGuard build progress

## Project objective

Build an understandable, portfolio-quality developer tool that analyzes PostgreSQL migrations, optionally tests them in disposable Docker databases, and reports only evidence it can support.

## Current development day

Day 3 of 16 — SQL analysis phase.

## Completed milestones

### Day 1, Milestone 1 — Architecture and safety plan

- Inspected the workspace: `MigrationGuard` was empty.
- Checked local tools: Node.js `v24.17.0` and Git `2.54.0` are available. `npm` is blocked by the current PowerShell execution policy, while Docker and `psql` are not installed or unavailable on `PATH`.
- Documented the application architecture, security boundaries, visual palette, initial SQL-risk rules, risks, and mitigations.
- Added a safe environment-variable template and Git ignore rules.
- Added an initial README that accurately describes the current state.

### Day 1, Milestone 2 - Next.js application scaffold

- Created the Next.js 16 application shell with React 19 and strict TypeScript.
- Added root layout metadata, a temporary foundation page, global styles, ESLint, TypeScript configuration, and package scripts.
- Added `pnpm-lock.yaml` and pinned pnpm `10.26.1` through Corepack for reproducible dependency installation.
- Updated setup and verification instructions in the README.
- Added a permanent dependency inventory with the purpose, location, inspection, update, and removal commands for every direct package.
- Fixed a local npm dependency-extraction failure by using pnpm, whose linked dependency layout completed successfully on this Windows environment.

### Day 1, Milestone 3 - Migration editor and design system

- Replaced the placeholder page with a responsive migration-review workspace.
- Added an editable SQL textarea, character-limit feedback, working clear and restore-sample actions, and keyboard skip navigation.
- Introduced reusable CSS design tokens for the documented warm neutral, charcoal, slate, and teal palette.
- Clearly marked analysis as unavailable until deterministic SQL rules are implemented; no findings or measurements are simulated.
- Added an explanatory review-boundary panel so users understand the distinction between future static findings, test observations, and AI guidance.

### Day 2, Milestone 4 — Backend foundation, environment config, and Docker setup

- Added `docker-compose.yml` for local PostgreSQL 16 containerization with health checks and volume persistence.
- Added `docs/DATABASE.md` documenting the critical separation between persistent application storage and disposable test databases.
- Added `src/lib/config.ts` providing type-safe runtime environment validation and production host guardrails (`isLikelyProductionUrl`).
- Added `src/app/api/health/route.ts` providing a lightweight system status endpoint.
- Added `src/app/api/analyze/route.ts` providing the server-side migration analysis endpoint with JSON validation and payload size protection.
- Added automated unit tests in `tests/config.test.ts` and `tests/api.test.ts` (all passing).

### Day 3, SQL analysis — First deterministic rule set

- Added client-side static analysis without executing submitted SQL.
- Added rules for table drops, column drops, column type changes, `NOT NULL`
  enforcement, constraints added without `NOT VALID`, and non-concurrent indexes.
- Added severity, line evidence, explanation, and recommendation to each finding.
- Connected the Analyze button to the findings panel.
- Reset analysis results when the draft is cleared or restored.

### Day 3, Milestone 2 — Automated unit tests for SQL analysis

- Added a zero-dependency test runner using Node.js's built-in `node:test` and `node:assert/strict` with native TypeScript strip-types (`--experimental-strip-types`).
- Added comprehensive unit tests in `tests/analysis.test.ts` covering 13 scenarios:
  - Empty or whitespace-only inputs.
  - Safe migrations without false positives (e.g. `CREATE TABLE`, `CREATE INDEX CONCURRENTLY`, `ADD COLUMN`, `ADD CONSTRAINT ... NOT VALID`).
  - Risk detection for `DROP TABLE`, `DROP COLUMN`, `ALTER COLUMN TYPE`, `NOT NULL`, unvalidated constraints, and non-concurrent indexes.
  - Single-line (`--`) and multi-line (`/* */`) SQL comments containing risky keywords.
  - String literals containing dangerous keywords (e.g. audit logs).
  - Multi-statement migrations with proper line numbers and ordering.
- Discovered and resolved an evidence extraction bug in `src/lib/analysis.ts` where `evidenceAt` sliced characters before the match rather than extracting the full statement line.
- Added `"test": "node --test --experimental-strip-types tests/**/*.test.ts"` script to `package.json` and set `"type": "module"`.
- Enabled `"allowImportingTsExtensions": true` and included `"tests/**/*.ts"` in `tsconfig.json`.

## Current milestone

Day 3, Milestone 2 is complete. Awaiting user review and manual commit before proceeding to Milestone 3.

## Pending milestones

### Remaining

- Improve SQL statement handling and validation while keeping the rules conservative.
- Add isolated PostgreSQL testing with Docker, timeouts, limits, and cleanup.
- Build evidence-based safety reports.
- Add optional server-side AI explanations with explicit evidence boundaries.
- Complete UI polish, security review, documentation, and final cleanup.

## Important architecture decisions

- Use one Next.js TypeScript application rather than separate frontend and backend repositories.
- Keep static findings, observed execution results, and AI explanations as distinct data categories.
- Make deterministic SQL rules useful without requiring AI or Docker.
- Run SQL only in a disposable Docker PostgreSQL instance; never use a production database by default.
- Use pnpm through Corepack for dependencies because npm installation was unreliable in this Windows environment.
- Use Node.js's built-in test runner (`node:test`) for unit testing without adding third-party testing dependencies.

## Technologies and dependencies introduced

Runtime and development dependencies: Next.js 16, React 19, TypeScript 5.9, ESLint 9, and ESLint's Next.js configuration. The repository uses pnpm 10 through Corepack to manage dependencies and Node.js built-in `node:test` for testing.

## Important files and responsibilities

| File | Responsibility |
| --- | --- |
| `AGENTS.md` | Master project requirements, workflow rules, architecture standards, and 16-day schedule. |
| `docker-compose.yml` | Local PostgreSQL 16 container definition with health check and volume. |
| `docs/ARCHITECTURE.md` | Proposed structure, safety model, visual palette, and technical risks. |
| `docs/DATABASE.md` | Database and Docker operational guide and safety boundaries. |
| `docs/DEPENDENCIES.md` | Dependency inventory and test runner documentation. |
| `.env.example` | Safe local environment-variable contract. |
| `.gitignore` | Prevents local environment files, dependencies, builds, and logs entering Git. |
| `README.md` | Honest project overview, verification commands, and documentation entry point. |
| `package.json` | Project scripts, package configuration, and package-manager version. |
| `pnpm-lock.yaml` | Exact resolved dependency versions for repeatable installs. |
| `tsconfig.json` | TypeScript compiler configuration covering `src` and `tests`. |
| `tests/analysis.test.ts` | Automated unit test suite verifying deterministic SQL risk analysis. |
| `tests/config.test.ts` | Automated tests for environment variable parsing and production URL checks. |
| `tests/api.test.ts` | Automated integration tests for `/api/health` and `/api/analyze` routes. |
| `src/app/` | Next.js pages, API route handlers, layout, and responsive styles. |
| `src/components/migration-editor.tsx` | Interactive, accessible SQL editor foundation. |
| `src/lib/config.ts` | Type-safe runtime environment configuration and safety checks. |
| `src/lib/analysis.ts` | Deterministic migration risk rules, evidence extraction, and finding types. |

## Tests executed and actual results

- `corepack pnpm run test` passed (19/19 tests passing across 3 test suites in ~370ms).
- `corepack pnpm run typecheck` passed cleanly across all `src/` and `tests/`.
- `corepack pnpm run build` passed and generated an optimized production build (static pages + dynamic API routes).
- `node ./node_modules/eslint/bin/eslint.js src tests` passed with 0 errors or warnings.

## Known bugs and limitations

- Static rules are conservative and do not parse the full PostgreSQL grammar.
- Analysis currently runs in the browser and does not execute SQL.
- Docker and PostgreSQL CLI are unavailable in the current environment.
- npm installation was unreliable in this Windows environment, so setup instructions use Corepack with pnpm instead.

## Remaining work

Execution observations, Docker testing, reports, AI explanations, statement boundary improvements, security hardening, and final documentation remain.

## Next recommended action

After reviewing and committing this milestone, proceed to **Day 3, Milestone 3**: Improve SQL statement tokenization, boundary handling, and validation while keeping rules conservative.
