import { KvTag } from "@/components/primitives/kv-tag";

export type IncidentHeaderData = {
  id: string;
  title: string;
  detectedAt: string;
  robot: string;
  site: string;
  softwareVersion: string;
  duration: string;
  severity: "critical" | "high" | "medium" | "low";
  failureType: string;
};

const sevToBadge: Record<IncidentHeaderData["severity"], string> = {
  critical: "bg-err/10 text-err",
  high: "bg-warn/10 text-warn",
  medium: "bg-info/10 text-info",
  low: "bg-ink-3/10 text-ink-2"
};

export function IncidentHeader({ incident }: { incident: IncidentHeaderData }) {
  return (
    <header className="border-b border-line px-6 py-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
        Incident · {incident.id} · detected {incident.detectedAt}
      </div>
      <h1 className="mt-2 text-xl font-semibold tracking-[-0.01em] text-ink-0">
        {incident.title}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ${sevToBadge[incident.severity]}`}
        >
          {incident.failureType}
        </span>
        <KvTag k="robot" v={incident.robot} />
        <KvTag k="site" v={incident.site} />
        <KvTag k="version" v={incident.softwareVersion} />
        <KvTag k="duration" v={incident.duration} />
      </div>
    </header>
  );
}
