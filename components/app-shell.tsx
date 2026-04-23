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
    <div className="min-h-screen px-4 py-4 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1500px] gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="panel flex flex-col gap-8 p-6">
          <Brand />
          <div className="panel-muted p-4">
            <div className="eyebrow">Mission Control</div>
            <div className="mt-3 text-2xl font-semibold text-white">North America Pilot</div>
            <div className="mt-2 text-sm leading-6 text-white/55">
              Robotics incidents, replay traces, and upload intake for current validation sites.
            </div>
          </div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="panel-interactive px-4 py-3 text-sm text-white/72"
              >
                <div className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="text-white/28">/</span>
                </div>
              </Link>
            ))}
          </nav>
          <div className="panel-muted mt-auto p-4">
            <div className="eyebrow">Workspace Health</div>
            <div className="mt-4 grid gap-3">
              <div className="metric-tile">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/42">
                  Fleet coverage
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">18 robots</div>
              </div>
              <div className="metric-tile">
                <div className="text-[11px] uppercase tracking-[0.2em] text-white/42">
                  Active sites
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">4 environments</div>
              </div>
            </div>
          </div>
        </aside>
        <main className="space-y-5">
          <div className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.24em] text-white/42">
                <span className="inline-flex items-center gap-2">
                  <span className="status-dot bg-accent-400 shadow-[0_0_12px_rgba(76,242,197,0.8)]" />
                  TraceAxis Console
                </span>
                <span>Incident Ops</span>
              </div>
              <div className="hidden items-center gap-3 lg:flex">
                <div className="control-chip">
                  <span className="status-dot bg-warning" />
                  3 active investigations
                </div>
                <div className="control-chip">
                  <span className="status-dot bg-info" />
                  1 ingestion pending
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="eyebrow">Current Workspace</div>
                <h1 className="mt-3 max-w-4xl text-4xl font-semibold text-white">{title}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/60">{subtitle}</p>
              </div>
              {actions}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
