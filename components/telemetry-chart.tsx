import { telemetrySignals } from "@/lib/data";

export function TelemetryChart() {
  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow">Signals</div>
          <h2 className="mt-2 text-2xl font-semibold text-white">Telemetry Alignment</h2>
        </div>
        <div className="control-chip">Crosshair linked</div>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {telemetrySignals.map((signal) => {
          const max = Math.max(...signal.values);
          return (
            <div
              key={signal.label}
              className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-white">{signal.label}</span>
                <span className="font-mono text-xs text-white/45">Latest {signal.values.at(-1)}</span>
              </div>
              <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-white/32">
                Investigate change through anomaly window
              </div>
              <div className="flex h-24 items-end gap-2">
                {signal.values.map((value, index) => (
                  <div key={`${signal.label}_${index}`} className="flex-1">
                    <div
                      className="rounded-t-full shadow-[0_0_18px_rgba(255,255,255,0.06)]"
                      style={{
                        height: `${Math.max((value / max) * 100, 6)}%`,
                        backgroundColor: signal.color,
                        opacity: index >= signal.values.length - 3 ? 1 : 0.72
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
