import Link from "next/link";
import { Brand } from "@/components/brand";

export function MarketingShell({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen px-6 py-6 text-white sm:px-8 lg:px-10">
      <header className="mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-md">
        <Brand />
        <nav className="hidden items-center gap-6 text-sm text-white/60 md:flex">
          <Link href="/#product" className="transition hover:text-white">
            Product
          </Link>
          <Link href="/#workflow" className="transition hover:text-white">
            Workflow
          </Link>
          <Link href="/app/incidents" className="transition hover:text-white">
            Demo App
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}
