import Link from "next/link";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold">Smart PC Build</span>
        <span className="text-xs text-text-secondary">
          Cheap &amp; Power
        </span>
      </div>
      <nav className="flex gap-4 text-sm text-text-secondary">
        <Link href="/builder" className="hover:text-foreground">
          Builder
        </Link>
        <Link href="/saved" className="hover:text-foreground">
          Saved builds
        </Link>
        <Link href="/community" className="hover:text-foreground">
          Community
        </Link>
      </nav>
    </header>
  );
}

