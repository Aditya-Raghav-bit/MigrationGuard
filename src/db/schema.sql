-- MigrationGuard Application Schema
-- This schema initializes the persistent application database (MigrationGuard history).
-- It is NEVER used for executing untrusted user-submitted migrations.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS migration_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_sql TEXT NOT NULL,
  findings_count INT NOT NULL DEFAULT 0,
  high_severity_count INT NOT NULL DEFAULT 0,
  medium_severity_count INT NOT NULL DEFAULT 0,
  low_severity_count INT NOT NULL DEFAULT 0,
  findings JSONB NOT NULL DEFAULT '[]'::jsonb,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index to quickly query recent reviews in chronological order
CREATE INDEX IF NOT EXISTS idx_migration_reviews_created_at 
  ON migration_reviews (created_at DESC);

COMMENT ON TABLE migration_reviews IS 'Stores static analysis and execution reports for submitted PostgreSQL migrations.';
COMMENT ON COLUMN migration_reviews.raw_sql IS 'Original SQL migration text submitted by the developer.';
COMMENT ON COLUMN migration_reviews.findings_count IS 'Total count of detected risk findings.';
COMMENT ON COLUMN migration_reviews.findings IS 'Structured JSON array of findings with severity, line, evidence, and recommendations.';
