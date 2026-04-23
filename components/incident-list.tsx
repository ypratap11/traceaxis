import Link from "next/link";
import { SeverityBadge, StatusBadge } from "@/components/status-badge";
import { Incident } from "@/lib/types";

export function IncidentList({ incidents }: { incidents: Incident[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <div className="eyebrow">Inbox</div>
          <h2 className="mt-2 text-xl font-semibold">Active incidents</h2>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/55">
          Filter: Localization, Battery, Network
        </div>
      </div>
      <div className="divide-y divide-white/10">
        {incidents.map((incident) => (
          <Link
            key={incident.id}
            href={`/app/incidents/${incident.id}`}
            className="grid gap-4 px-5 py-4 transition hover:bg-white/[0.03] xl:grid-cols-[1.6fr_0.9fr_0.8fr_1fr_1fr]"
          >
            <div>
              <div className="text-base font-medium text-white">{incident.title}</div>
              <div className="mt-1 text-sm text-white/50">{incident.summary}</div>
            </div>
            <div className="space-y-1 text-sm text-white/60">
              <div>{incident.robot}</div>
              <div>{incident.site}</div>
            </div>
            <div className="space-y-2">
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <div className="space-y-1 text-sm text-white/55">
              <div>{incident.failureType}</div>
              <div>{incident.softwareVersion}</div>
            </div>
            <div className="space-y-1 text-sm text-white/45">
              <div>{incident.detectedAt}</div>
              <div>{incident.duration}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
