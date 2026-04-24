import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-ink-0 text-sm font-bold text-surface-0">
        T
      </div>
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-ink-0">
          TraceAxis
        </div>
        <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-ink-3">
          Incident Replay
        </div>
      </div>
    </Link>
  );
}
