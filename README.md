# MigrationGuard

MigrationGuard is a developer tool that identifies potential risks in PostgreSQL migration SQL and, later, will run migrations in a disposable test database to gather real execution evidence.

## Current status

The responsive SQL migration editor and the first deterministic static analysis rules are available. Isolated database testing is not implemented yet.

## Planned technology stack

- Next.js and React with TypeScript
- PostgreSQL
- Docker for disposable migration-test databases
- Node.js test tooling

## Local setup

MigrationGuard uses [pnpm](https://pnpm.io/) through Corepack, which ships with supported Node.js versions.

```bash
corepack pnpm install
corepack pnpm dev
```

Open `http://localhost:3000` after the development server starts. Copy `.env.example` to `.env` when local services are introduced, and never use a production database URL.

## Verification commands

```bash
corepack pnpm run lint
corepack pnpm run typecheck
corepack pnpm run build
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Dependency inventory](docs/DEPENDENCIES.md)
- [Temporary build progress](.codex/BUILD_PROGRESS.md)
