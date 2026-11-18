"use client";

import { useState } from "react";
import { analyzeMigration, type MigrationFinding } from "@/lib/analysis";

const sampleMigration = `ALTER TABLE customers
  ADD COLUMN preferred_name TEXT;

CREATE INDEX CONCURRENTLY customers_preferred_name_idx
  ON customers (preferred_name);`;

const maximumMigrationLength = 102_400;

export function MigrationEditor() {
  const [migrationSql, setMigrationSql] = useState(sampleMigration);
  const [findings, setFindings] = useState<MigrationFinding[] | null>(null);
  const remainingCharacters = maximumMigrationLength - migrationSql.length;
  const isMigrationEmpty = migrationSql.trim().length === 0;

  function clearMigration() {
    setMigrationSql("");
    setFindings(null);
  }

  function restoreSampleMigration() {
    setMigrationSql(sampleMigration);
    setFindings(null);
  }

  function runAnalysis() {
    setFindings(analyzeMigration(migrationSql));
  }

  return (
    <section className="editor-shell" aria-labelledby="migration-editor-title">
      <div className="editor-heading">
        <div>
          <p className="eyebrow">New review</p>
          <h1 id="migration-editor-title">Inspect a PostgreSQL migration</h1>
          <p className="editor-introduction">
            Paste one migration file. MigrationGuard will keep inferred risks,
            execution evidence, and AI guidance clearly separated.
          </p>
        </div>
        <p className="draft-status" aria-live="polite">
          {isMigrationEmpty ? "Empty draft" : "Unsaved draft"}
        </p>
      </div>

      <div className="editor-grid">
        <div className="sql-panel">
          <div className="panel-toolbar">
            <label htmlFor="migration-sql">Migration SQL</label>
            <span className="language-tag">PostgreSQL</span>
          </div>

          <textarea
            id="migration-sql"
            className="sql-input"
            value={migrationSql}
            onChange={(event) => setMigrationSql(event.target.value)}
            maxLength={maximumMigrationLength}
            spellCheck="false"
            aria-describedby="migration-help migration-count"
            placeholder="ALTER TABLE ..."
          />

          <div className="editor-footer">
            <p id="migration-help">
              SQL remains in this draft until you choose to analyze it.
            </p>
            <p id="migration-count" aria-live="polite">
              {migrationSql.length.toLocaleString()} characters ·{" "}
              {remainingCharacters.toLocaleString()} remaining
            </p>
          </div>

          <div className="editor-actions">
            <button className="button button-secondary" type="button" onClick={restoreSampleMigration}>
              Restore sample
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={clearMigration}
              disabled={isMigrationEmpty}
            >
              Clear draft
            </button>
            <button
              className="button button-primary"
              type="button"
              onClick={runAnalysis}
              disabled={isMigrationEmpty}
            >
              Analyze migration
            </button>
          </div>
        </div>

        <aside className="review-note" aria-labelledby="review-note-title">
          <p className="eyebrow">Static analysis</p>
          <h2 id="review-note-title">
            {findings === null
              ? "No result yet"
              : findings.length === 0
                ? "No rule matches"
                : `${findings.length} finding${findings.length === 1 ? "" : "s"}`}
          </h2>
          <p>
            {findings === null
              ? "Analyze this draft to identify deterministic risks without executing the SQL."
              : findings.length === 0
                ? "The current rules found no known risk patterns. This is not a production-safety guarantee."
                : "These are inferred risks from local rules, not observations from a test database."}
          </p>
          {findings && findings.length > 0 ? (
            <ul className="finding-list">
              {findings.map((finding) => (
                <li className={`finding finding-${finding.severity}`} key={finding.id}>
                  <div className="finding-heading">
                    <strong>{finding.title}</strong>
                    <span>{finding.severity}</span>
                  </div>
                  <p className="finding-evidence">
                    Line {finding.line}: <code>{finding.evidence}</code>
                  </p>
                  <p>{finding.explanation}</p>
                  <p className="finding-recommendation">{finding.recommendation}</p>
                </li>
              ))}
            </ul>
          ) : (
            <dl>
              <div>
                <dt>Static findings</dt>
                <dd>Rules inspect SQL without executing it.</dd>
              </div>
              <div>
                <dt>Test observations</dt>
                <dd>Future Docker tests will report measured facts only.</dd>
              </div>
              <div>
                <dt>AI guidance</dt>
                <dd>Future explanations will never replace evidence.</dd>
              </div>
            </dl>
          )}
        </aside>
      </div>
    </section>
  );
}
