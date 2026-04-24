import { IncidentSeverity, IncidentStatus } from "@/lib/types";

const severityClasses: Record<IncidentSeverity, string> = {
  critical: "bg-err/10 text-err",
  high: "bg-warn/10 text-warn",
  medium: "bg-info/10 text-info",
  low: "bg-ink-3/10 text-ink-2"
};

const statusClasses: Record<IncidentStatus, string> = {
  new: "bg-ink-3/10 text-ink-2",
  investigating: "bg-info/10 text-info",
  resolved: "bg-ok/10 text-ok"
};

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  return (
    <span
      className={`inline-flex items-center rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ${severityClasses[severity]}`}
    >
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}
