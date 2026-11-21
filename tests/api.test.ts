import test from "node:test";
import assert from "node:assert/strict";
import { GET as healthGet } from "../src/app/api/health/route.ts";
import { POST as analyzePost } from "../src/app/api/analyze/route.ts";

test("GET /api/health returns 200 and healthy status", async () => {
  const response = await healthGet();
  assert.equal(response.status, 200);

  const data = await response.json();
  assert.equal(data.status, "ok");
  assert.equal(data.service, "MigrationGuard");
  assert.equal(typeof data.timestamp, "string");
  assert.equal(typeof data.database, "object");
  assert.equal(typeof data.database.connected, "boolean");
});

test("POST /api/analyze validates JSON payload", async () => {
  // Invalid JSON (empty request)
  const reqInvalid = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "invalid-json",
  });
  const resInvalid = await analyzePost(reqInvalid);
  assert.equal(resInvalid.status, 400);

  // Missing 'sql' property
  const reqMissing = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notSql: "DROP TABLE users;" }),
  });
  const resMissing = await analyzePost(reqMissing);
  assert.equal(resMissing.status, 400);
});

test("POST /api/analyze returns findings for risky SQL", async () => {
  const req = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql: "DROP TABLE users;" }),
  });

  const res = await analyzePost(req);
  assert.equal(res.status, 200);

  const data = await res.json();
  assert.equal(data.count, 1);
  assert.equal(data.findings[0]?.id, "drop-table");
  assert.equal(data.findings[0]?.severity, "high");
});

test("POST /api/analyze rejects oversized SQL payloads with 413", async () => {
  // Config default max size is 102,400 bytes (100 KB)
  const oversizedSql = "A".repeat(102_401);

  const req = new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql: oversizedSql }),
  });

  const res = await analyzePost(req);
  assert.equal(res.status, 413);
  const data = await res.json();
  assert.match(data.error, /exceeds maximum allowed size/);
});
