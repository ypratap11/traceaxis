import { commandTrace, replayBookmarks } from "@/lib/data";

export function ReplayStage() {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <div>
          <div className="eyebrow">Primary Replay</div>
          <h2 className="mt-2 text-2xl font-semibold text-white">Forward camera with aligned control state</h2>
        </div>
        <div className="flex gap-2">
          <div className="control-chip">T + 06:37</div>
          <div className="control-chip">Playback 1.0x</div>
        </div>
      </div>
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="border-b border-white/10 p-5 xl:border-b-0 xl:border-r">
          <div className="h-[420px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(76,242,197,0.16),transparent_24%),linear-gradient(180deg,#151c29_0%,#090d14_100%)] p-6">
            <div className="flex h-full flex-col justify-between rounded-[22px] border border-dashed border-white/10 bg-black/10 p-6">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/35">
                <span>Forward camera</span>
                <span>Waypoint M-14</span>
              </div>
              <div className="max-w-xl">
                <div className="text-4xl font-semibold tracking-[-0.04em] text-white">
                  Forklift occlusion collapses localization confidence.
                </div>
                <p className="mt-4 text-sm leading-7 text-white/58">
                  This stage should become the synchronized playback surface for raw video, perception
                  overlays, and operator bookmarks. The layout now supports a serious replay product
                  instead of a generic media box.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="control-chip">Overlay: localization drift</div>
                <div className="control-chip">Overlay: obstacle track</div>
                <div className="control-chip">Jump: planner recovery</div>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {replayBookmarks.map((bookmark) => (
              <div
                key={bookmark.time}
                className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4"
              >
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">{bookmark.owner}</div>
                <div className="mt-2 text-base font-semibold text-white">{bookmark.title}</div>
                <div className="mt-3 font-mono text-sm text-accent-400">{bookmark.time}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-5">
          <div className="eyebrow">Control Trace</div>
          <h3 className="mt-2 text-xl font-semibold text-white">Commands and transitions</h3>
          <div className="mt-5 space-y-3">
            {commandTrace.map((item) => {
              const toneClass =
                item.tone === "danger"
                  ? "border-danger/20 bg-danger/10 text-danger"
                  : item.tone === "warning"
                    ? "border-warning/20 bg-warning/10 text-warning"
                    : item.tone === "info"
                      ? "border-info/20 bg-info/10 text-info"
                      : "border-white/10 bg-white/[0.03] text-white/78";

              return (
                <div key={`${item.time}_${item.label}`} className={`rounded-[22px] border px-4 py-3 ${toneClass}`}>
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em]">
                    <span>{item.label}</span>
                    <span className="font-mono">{item.time}</span>
                  </div>
                  <div className="mt-2 text-base font-semibold">{item.value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
