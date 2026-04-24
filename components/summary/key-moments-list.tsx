import Link from "next/link";
import type { ScrubEvent } from "@/lib/replay-data";

function fmt(ms: number) {
  const total = ms / 1000;
  const minutes = Math.floor(total / 60);
  const seconds = Math.floor(total % 60);
  const millis = Math.floor(ms % 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

const sevDot: Record<ScrubEvent["severity"], string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  err: "bg-err",
  info: "bg-info"
};

type Props = {
  incidentId: string;
  events: ScrubEvent[];
};

export function KeyMomentsList({ incidentId, events }: Props) {
  return (
    <ul className="divide-y divide-line">
      {events.map((evt) => (
        <li key={evt.id}>
          <Link
            href={`/app/incidents/${incidentId}?t=${evt.ms}`}
            className="flex items-center justify-between px-4 py-2.5 text-xs transition-colors hover:bg-surface-2/40"
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-block h-1.5 w-1.5 rounded-full ${sevDot[evt.severity]}`}
              />
              <span className="font-medium text-ink-1">{evt.label}</span>
            </span>
            <span className="font-mono text-ink-3">{fmt(evt.ms)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
