import Link from "next/link";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold">Smart PC Build</span>
        <span className="text-xs text-[var(--text-secondary)]">
          Cheap &amp; Power
        </span>
      </div>
      <nav className="flex gap-4 text-sm text-[var(--text-secondary)]">
        <Link href="/builder" className="hover:text-[var(--foreground)]">
          Builder
        </Link>
        <Link href="/saved" className="hover:text-[var(--foreground)]">
          Saved builds
        </Link>
        <Link href="/community" className="hover:text-[var(--foreground)]">
          Community
        </Link>
      </nav>
    </header>
  );
}

