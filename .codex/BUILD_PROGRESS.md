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

### Day 3, SQL analysis — First deterministic rule set

- Added client-side static analysis without executing submitted SQL.
- Added rules for table drops, column drops, column type changes, `NOT NULL`
  enforcement, constraints added without `NOT VALID`, and non-concurrent indexes.
- Added severity, line evidence, explanation, and recommendation to each finding.
- Connected the Analyze button to the findings panel.
- Reset analysis results when the draft is cleared or restored.

## Current milestone

The first SQL analysis milestone is complete. Awaiting user review and manual
commit before beginning automated analysis tests.

## Pending milestones

### Remaining

- Add focused automated tests for the analysis rules and SQL edge cases.
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

## Technologies and dependencies introduced

Runtime and development dependencies: Next.js 16, React 19, TypeScript 5.9, ESLint 9, and ESLint's Next.js configuration. The repository uses pnpm 10 through Corepack to manage dependencies.

## Important files and responsibilities

| File | Responsibility |
| --- | --- |
| `docs/ARCHITECTURE.md` | Proposed structure, safety model, visual palette, and technical risks. |
| `.env.example` | Safe local environment-variable contract. |
| `.gitignore` | Prevents local environment files, dependencies, builds, and logs entering Git. |
| `README.md` | Honest project overview and documentation entry point. |
| `package.json` | Project scripts, pinned dependencies, and package-manager version. |
| `pnpm-lock.yaml` | Exact resolved dependency versions for repeatable installs. |
| `src/app/` | Next.js page, layout, and responsive global styles. |
| `src/components/migration-editor.tsx` | Interactive, accessible SQL editor foundation. |
| `src/lib/analysis.ts` | Deterministic migration risk rules and finding types. |

## Tests executed and actual results

- `corepack pnpm run lint` passed.
- `corepack pnpm run typecheck` passed.
- `corepack pnpm run build` passed and generated a production build.
- Re-ran linting, type checking, and a production build after adding the editor; all passed.
- `corepack pnpm run lint` passed after static analysis.
- `corepack pnpm run typecheck` passed after static analysis.
- `corepack pnpm run build` passed after static analysis.

## Known bugs and limitations

- Static rules are conservative and do not parse the full PostgreSQL grammar.
- Analysis currently runs in the browser and does not execute SQL.
- Docker and PostgreSQL CLI are unavailable in the current environment.
- npm installation was unreliable in this Windows environment, so setup instructions use Corepack with pnpm instead.

## Remaining work

Execution observations, Docker testing, reports, AI explanations, focused
automated tests, security hardening, and final documentation remain.

## Next recommended action

After reviewing and committing this milestone, add focused tests for
`analyzeMigration`, including safe SQL, each supported risk pattern, comments
and quoted strings, multiple statements, and empty input.
