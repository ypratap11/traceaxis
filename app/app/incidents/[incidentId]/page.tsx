import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { IncidentSummaryCard } from "@/components/incident-summary";
import { TelemetryChart } from "@/components/telemetry-chart";
import { TimelineCard } from "@/components/timeline-card";
import { eventMarkers, incidents } from "@/lib/data";

export default function IncidentDetailPage() {
  const incident = incidents[0];

  return (
    <AppShell
      title={incident.title}
      subtitle={incident.summary}
      actions={
        <div className="flex gap-3">
          <Link
            href={`/app/incidents/${incident.id}/compare`}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/75"
          >
            Compare Run
          </Link>
          <Link
            href={`/app/incidents/${incident.id}/summary`}
            className="rounded-full bg-accent-500 px-4 py-2.5 text-sm font-semibold text-graphite-950"
          >
            View Summary
          </Link>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <div className="eyebrow">Primary View</div>
                  <h2 className="mt-2 text-xl font-semibold">Forward camera</h2>
                </div>
                <div className="font-mono text-sm text-white/45">T + 06:37</div>
              </div>
              <div className="h-[360px] bg-[radial-gradient(circle_at_top,rgba(76,242,197,0.18),transparent_22%),linear-gradient(180deg,#171d29_0%,#0d1017_100%)] p-5">
                <div className="flex h-full items-end rounded-2xl border border-dashed border-white/10 bg-black/10 p-5">
                  <div>
                    <div className="text-sm uppercase tracking-[0.22em] text-white/40">Video Frame</div>
                    <div className="mt-3 text-2xl font-semibold text-white">
                      Forklift occlusion near waypoint M-14
                    </div>
                    <div className="mt-3 max-w-md text-sm leading-6 text-white/60">
                      Future hook: actual frame playback, overlays, and message-aligned annotations.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="panel p-5">
              <div className="eyebrow">Event Stream</div>
              <h2 className="mt-2 text-xl font-semibold">Anomalies and transitions</h2>
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
                      className={`rounded-2xl border px-4 py-3 ${toneClass[marker.tone]}`}
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
          </div>
          <TimelineCard />
          <TelemetryChart />
        </div>
        <div className="space-y-5">
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
          </div>
          <IncidentSummaryCard />
        </div>
      </div>
    </AppShell>
  );
}
