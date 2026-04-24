import type { ReactNode } from "react";

type Props = {
  crumbs: string[];
  actions?: ReactNode;
};

export function TopBar({ crumbs, actions }: Props) {
  return (
    <div className="flex items-center justify-between border-b border-line bg-surface-0 px-5 py-3">
      <nav
        aria-label="breadcrumb"
        className="flex items-center gap-2 text-xs text-ink-3"
      >
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <span key={`${crumb}-${idx}`} className="flex items-center gap-2">
              {idx > 0 && <span className="text-line-strong">/</span>}
              <span className={isLast ? "font-medium text-ink-0" : ""}>
                {crumb}
              </span>
            </span>
          );
        })}
      </nav>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
