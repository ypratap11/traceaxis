import { IncidentSeverity, IncidentStatus } from "@/lib/types";

const severityClasses: Record<IncidentSeverity, string> = {
  critical: "bg-danger/15 text-danger border-danger/20",
  high: "bg-warning/15 text-warning border-warning/20",
  medium: "bg-info/15 text-info border-info/20",
  low: "bg-white/10 text-white/70 border-white/10"
};

const statusClasses: Record<IncidentStatus, string> = {
  new: "bg-white/10 text-white/70 border-white/10",
  investigating: "bg-accent-500/15 text-accent-400 border-accent-500/20",
  resolved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
};

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${severityClasses[severity]}`}
    >
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}
