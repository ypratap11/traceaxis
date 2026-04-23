import { inspectorTopics } from "@/lib/data";

export function TopicInspector() {
  return (
    <div className="panel p-5">
      <div className="eyebrow">Inspector</div>
      <h2 className="mt-2 text-2xl font-semibold text-white">Pinned topics</h2>
      <div className="mt-5 space-y-3">
        {inspectorTopics.map((topic) => (
          <div
            key={topic.name}
            className="rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-4 py-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="font-mono text-sm text-white">{topic.name}</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-accent-400">{topic.state}</div>
            </div>
            <div className="mt-2 text-sm text-white/45">{topic.detail}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">Next hook</div>
        <p className="mt-3 text-sm leading-6 text-white/58">
          This rail should become the place for raw topic payload previews, message diffs, and quick
          pinning during investigation.
        </p>
      </div>
    </div>
  );
}
