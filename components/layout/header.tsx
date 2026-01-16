import Link from "next/link";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-6 md:px-12">
      <Link href="/" className="flex flex-col">
        <span className="text-xl font-semibold text-glow-cyan">PULSE</span>
        <span className="text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
          ISP Auditor
        </span>
      </Link>
      <nav className="flex items-center gap-6 text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)]">
        <Link href="/test" className="hover:text-[var(--neon-cyan)]">
          Live Test
        </Link>
        <Link href="/leaderboard" className="hover:text-[var(--neon-pink)]">
          Leaderboard
        </Link>
      </nav>
    </header>
  );
}
