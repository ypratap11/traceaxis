import { telemetrySignals } from "@/lib/data";

export function TelemetryChart() {
  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow">Signals</div>
          <h2 className="mt-2 text-xl font-semibold">Telemetry Alignment</h2>
        </div>
        <div className="text-sm text-white/45">Crosshair linked</div>
      </div>
      <div className="mt-6 grid gap-4">
        {telemetrySignals.map((signal) => {
          const max = Math.max(...signal.values);
          return (
            <div key={signal.label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-white">{signal.label}</span>
                <span className="font-mono text-xs text-white/45">{signal.values.at(-1)}</span>
              </div>
              <div className="flex h-24 items-end gap-2">
                {signal.values.map((value, index) => (
                  <div key={`${signal.label}_${index}`} className="flex-1">
                    <div
                      className="rounded-t-full"
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
