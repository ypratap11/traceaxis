import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-accent-400/30 bg-accent-500/10 text-sm font-semibold text-accent-400">
        TA
      </div>
      <div>
        <div className="text-sm font-semibold tracking-[0.22em] text-white/90 uppercase">
          TraceAxis
        </div>
        <div className="text-xs text-white/45">Incident Replay For Robotics Teams</div>
      </div>
    </Link>
  );
}
