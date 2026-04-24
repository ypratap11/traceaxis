import Link from "next/link";
import type { Incident, IncidentSeverity } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";

const sevDot: Record<IncidentSeverity, string> = {
  critical: "bg-err",
  high: "bg-warn",
  medium: "bg-info",
  low: "bg-ink-3"
};

type Props = {
  incident: Incident;
};

export function IncidentTableRow({ incident }: Props) {
  return (
    <Link
      href={`/app/incidents/${incident.id}`}
      className="grid grid-cols-[18px_2fr_1fr_1fr_0.8fr_1fr_90px] items-center gap-4 border-b border-line px-4 py-3 text-xs transition-colors hover:bg-surface-2/40"
    >
      <span
        aria-hidden="true"
        data-severity-dot={incident.severity}
        className={`h-2 w-2 rounded-full ${sevDot[incident.severity]}`}
      />
      <div>
        <div className="font-medium text-ink-0">{incident.title}</div>
        <div className="mt-0.5 text-[11px] text-ink-3">
          {incident.failureType}
        </div>
      </div>
      <div className="text-ink-1">{incident.robot}</div>
      <div className="text-ink-1">{incident.site}</div>
      <div className="font-mono text-ink-2">{incident.softwareVersion}</div>
      <div className="font-mono text-ink-3">{incident.detectedAt}</div>
      <div className="justify-self-start">
        <StatusBadge status={incident.status} />
      </div>
    </Link>
  );
}
