import { MigrationEditor } from "@/components/migration-editor";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#migration-workspace">
        Skip to migration workspace
      </a>
      <header className="site-header">
        <div className="header-content">
          <Link className="brand" href="/" aria-label="MigrationGuard home">
            <span className="brand-mark" aria-hidden="true">M</span>
            <span>MigrationGuard</span>
          </Link>
          <nav aria-label="Primary navigation">
            <Link href="/" aria-current="page">Review</Link>
            <Link href="/approach">Approach</Link>
          </nav>
        </div>
      </header>
      <main id="migration-workspace" className="workspace">
        <MigrationEditor />
      </main>
    </>
  );
}
