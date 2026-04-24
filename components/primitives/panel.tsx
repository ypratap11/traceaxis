import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function Panel({
  eyebrow,
  title,
  actions,
  children,
  className = "",
  bodyClassName = ""
}: Props) {
  const hasHeader = Boolean(eyebrow || title || actions);

  return (
    <section
      className={`overflow-hidden rounded-lg border border-line bg-surface-1 ${className}`}
    >
      {hasHeader && (
        <header className="flex items-start justify-between border-b border-line bg-surface-2 px-4 py-3.5">
          <div>
            {eyebrow && (
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                {eyebrow}
              </div>
            )}
            {title && (
              <div className="mt-1.5 text-base font-semibold text-ink-0">
                {title}
              </div>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={`px-4 py-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
