import Link from "next/link";
import { SeverityBadge, StatusBadge } from "@/components/status-badge";
import { Incident } from "@/lib/types";

export function IncidentList({ incidents }: { incidents: Incident[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="eyebrow">Inbox</div>
          <h2 className="mt-2 text-2xl font-semibold text-white">Active incidents</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="control-chip">Localization</div>
          <div className="control-chip">Battery</div>
          <div className="control-chip">Network</div>
        </div>
      </div>
      <div className="space-y-3 px-4 py-4">
        {incidents.map((incident) => (
          <Link
            key={incident.id}
            href={`/app/incidents/${incident.id}`}
            className="panel-interactive grid gap-5 px-5 py-5 xl:grid-cols-[1.8fr_0.9fr_0.9fr_1fr_0.18fr]"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-lg font-semibold text-white">{incident.title}</div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                  {incident.failureType}
                </div>
              </div>
              <div className="mt-2 max-w-2xl text-sm leading-6 text-white/56">{incident.summary}</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">Robot</div>
              <div className="font-medium text-white">{incident.robot}</div>
              <div className="text-white/45">{incident.site}</div>
            </div>
            <div className="space-y-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">Severity</div>
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">Build</div>
              <div className="font-mono text-white/72">{incident.softwareVersion}</div>
              <div className="text-white/45">{incident.detectedAt}</div>
            </div>
            <div className="flex items-center justify-between xl:justify-end">
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">Window</div>
                <div className="mt-2 text-sm text-white/72">{incident.duration}</div>
              </div>
              <div className="text-xl text-white/22 xl:text-2xl">›</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
