import test from "node:test";
import assert from "node:assert/strict";
import { getServerConfig, isLikelyProductionUrl } from "../src/lib/config.ts";

test("getServerConfig returns safe defaults", () => {
  const config = getServerConfig();

  assert.equal(typeof config.databaseUrl, "string");
  assert.equal(config.postgresTestImage, "postgres:16-alpine");
  assert.equal(config.maxMigrationSizeBytes, 102_400);
  assert.equal(config.migrationTimeoutMs, 30_000);
});

test("isLikelyProductionUrl accurately distinguishes localhost from external hosts", () => {
  // Local development / loopback hosts should be considered non-production
  assert.equal(isLikelyProductionUrl("postgresql://user:pass@localhost:5432/db"), false);
  assert.equal(isLikelyProductionUrl("postgresql://user:pass@127.0.0.1:5432/db"), false);
  assert.equal(isLikelyProductionUrl("postgresql://user:pass@host.docker.internal:5432/db"), false);

  // Cloud / remote hosts should be flagged as likely production
  assert.equal(isLikelyProductionUrl("postgresql://user:pass@aws.rds.amazonaws.com:5432/prod"), true);
  assert.equal(isLikelyProductionUrl("postgresql://user:pass@db.supabase.co:5432/postgres"), true);
  assert.equal(isLikelyProductionUrl("postgresql://user:pass@ep-cool-db.neon.tech/neondb"), true);
});
