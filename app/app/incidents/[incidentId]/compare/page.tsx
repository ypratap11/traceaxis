import Link from "next/link";
import { notFound } from "next/navigation";
import { ReplayShell } from "@/components/replay/replay-shell";
import { CompareBody } from "@/components/compare/compare-body";
import { getIncident } from "@/lib/store";

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
    <ReplayShell
      crumbs={["Incidents", incident.site, incident.id, "Compare"]}
      actions={
        <div className="flex gap-2">
          <Link
            href={`/app/incidents/${incidentId}`}
            className="rounded-xs border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-1 transition hover:border-ink-3 hover:text-ink-0"
          >
            Back to Replay
          </Link>
          <Link
            href={`/app/incidents/${incidentId}/summary`}
            className="rounded-xs bg-ink-0 px-3 py-1.5 text-xs font-semibold text-surface-0"
          >
            Open Summary
          </Link>
        </div>
      }
    >
      <CompareBody incident={incident} />
    </ReplayShell>
  );
}
