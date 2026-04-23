import { incidentNotes } from "@/lib/data";

export function IncidentSummaryCard() {
  return (
    <div className="panel p-6">
      <div className="eyebrow">Summary</div>
      <h2 className="mt-2 text-2xl font-semibold text-white">Root-cause hypothesis</h2>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
        Localization degraded after a moving forklift blocked landmark visibility near waypoint M-14.
        Planner fallback entered recovery, but pose confidence never recovered before the mission abort threshold.
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <div className="control-chip">Primary cause: landmark occlusion</div>
        <div className="control-chip">Secondary risk: map shift near M-14</div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {incidentNotes.map((note) => (
          <div
            key={note.id}
            className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-white">{note.author}</span>
              <span className="text-white/40">{note.timestamp}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/60">{note.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
