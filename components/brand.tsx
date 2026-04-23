import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-4">
      <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-accent-400/30 bg-accent-500/10 text-sm font-semibold text-accent-400">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(76,242,197,0.18),transparent_62%)]" />
        <div className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-accent-400/35" />
        <span className="relative text-base tracking-[0.18em]">TA</span>
      </div>
      <div>
        <div className="text-[13px] font-semibold tracking-[0.28em] text-white/92 uppercase">
          TraceAxis
        </div>
        <div className="mt-1 text-xs tracking-[0.14em] text-white/42 uppercase">
          Incident Replay For Robotics Teams
        </div>
      </div>
    </Link>
  );
}
