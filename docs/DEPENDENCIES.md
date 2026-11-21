# Dependency inventory

This document records the packages intentionally introduced to MigrationGuard. Keep it updated whenever a dependency is added or removed.

## Package manager

This project uses **pnpm 10.26.1** through Corepack. Corepack comes with the installed Node.js version and runs pnpm without a separate global installation.

Use these commands from the repository root:

```bash
corepack pnpm install
corepack pnpm run dev
corepack pnpm run test
corepack pnpm run lint
corepack pnpm run typecheck
corepack pnpm run build
```

Installed packages live in `node_modules/`, which is generated locally and ignored by Git. Exact versions are recorded in `pnpm-lock.yaml`, which is committed to Git.

To remove the generated local packages and install them again:

```bash
corepack pnpm install --force
```

Do not delete `pnpm-lock.yaml` during ordinary development. It lets every developer install the same dependency versions.

## Runtime dependencies

| Package | Version | Why it is installed | Remove command |
| --- | --- | --- | --- |
| `next` | `16.4.6` | Full-stack React framework: pages, server endpoints, development server, and production build. | `corepack pnpm remove next` |
| `react` | `19.3.1` | Defines the application user interface as reusable components. | `corepack pnpm remove react` |
| `react-dom` | `19.3.1` | Renders React components in the browser. | `corepack pnpm remove react-dom` |
| `pg` | `8.23.1` | PostgreSQL client driver with connection pooling (`pg.Pool`) for application data and status checks. | `corepack pnpm remove pg` |

These packages are the core application runtime dependencies.

## Development dependencies

| Package | Version | Why it is installed | Remove command |
| --- | --- | --- | --- |
| `typescript` | `5.9.3` | Checks TypeScript types before the application runs. | `corepack pnpm remove -D typescript` |
| `@types/node` | `24.10.1` | Type definitions for Node.js APIs. | `corepack pnpm remove -D @types/node` |
| `@types/react` | `19.3.0` | Type definitions for React. | `corepack pnpm remove -D @types/react` |
| `@types/react-dom` | `19.3.0` | Type definitions for React DOM. | `corepack pnpm remove -D @types/react-dom` |
| `@types/pg` | `8.23.1` | Type definitions for the PostgreSQL `pg` client driver. | `corepack pnpm remove -D @types/pg` |
| `eslint` | `9.39.5` | Finds common code-quality and accessibility problems. | `corepack pnpm remove -D eslint` |
| `eslint-config-next` | `16.4.6` | Next.js-specific lint rules used by the ESLint configuration. | `corepack pnpm remove -D eslint-config-next` |

The `@types/*` packages and TypeScript work together. ESLint and its Next.js configuration also work together. Do not remove one from either group unless the related configuration is removed or replaced too.

## Automated test runner

MigrationGuard uses the built-in **Node.js test runner** (`node:test` and `node:assert/strict`) via `node --test --experimental-strip-types tests/**/*.test.ts`.

It runs TypeScript tests natively in Node 24 without requiring third-party testing frameworks (such as Jest or Vitest) or separate transpilation tools, keeping dependencies minimal, lightweight, and easy to explain.

## Inspecting dependencies

```bash
# List direct packages declared by this project.
corepack pnpm list --depth 0

# Explain why a package is installed.
corepack pnpm why <package-name>

# Check for outdated direct packages.
corepack pnpm outdated
```

## Adding, updating, and removing packages

```bash
# Add a package needed at runtime.
corepack pnpm add <package-name>

# Add a package used only for development or testing.
corepack pnpm add -D <package-name>

# Update one package after reviewing its release notes.
corepack pnpm update <package-name>

# Remove a runtime package.
corepack pnpm remove <package-name>

# Remove a development-only package.
corepack pnpm remove -D <package-name>
```

After any dependency change, run linting, type checking, and a production build. Commit both `package.json` and `pnpm-lock.yaml` together.

## Corepack and pnpm removal

pnpm is currently prepared by Corepack for this user account, outside this repository. It does not need to be committed and is not part of the application itself.

If you later decide to stop using pnpm, first migrate this project to another package manager and update the README. You can then remove pnpm's Corepack activation with:

```bash
corepack disable pnpm
```

Do not run that command while this project still depends on pnpm for installation.
