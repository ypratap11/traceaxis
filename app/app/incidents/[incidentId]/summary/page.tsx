import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SummaryBody } from "@/components/summary/summary-body";
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
      title="Incident summary"
      subtitle="Capture the failure narrative, supporting evidence, and internal notes before sharing the incident."
      crumbs={["Incidents", incident.site, incident.id, "Summary"]}
      actions={
        <Link
          href={`/app/incidents/${incidentId}`}
          className="rounded-xs border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-1 transition hover:border-ink-3 hover:text-ink-0"
        >
          Back to Replay
        </Link>
      }
    >
      <SummaryBody incident={incident} />
    </AppShell>
  );
}
