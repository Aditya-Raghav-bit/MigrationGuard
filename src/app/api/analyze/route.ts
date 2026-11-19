import { analyzeMigration } from "../../../lib/analysis.ts";
import { getServerConfig } from "../../../lib/config.ts";

export async function POST(request: Request) {
  try {
    const config = getServerConfig();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON body. Please provide a JSON object with a 'sql' string." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || !("sql" in body) || typeof (body as { sql: unknown }).sql !== "string") {
      return Response.json(
        { error: "Missing or invalid 'sql' field. Expected a string." },
        { status: 400 }
      );
    }

    const { sql } = body as { sql: string };

    // Check payload size against safety limit
    const byteLength = new TextEncoder().encode(sql).length;
    if (byteLength > config.maxMigrationSizeBytes) {
      return Response.json(
        {
          error: `Migration SQL exceeds maximum allowed size of ${config.maxMigrationSizeBytes} bytes (${byteLength} bytes received).`,
        },
        { status: 413 }
      );
    }

    const findings = analyzeMigration(sql);

    return Response.json({
      findings,
      count: findings.length,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Analysis endpoint error:", error);
    return Response.json(
      { error: "Internal server error occurred during migration analysis." },
      { status: 500 }
    );
  }
}
