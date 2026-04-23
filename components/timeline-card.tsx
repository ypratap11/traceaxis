import { eventMarkers } from "@/lib/data";

export function TimelineCard() {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow">Replay Timeline</div>
          <h2 className="mt-2 text-xl font-semibold">Incident Window 05:48 - 07:18</h2>
        </div>
        <div className="text-sm text-white/50">Frame sync 33ms</div>
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-graphite-900 px-4 py-5">
        <div className="relative h-24">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
          <div className="absolute inset-y-4 left-[62%] w-px bg-accent-400/80 shadow-[0_0_18px_rgba(76,242,197,0.65)]" />
          {eventMarkers.map((marker, index) => {
            const positions = ["24%", "48%", "62%", "70%"];
            const tones: Record<string, string> = {
              warning: "bg-warning",
              danger: "bg-danger",
              info: "bg-info",
              accent: "bg-accent-400"
            };
            return (
              <div
                key={marker.id}
                className="absolute top-2 -translate-x-1/2"
                style={{ left: positions[index] }}
              >
                <div className={`mx-auto h-3 w-3 rounded-full ${tones[marker.tone]}`} />
                <div className="mt-3 w-36 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs text-white/70">
                  <div className="font-medium text-white">{marker.label}</div>
                  <div className="mt-1 text-white/45">{marker.timestamp}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/35">
          <span>05:48</span>
          <span>06:12</span>
          <span>06:37</span>
          <span>07:03</span>
          <span>07:18</span>
        </div>
      </div>
    </div>
  );
}
