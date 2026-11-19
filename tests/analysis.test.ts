import test from "node:test";
import assert from "node:assert/strict";
import { analyzeMigration } from "../src/lib/analysis.ts";

test("empty or whitespace SQL returns no findings", () => {
  assert.deepEqual(analyzeMigration(""), []);
  assert.deepEqual(analyzeMigration("   \n\t  "), []);
});

test("safe SQL operations return no findings", () => {
  const safeSql = `
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE users
      ADD COLUMN bio TEXT;

    ALTER TABLE users
      ADD CONSTRAINT check_email CHECK (email IS NOT NULL) NOT VALID;

    CREATE INDEX CONCURRENTLY idx_users_email
      ON users (email);
  `;

  const findings = analyzeMigration(safeSql);
  assert.deepEqual(findings, []);
});

test("DROP TABLE is flagged with high severity", () => {
  const sql = "DROP TABLE legacy_users;";
  const findings = analyzeMigration(sql);

  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.id, "drop-table");
  assert.equal(findings[0]?.severity, "high");
  assert.equal(findings[0]?.line, 1);
  assert.equal(findings[0]?.evidence, "DROP TABLE legacy_users;");
});

test("DROP COLUMN is flagged with high severity", () => {
  const sql = "ALTER TABLE users DROP COLUMN legacy_auth_token;";
  const findings = analyzeMigration(sql);

  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.id, "drop-column");
  assert.equal(findings[0]?.severity, "high");
  assert.equal(findings[0]?.line, 1);
  assert.equal(findings[0]?.evidence, "ALTER TABLE users DROP COLUMN legacy_auth_token;");
});

test("ALTER COLUMN TYPE is flagged with high severity", () => {
  const sql = "ALTER TABLE users ALTER COLUMN description TYPE VARCHAR(255);";
  const findings = analyzeMigration(sql);

  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.id, "alter-column-type");
  assert.equal(findings[0]?.severity, "high");
  assert.equal(findings[0]?.line, 1);
});

test("SET NOT NULL on existing column is flagged with medium severity", () => {
  const sql = "ALTER TABLE users ALTER COLUMN email SET NOT NULL;";
  const findings = analyzeMigration(sql);

  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.id, "set-not-null");
  assert.equal(findings[0]?.severity, "medium");
  assert.equal(findings[0]?.line, 1);
});

test("ADD COLUMN with NOT NULL is flagged with medium severity", () => {
  const sql = "ALTER TABLE users ADD COLUMN phone TEXT NOT NULL;";
  const findings = analyzeMigration(sql);

  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.id, "set-not-null");
  assert.equal(findings[0]?.severity, "medium");
  assert.equal(findings[0]?.line, 1);
});

test("ADD CONSTRAINT without NOT VALID is flagged with medium severity", () => {
  const sql = "ALTER TABLE orders ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);";
  const findings = analyzeMigration(sql);

  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.id, "unvalidated-constraint");
  assert.equal(findings[0]?.severity, "medium");
  assert.equal(findings[0]?.line, 1);
});

test("CREATE INDEX without CONCURRENTLY is flagged with medium severity", () => {
  const sql = "CREATE INDEX idx_orders_user_id ON orders (user_id);";
  const findings = analyzeMigration(sql);

  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.id, "non-concurrent-index");
  assert.equal(findings[0]?.severity, "medium");
  assert.equal(findings[0]?.line, 1);
});

test("CREATE UNIQUE INDEX without CONCURRENTLY is flagged with medium severity", () => {
  const sql = "CREATE UNIQUE INDEX idx_users_email ON users (email);";
  const findings = analyzeMigration(sql);

  assert.equal(findings.length, 1);
  assert.equal(findings[0]?.id, "non-concurrent-index");
  assert.equal(findings[0]?.severity, "medium");
});

test("keywords in single-line and multi-line comments are ignored", () => {
  const sql = `
    -- DROP TABLE users;
    -- ALTER TABLE users DROP COLUMN password;
    /*
      CREATE INDEX idx_audit ON audit (id);
      ALTER TABLE audit ALTER COLUMN status TYPE INT;
    */
    SELECT 1;
  `;

  const findings = analyzeMigration(sql);
  assert.deepEqual(findings, []);
});

test("keywords inside string literals and quoted identifiers are ignored", () => {
  const sql = `
    INSERT INTO audit_log (details)
    VALUES ('DROP TABLE users attempted by admin');

    SELECT 'ALTER TABLE users DROP COLUMN role' AS notice;
  `;

  const findings = analyzeMigration(sql);
  assert.deepEqual(findings, []);
});

test("multiple risky operations in one migration are ordered by line number", () => {
  const sql = [
    "CREATE TABLE new_items (id SERIAL);",       // line 1
    "",                                           // line 2
    "DROP TABLE old_items;",                      // line 3 - high
    "",                                           // line 4
    "ALTER TABLE accounts DROP COLUMN legacy_id;", // line 5 - high
    "",                                           // line 6
    "CREATE INDEX idx_items ON new_items (id);"   // line 7 - medium
  ].join("\n");

  const findings = analyzeMigration(sql);

  assert.equal(findings.length, 3);
  assert.equal(findings[0]?.id, "drop-table");
  assert.equal(findings[0]?.line, 3);
  assert.equal(findings[1]?.id, "drop-column");
  assert.equal(findings[1]?.line, 5);
  assert.equal(findings[2]?.id, "non-concurrent-index");
  assert.equal(findings[2]?.line, 7);
});
