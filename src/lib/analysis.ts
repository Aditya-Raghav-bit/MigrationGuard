export type FindingSeverity = "high" | "medium" | "low";

export type MigrationFinding = {
  id: string;
  severity: FindingSeverity;
  title: string;
  evidence: string;
  line: number;
  explanation: string;
  recommendation: string;
};

type Rule = Omit<MigrationFinding, "evidence" | "line"> & {
  pattern: RegExp;
};

const rules: Rule[] = [
  {
    id: "drop-table",
    severity: "high",
    title: "Table deletion",
    pattern: /\bDROP\s+TABLE\b/i,
    explanation: "Dropping a table removes its data and dependent objects.",
    recommendation: "Confirm the table is no longer needed and take a verified backup before applying this change.",
  },
  {
    id: "drop-column",
    severity: "high",
    title: "Column deletion",
    pattern: /\bDROP\s+COLUMN\b/i,
    explanation: "Dropping a column permanently removes the values stored in it.",
    recommendation: "Check all readers and writers first, then use a staged deprecation before removal.",
  },
  {
    id: "alter-column-type",
    severity: "high",
    title: "Column type change",
    pattern: /\bALTER\s+(?:TABLE\s+\S+\s+)?ALTER\s+COLUMN\b[\s\S]*?\bTYPE\b/i,
    explanation: "Changing a column type can rewrite a table or fail for existing values.",
    recommendation: "Measure the table and conversion cost, and consider a backfill into a new column.",
  },
  {
    id: "set-not-null",
    severity: "medium",
    title: "NOT NULL enforcement",
    pattern: /\b(?:ADD\s+COLUMN[\s\S]*?\bNOT\s+NULL\b|ALTER\s+COLUMN[\s\S]*?\bSET\s+NOT\s+NULL\b)/i,
    explanation: "Existing rows must satisfy the new NOT NULL requirement.",
    recommendation: "Backfill and verify null values before enforcing the constraint.",
  },
  {
    id: "unvalidated-constraint",
    severity: "medium",
    title: "Constraint validation during migration",
    pattern: /\bADD\s+CONSTRAINT\b(?![\s\S]*\bNOT\s+VALID\b)/i,
    explanation: "A new constraint without NOT VALID may scan existing rows while it is added.",
    recommendation: "For large tables, consider adding it as NOT VALID and validating it separately.",
  },
  {
    id: "non-concurrent-index",
    severity: "medium",
    title: "Index creation may block writes",
    pattern: /\bCREATE\s+(?:UNIQUE\s+)?INDEX\b(?!\s+CONCURRENTLY\b)/i,
    explanation: "A regular index build can block writes to the table for its duration.",
    recommendation: "Use CREATE INDEX CONCURRENTLY when the migration runs against a live table.",
  },
];

function maskCommentsAndStrings(sql: string) {
  return sql.replace(/'(?:''|[^'])*'|"(?:[^"]|"")*"|--[^\r\n]*|\/\*[\s\S]*?\*\//g, (match) =>
    match.replace(/[^\r\n]/g, " "),
  );
}

function lineAt(sql: string, index: number) {
  return sql.slice(0, index).split("\n").length;
}

function evidenceAt(sql: string, index: number) {
  const lineStart = index <= 0 ? 0 : sql.lastIndexOf("\n", index - 1) + 1;
  const lineEnd = sql.indexOf("\n", index);
  const rawLine = lineEnd === -1 ? sql.slice(lineStart) : sql.slice(lineStart, lineEnd);
  const line = rawLine.replace(/\r$/, "").trim();
  return line.length > 160 ? `${line.slice(0, 157)}...` : line;
}

export function analyzeMigration(sql: string): MigrationFinding[] {
  const sanitizedSql = maskCommentsAndStrings(sql);

  return rules
    .flatMap((rule) => {
      for (const statement of sanitizedSql.matchAll(/[^;]+;?/g)) {
        const statementText = statement[0];
        const statementStart = statement.index ?? 0;
        const match = rule.pattern.exec(statementText);

        if (match && match.index !== undefined) {
          const matchIndex = statementStart + match.index;
          return [{
            id: rule.id,
            severity: rule.severity,
            title: rule.title,
            evidence: evidenceAt(sql, matchIndex),
            line: lineAt(sql, matchIndex),
            explanation: rule.explanation,
            recommendation: rule.recommendation,
          }];
        }
      }

      return [];
    })
    .sort((left, right) => left.line - right.line);
}
