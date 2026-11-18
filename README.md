# MigrationGuard

MigrationGuard is a developer tool that identifies potential risks in PostgreSQL migration SQL and, later, will run migrations in a disposable test database to gather real execution evidence.

## Current status

Day 1, Milestone 1 is complete: architecture, safety boundaries, environment contract, visual direction, and the 16-day plan are documented. Application code has not been created yet.

## Planned technology stack

- Next.js and React with TypeScript
- PostgreSQL
- Docker for disposable migration-test databases
- Node.js test tooling

## Setup

The application scaffold will be added in the next approved milestone. For now, copy `.env.example` to `.env` only when setting up local services, and never use a production database URL.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Temporary build progress](.codex/BUILD_PROGRESS.md)
