import Link from "next/link";
import { notFound } from "next/navigation";
import { ReplayShell } from "@/components/replay/replay-shell";
import { ReplayWorkspace } from "@/components/replay-workspace";
import { getIncident } from "@/lib/store";

export default async function IncidentDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ incidentId: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { incidentId } = await params;
  const { t } = await searchParams;
  const incident = await getIncident(incidentId);

  if (!incident) {
    notFound();
  }

  const initialMs = t ? Math.max(0, Number.parseInt(t, 10) || 0) : undefined;

  return (
    <ReplayShell
      crumbs={["Incidents", incident.site, incident.id]}
      actions={
        <div className="flex gap-2">
          <Link
            href={`/app/incidents/${incidentId}/compare`}
            className="rounded-xs border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-1 transition hover:border-ink-3 hover:text-ink-0"
          >
            Compare
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
      <ReplayWorkspace incident={incident} initialMs={initialMs} />
    </ReplayShell>
  );
}
