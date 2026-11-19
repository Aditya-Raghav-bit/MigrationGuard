export async function GET() {
  return Response.json({
    status: "ok",
    service: "MigrationGuard",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
}
