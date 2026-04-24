import { Panel } from "@/components/primitives/panel";
import { EventRow } from "@/components/primitives/event-row";
import type { ScrubEvent } from "@/lib/replay-data";

function fmt(ms: number) {
  const total = ms / 1000;
  const minutes = Math.floor(total / 60);
  const seconds = Math.floor(total % 60);
  const millis = Math.floor(ms % 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

function activeIndex(events: ScrubEvent[], currentMs: number): number {
  let idx = -1;
  for (let i = 0; i < events.length; i++) {
    if (events[i].ms <= currentMs) idx = i;
    else break;
  }
  return idx;
}

type Props = {
  events: ScrubEvent[];
  currentMs: number;
  onSeek: (ms: number) => void;
};

export function EventStream({ events, currentMs, onSeek }: Props) {
  const active = activeIndex(events, currentMs);
  const anomalies = events.filter(
    (e) => e.severity === "warn" || e.severity === "err"
  ).length;

  return (
    <Panel
      eyebrow="Event stream"
      actions={
        <span className="font-mono text-[11px] text-ink-3">
          {events.length} events · {anomalies} anomalies
        </span>
      }
      bodyClassName="p-0 max-h-full overflow-auto"
    >
      <ul className="divide-y divide-line">
        {events.map((evt, idx) => (
          <li key={evt.id}>
            <EventRow
              label={evt.label}
              timestamp={fmt(evt.ms)}
              severity={evt.severity}
              active={idx === active}
              onClick={() => onSeek(evt.ms)}
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
