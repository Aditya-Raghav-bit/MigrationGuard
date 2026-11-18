# MigrationGuard architecture

## Goal

MigrationGuard reviews PostgreSQL migration SQL before it reaches production. It keeps three kinds of information separate:

1. **Static findings** are deterministic warnings produced by local SQL rules.
2. **Execution observations** are facts captured while running a migration in a disposable test database.
3. **AI explanations** are optional guidance based only on the first two kinds of information.

Neither static analysis nor a successful test run is a production-safety guarantee.

## Proposed application shape

The first implementation will use one Next.js application with TypeScript. It keeps the UI and server endpoints together, which is easier to run and explain than maintaining separate frontend and backend projects.

```text
Browser
  |-- migration editor and reports
  v
Next.js application
  |-- API route: validates input and calls the analysis service
  |-- API route: starts an isolated test only when Docker is available
  |-- deterministic SQL analysis service
  |-- report builder
  |-- optional AI explanation service
  v
PostgreSQL
  |-- application database (future: saved reports)
  `-- disposable Docker test database (never production)
```

## Planned folders

```text
app/                 Pages, API routes, and global styles
components/          Focused UI components
lib/analysis/        SQL normalization, rules, and finding types
lib/execution/       Docker/PostgreSQL isolated-test orchestration
lib/reports/         Evidence-based report construction
lib/ai/              Optional, server-only AI explanation client
tests/               Unit and integration tests
docs/                Architecture and operational documentation
```

## Safety boundaries

- Submitted SQL is treated as untrusted input. It is never passed to a shell command.
- Static analysis is performed without executing SQL.
- Test execution targets only a newly created, disposable Docker PostgreSQL instance with no production credentials.
- Inputs will have a size limit; execution will have a timeout; test resources will be cleaned up after every run.
- The UI will explicitly label inferred risks, observed test results, and AI-generated content.
- AI receives only the migration text and evidence needed for an explanation. It is optional, server-side only, and cannot claim measurements it did not receive.

## Initial deterministic rules

The first rule set will flag `DROP TABLE`, `DROP COLUMN`, risky type changes, `NOT NULL` additions, unvalidated constraints, and indexes created without `CONCURRENTLY`. Each rule will return a severity, evidence from the submitted SQL, an explanation, and a practical recommendation.

## Deliberate visual direction

The interface will use a warm off-white page background (`#F5F2EC`), near-black primary text (`#1C1C1A`), slate secondary text (`#5D636B`), and restrained teal (`#0F766E`) for primary actions. Red, amber, and green will be reserved for safety severity and test status. SQL will use a monospace font. Borders and spacing, rather than gradients or decorative cards, will organize the layout.

## Major risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Static rules miss PostgreSQL edge cases | Keep findings conservative, evidence-based, and covered by unit tests. |
| A migration test is mistaken for production proof | Present test results as environment-specific observations only. |
| Executing SQL becomes unsafe | Use a disposable Docker database, strict validation, timeouts, and cleanup; never use shell interpolation. |
| Docker is unavailable on a developer machine | Clearly report that testing is unavailable while keeping static analysis functional. |
| AI invents facts | Give AI structured evidence only and label its output as guidance. |
