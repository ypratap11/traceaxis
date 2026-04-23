import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CompareStrip } from "@/components/compare-strip";
import { TimelineCard } from "@/components/timeline-card";
import { getIncident } from "@/lib/store";

function ComparePane({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="panel p-5">
      <div className="eyebrow">{label}</div>
      <h2 className="mt-2 text-xl font-semibold text-white">{detail}</h2>
      <div className="mt-5 h-72 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#171d29_0%,#0d1017_100%)] p-5">
        <div className="flex h-full items-end rounded-2xl border border-dashed border-white/10 bg-black/10 p-5 text-sm leading-6 text-white/55">
          Placeholder for synchronized camera, telemetry, and log overlays in compare mode.
        </div>
      </div>
    </div>
  );
}

export default async function IncidentComparePage({
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
      title={`Compare: ${incident.title}`}
      subtitle="Contrast the failed run against a healthy baseline and surface the deviations that matter first."
      actions={
        <Link
          href={`/app/incidents/${incidentId}`}
          className="control-chip"
        >
          Back To Replay
        </Link>
      }
    >
      <div className="space-y-5">
        <CompareStrip />
        <div className="grid gap-5 xl:grid-cols-2">
          <ComparePane label="Failed Run" detail={`${incident.robot} | ${incident.detectedAt}`} />
          <ComparePane label="Baseline Run" detail={`${incident.robot} | 2026-04-20 10:18`} />
        </div>
        <TimelineCard />
      </div>
    </AppShell>
  );
}
