import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { getServerConfig, isLikelyProductionUrl } from "./config.ts";

let poolInstance: Pool | null = null;

export function getPool(): Pool {
  if (poolInstance) {
    return poolInstance;
  }

  const config = getServerConfig();

  if (isLikelyProductionUrl(config.databaseUrl)) {
    throw new Error(
      "Safety guardrail triggered: The configured DATABASE_URL appears to point to a production/remote host. MigrationGuard only allows localhost / local docker databases."
    );
  }

  poolInstance = new Pool({
    connectionString: config.databaseUrl,
    max: 10,
    connectionTimeoutMillis: 2_000, // 2-second timeout so offline DB checks fail fast
    idleTimeoutMillis: 10_000,
  });

  // Handle unexpected errors on idle pool clients
  poolInstance.on("error", (err) => {
    console.error("Unexpected error on idle database client:", err);
  });

  return poolInstance;
}

export type DatabaseHealth = {
  connected: boolean;
  message: string;
  host?: string;
  database?: string;
};

/**
 * Safely probes PostgreSQL connectivity without throwing errors.
 * Useful for health checks and status indicators.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const config = getServerConfig();

  if (isLikelyProductionUrl(config.databaseUrl)) {
    return {
      connected: false,
      message: "Blocked: Refusing to connect to remote or production database host.",
    };
  }

  let client;
  try {
    const pool = getPool();
    client = await pool.connect();
    await client.query("SELECT 1 AS healthy;");

    const parsedUrl = new URL(config.databaseUrl);
    return {
      connected: true,
      message: "Database connection established.",
      host: parsedUrl.hostname,
      database: parsedUrl.pathname.replace(/^\//, ""),
    };
  } catch (error) {
    const err = error as Error;
    return {
      connected: false,
      message: `Database offline or unreachable: ${err.message}`,
    };
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Executes a parameterized query using the application connection pool.
 */
export async function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  parameters?: unknown[]
): Promise<QueryResult<R>> {
  const pool = getPool();
  return pool.query<R>(text, parameters);
}

/**
 * Helper to close pool connections during tests or shutdown.
 */
export async function closePool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
}
