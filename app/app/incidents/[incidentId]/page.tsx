import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ReplayWorkspace } from "@/components/replay-workspace";
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
      <ReplayWorkspace incident={incident} />
    </AppShell>
  );
}
