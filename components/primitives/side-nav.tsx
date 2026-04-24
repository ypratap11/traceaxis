import Link from "next/link";

export type SideNavIcon = "incidents" | "uploads" | "search" | "settings";

export type SideNavItem = {
  href: string;
  label: string;
  icon: SideNavIcon;
};

type Props = {
  items: SideNavItem[];
  activeHref: string;
};

function Icon({ name }: { name: SideNavIcon }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5
  } as const;
  switch (name) {
    case "incidents":
      return (
        <svg {...common}>
          <path d="M2 3h12M2 8h12M2 13h12" />
        </svg>
      );
    case "uploads":
      return (
        <svg {...common}>
          <path d="M8 11V3M4 7l4-4 4 4M2 13h12" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="4.5" />
          <path d="M14 14l-3.5-3.5" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="2" />
          <path d="M8 1v2M8 13v2M15 8h-2M3 8H1M12.95 3.05l-1.42 1.42M4.47 11.53l-1.42 1.42M12.95 12.95l-1.42-1.42M4.47 4.47L3.05 3.05" />
        </svg>
      );
  }
}

export function SideNav({ items, activeHref }: Props) {
  return (
    <aside className="flex w-14 flex-col items-center gap-1 border-r border-line bg-surface-0 py-3.5">
      <Link
        href="/"
        aria-label="TraceAxis home"
        className="mb-3 flex h-7 w-7 items-center justify-center rounded-sm bg-ink-0 text-sm font-bold text-surface-0"
      >
        T
      </Link>
      {items.map((item) => {
        const isActive = activeHref.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-sm transition ${
              isActive
                ? "bg-surface-1 text-ink-0 shadow-[inset_2px_0_0_var(--data-bloom)]"
                : "text-ink-3 hover:bg-surface-1 hover:text-ink-1"
            }`}
          >
            <Icon name={item.icon} />
          </Link>
        );
      })}
    </aside>
  );
}
