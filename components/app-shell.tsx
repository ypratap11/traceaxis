import { SideNav, type SideNavItem } from "@/components/primitives/side-nav";
import { TopBar } from "@/components/primitives/top-bar";

const navItems: SideNavItem[] = [
  { href: "/app/incidents", label: "Incidents", icon: "incidents" },
  { href: "/app/uploads", label: "Uploads", icon: "uploads" },
  { href: "/app/settings", label: "Settings", icon: "settings" }
];

export function AppShell({
  title,
  subtitle,
  children,
  actions,
  activeHref = "/app/incidents",
  crumbs
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  activeHref?: string;
  crumbs?: string[];
}) {
  const breadcrumb = crumbs ?? [];

  return (
    <div className="flex min-h-screen bg-surface-0 text-ink-1">
      <SideNav items={navItems} activeHref={activeHref} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar crumbs={breadcrumb} actions={actions} />
        <header className="border-b border-line px-6 py-5">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink-0">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-2">
            {subtitle}
          </p>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
