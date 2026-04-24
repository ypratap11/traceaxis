import Link from "next/link";
import { Brand } from "@/components/brand";

export function MarketingShell({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-0 text-ink-1">
      <header className="border-b border-line bg-surface-0 px-6 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Brand />
          <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.18em] text-ink-3 md:flex">
            <Link href="/#product" className="transition hover:text-ink-0">
              Product
            </Link>
            <Link href="/#workflow" className="transition hover:text-ink-0">
              Workflow
            </Link>
            <Link href="/app/incidents" className="transition hover:text-ink-0">
              Demo App
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
