import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { IncidentSummaryCard } from "@/components/incident-summary";
import { ReplayStage } from "@/components/replay-stage";
import { TelemetryChart } from "@/components/telemetry-chart";
import { TimelineCard } from "@/components/timeline-card";
import { TopicInspector } from "@/components/topic-inspector";
import { eventMarkers } from "@/lib/data";
import { getIncident } from "@/lib/store";

export default async function IncidentDetailPage({
  params
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = await params;
  const incident = await getIncident(incidentId);

  if (!incident) {
    notFound();
  }

  return (
    <AppShell
      title={incident.title}
      subtitle={incident.summary}
      actions={
        <div className="flex gap-3">
          <Link
            href={`/app/incidents/${incidentId}/compare`}
            className="control-chip"
          >
            Compare Run
          </Link>
          <Link
            href={`/app/incidents/${incidentId}/summary`}
            className="control-chip-accent"
          >
            View Summary
          </Link>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="panel p-5">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="metric-tile">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">Robot</div>
                <div className="mt-2 text-2xl font-semibold text-white">{incident.robot}</div>
              </div>
              <div className="metric-tile">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">Site</div>
                <div className="mt-2 text-2xl font-semibold text-white">{incident.site}</div>
              </div>
              <div className="metric-tile">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">Version</div>
                <div className="mt-2 text-2xl font-semibold text-white">{incident.softwareVersion}</div>
              </div>
              <div className="metric-tile">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">Window</div>
                <div className="mt-2 text-2xl font-semibold text-white">{incident.duration}</div>
              </div>
            </div>
          </div>
          <ReplayStage />
          <TimelineCard />
          <TelemetryChart />
        </div>
        <div className="space-y-5">
          <div className="panel p-5">
            <div className="eyebrow">Event Stream</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">Anomalies and transitions</h2>
            <div className="mt-5 space-y-3">
              {eventMarkers.map((marker) => {
                const toneClass: Record<string, string> = {
                  warning: "bg-warning/15 text-warning border-warning/20",
                  danger: "bg-danger/15 text-danger border-danger/20",
                  info: "bg-info/15 text-info border-info/20",
                  accent: "bg-accent-500/15 text-accent-400 border-accent-500/20"
                };

                return (
                  <div
                    key={marker.id}
                    className={`rounded-[22px] border px-4 py-3 ${toneClass[marker.tone]}`}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{marker.label}</span>
                      <span className="font-mono">{marker.timestamp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="panel p-5">
            <div className="eyebrow">Run Metadata</div>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/45">Robot</span>
                <span className="font-medium text-white">{incident.robot}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/45">Site</span>
                <span className="font-medium text-white">{incident.site}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/45">Version</span>
                <span className="font-medium text-white">{incident.softwareVersion}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/45">Duration</span>
                <span className="font-medium text-white">{incident.duration}</span>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <div className="control-chip">Cause: {incident.failureType}</div>
              <div className="control-chip">Status: {incident.status}</div>
            </div>
          </div>
          <TopicInspector />
          <IncidentSummaryCard />
        </div>
      </div>
    </AppShell>
  );
}
