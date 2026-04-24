import type { ReactNode } from "react";
import { SideNav, type SideNavItem } from "@/components/primitives/side-nav";
import { TopBar } from "@/components/primitives/top-bar";

const navItems: SideNavItem[] = [
  { href: "/app/incidents", label: "Incidents", icon: "incidents" },
  { href: "/app/uploads", label: "Uploads", icon: "uploads" },
  { href: "/app/settings", label: "Settings", icon: "settings" }
];

type Props = {
  crumbs: string[];
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  activeHref?: string;
};

export function ReplayShell({
  crumbs,
  actions,
  footer,
  children,
  activeHref = "/app/incidents"
}: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-0 text-ink-1">
      <SideNav items={navItems} activeHref={activeHref} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar crumbs={crumbs} actions={actions} />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        {footer && (
          <div className="border-t border-line bg-surface-0 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
