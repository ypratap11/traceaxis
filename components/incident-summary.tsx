import { incidentNotes } from "@/lib/data";

export function IncidentSummaryCard() {
  return (
    <div className="panel p-5">
      <div className="eyebrow">Summary</div>
      <h2 className="mt-2 text-xl font-semibold">Root-cause hypothesis</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">
        Localization degraded after a moving forklift blocked landmark visibility near waypoint M-14.
        Planner fallback entered recovery, but pose confidence never recovered before the mission abort threshold.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {incidentNotes.map((note) => (
          <div key={note.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
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
