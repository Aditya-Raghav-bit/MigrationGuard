import { checkDatabaseHealth } from "../../../lib/db.ts";

export async function GET() {
  const dbHealth = await checkDatabaseHealth();

  return Response.json({
    status: "ok",
    service: "MigrationGuard",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
    database: dbHealth,
  });
}
