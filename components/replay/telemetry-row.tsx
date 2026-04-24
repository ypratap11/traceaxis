import { Sparkline } from "@/components/primitives/sparkline";
import { cursorIndexFor } from "@/lib/replay-data";

export type TelemetrySignal = {
  label: string;
  values: number[];
  unit?: string;
  delta?: string;
};

type Props = {
  signals: TelemetrySignal[];
  cursorRatio: number;
};

export function TelemetryRow({ signals, cursorRatio }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {signals.map((signal) => {
        const idx = cursorIndexFor(cursorRatio, signal.values.length);
        return (
          <Sparkline
            key={signal.label}
            label={signal.label}
            values={signal.values}
            cursorIndex={idx}
            unit={signal.unit}
            delta={signal.delta}
          />
        );
      })}
    </div>
  );
}
