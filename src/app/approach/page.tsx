import Link from "next/link";

export default function ApproachPage() {
  return (
    <>
      <a className="skip-link" href="#approach-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-content">
          <Link className="brand" href="/" aria-label="MigrationGuard home">
            <span className="brand-mark" aria-hidden="true">M</span>
            <span>MigrationGuard</span>
          </Link>
          <nav aria-label="Primary navigation">
            <Link href="/">Review</Link>
            <Link href="/approach" aria-current="page">Approach</Link>
          </nav>
        </div>
      </header>

      <main id="approach-content" className="workspace">
        <section className="editor-shell" aria-labelledby="approach-title">
          <div className="editor-heading">
            <div>
              <p className="eyebrow">Philosophy & Architecture</p>
              <h1 id="approach-title">The MigrationGuard Approach</h1>
              <p className="editor-introduction">
                Reviewing database changes safely requires an uncompromising separation
                between static analysis, measured test observations, and AI explanations.
              </p>
            </div>
          </div>

          <div className="review-note" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
            <div style={{ maxWidth: "48rem" }}>
              <h2>The Three Pillars</h2>
              <p>
                A database migration that compiles is not automatically safe. A migration that
                succeeds in an empty test database is not automatically safe on a 50-million-row table.
                MigrationGuard maintains three strictly separated tiers of knowledge:
              </p>

              <dl style={{ margin: "2rem 0" }}>
                <div>
                  <dt style={{ color: "var(--accent-dark)", fontSize: "1rem" }}>1. Static Findings (Deterministic)</dt>
                  <dd style={{ marginTop: "0.4rem" }}>
                    Rules inspect the raw SQL text before execution. They detect inherently dangerous
                    DDL operations such as <code>DROP TABLE</code>, table-locking <code>ALTER COLUMN TYPE</code>,
                    or unindexed foreign keys without ever running the code.
                  </dd>
                </div>

                <div>
                  <dt style={{ color: "var(--accent-dark)", fontSize: "1rem" }}>2. Test Observations (Measured Facts)</dt>
                  <dd style={{ marginTop: "0.4rem" }}>
                    Actual execution facts captured inside an isolated, disposable Docker PostgreSQL container.
                    These include measurable execution time, error codes, and lock behaviors. We never fabricate
                    timings or test results.
                  </dd>
                </div>

                <div>
                  <dt style={{ color: "var(--accent-dark)", fontSize: "1rem" }}>3. AI Guidance (Optional Explanation)</dt>
                  <dd style={{ marginTop: "0.4rem" }}>
                    AI language models are strictly used to explain identified risks and suggest safer DDL patterns
                    (such as adding constraints with <code>NOT VALID</code> first). AI is never permitted to override
                    deterministic evidence or invent test observations.
                  </dd>
                </div>
              </dl>

              <h2>Safety Boundaries</h2>
              <p>
                All submitted SQL is treated as untrusted input. The application enforces a 100 KB payload limit,
                strict execution timeouts, and hard guardrails preventing connection to remote or production databases.
              </p>

              <div style={{ marginTop: "2rem" }}>
                <Link className="button button-primary" href="/" style={{ display: "inline-block", textDecoration: "none" }}>
                  Return to Migration Workspace
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
