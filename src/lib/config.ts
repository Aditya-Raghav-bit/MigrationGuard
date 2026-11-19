export type AppConfig = {
  databaseUrl: string;
  postgresTestImage: string;
  maxMigrationSizeBytes: number;
  migrationTimeoutMs: number;
  openAiApiKey?: string;
};

const DEFAULT_CONFIG: AppConfig = {
  databaseUrl: "postgresql://migrationguard:migrationguard@localhost:5432/migrationguard",
  postgresTestImage: "postgres:16-alpine",
  maxMigrationSizeBytes: 102_400, // 100 KB
  migrationTimeoutMs: 30_000,     // 30 seconds
};

function parseIntegerEnv(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getServerConfig(): AppConfig {
  return {
    databaseUrl: process.env.DATABASE_URL || DEFAULT_CONFIG.databaseUrl,
    postgresTestImage: process.env.POSTGRES_TEST_IMAGE || DEFAULT_CONFIG.postgresTestImage,
    maxMigrationSizeBytes: parseIntegerEnv(
      process.env.MAX_MIGRATION_SIZE_BYTES,
      DEFAULT_CONFIG.maxMigrationSizeBytes
    ),
    migrationTimeoutMs: parseIntegerEnv(
      process.env.MIGRATION_TIMEOUT_MS,
      DEFAULT_CONFIG.migrationTimeoutMs
    ),
    openAiApiKey: process.env.OPENAI_API_KEY || undefined,
  };
}

/**
 * Validates that a database URL does not point to common production database host indicators.
 * Guardrail against accidental production connection.
 */
export function isLikelyProductionUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    // Check for obvious localhost / loopback identifiers
    const isLocalhost =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "host.docker.internal" ||
      host.endsWith(".local");

    return !isLocalhost;
  } catch {
    // If it cannot be parsed as a URL, treat with caution
    return false;
  }
}
