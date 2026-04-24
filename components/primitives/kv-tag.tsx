import type { ReactNode } from "react";

type Props = {
  k?: string;
  v: ReactNode;
  variant?: "default" | "solid";
};

export function KvTag({ k, v, variant = "default" }: Props) {
  if (variant === "solid") {
    return (
      <span className="inline-flex items-center rounded-sm bg-ink-0 px-3 py-1 font-mono text-[11px] font-semibold text-surface-0">
        <span>{v}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-line-strong px-2.5 py-1 text-[11px] font-medium text-ink-1">
      {k && <span className="text-ink-3">{k}</span>}
      <span>{v}</span>
    </span>
  );
}
