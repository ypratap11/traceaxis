import { AppShell } from "@/components/app-shell";
import { InboxBody } from "@/components/inbox/inbox-body";
import { listIncidents } from "@/lib/store";

export default async function IncidentsPage() {
  const incidents = await listIncidents();

  return (
    <AppShell
      title="Incident Inbox"
      subtitle="Scan recent failures, prioritize investigations, and open a synchronized replay workspace for the runs that matter."
      crumbs={["Incidents"]}
      actions={
        <button className="rounded-xs bg-ink-0 px-3 py-1.5 text-xs font-semibold text-surface-0">
          Upload Run
        </button>
      }
    >
      <InboxBody incidents={incidents} />
    </AppShell>
  );
}
