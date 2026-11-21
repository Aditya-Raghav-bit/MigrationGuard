import test from "node:test";
import assert from "node:assert/strict";
import { checkDatabaseHealth, closePool } from "../src/lib/db.ts";

test("checkDatabaseHealth gracefully handles disconnected database without throwing", async () => {
  // Local postgres container may not be running during testing
  const health = await checkDatabaseHealth();

  assert.equal(typeof health.connected, "boolean");
  assert.equal(typeof health.message, "string");

  // It should either be successfully connected or report offline gracefully
  if (!health.connected) {
    assert.match(health.message, /Database offline or unreachable|Blocked/);
  } else {
    assert.equal(health.message, "Database connection established.");
  }

  await closePool();
});
