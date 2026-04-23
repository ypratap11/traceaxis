import Link from "next/link";
import { Brand } from "@/components/brand";

const navItems = [
  { href: "/app/incidents", label: "Incidents" },
  { href: "/app/uploads", label: "Uploads" },
  { href: "/app/settings", label: "Settings" }
];

export function AppShell({
  title,
  subtitle,
  children,
  actions
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen px-5 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="panel flex flex-col gap-8 p-5">
          <Brand />
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="panel-muted mt-auto p-4">
            <div className="eyebrow">Workspace</div>
            <div className="mt-3 text-sm font-medium text-white">North America Pilot</div>
            <div className="mt-1 text-sm text-white/55">
              18 robots, 4 sites, 3 active investigations
            </div>
          </div>
        </aside>
        <main className="space-y-5">
          <div className="panel flex flex-col gap-4 p-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="eyebrow">TraceAxis Console</div>
              <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">{subtitle}</p>
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
