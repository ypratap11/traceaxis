import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { IncidentSummaryCard } from "@/components/incident-summary";
import { eventMarkers } from "@/lib/data";
import { getIncident } from "@/lib/store";

export default async function IncidentSummaryPage({
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
      title={`Summary: ${incident.title}`}
      subtitle="Capture the failure narrative, supporting evidence, and internal notes before sharing the incident internally."
      actions={
        <div className="flex gap-3">
          <Link
            href={`/app/incidents/${incidentId}`}
            className="control-chip"
          >
            Back To Replay
          </Link>
          <button className="control-chip-accent">
            Export Report
          </button>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <IncidentSummaryCard />
        <div className="panel p-5">
          <div className="eyebrow">Key Moments</div>
          <div className="mt-4 space-y-3">
            {eventMarkers.map((marker) => (
              <div
                key={marker.id}
                className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-white">{marker.label}</span>
                  <span className="font-mono text-white/45">{marker.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
