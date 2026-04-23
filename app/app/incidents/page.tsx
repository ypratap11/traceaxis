import { AppShell } from "@/components/app-shell";
import { IncidentList } from "@/components/incident-list";
import { listIncidents } from "@/lib/store";

export default async function IncidentsPage() {
  const incidents = await listIncidents();

  return (
    <AppShell
      title="Incident Inbox"
      subtitle="Scan recent failures, prioritize investigations, and open a synchronized replay workspace for the runs that matter."
      actions={
        <div className="flex gap-3">
          <button className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/75">
            Filter Incidents
          </button>
          <button className="rounded-full bg-accent-500 px-4 py-2.5 text-sm font-semibold text-graphite-950">
            Upload Run
          </button>
        </div>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <IncidentList incidents={incidents} />
        <div className="space-y-5">
          <div className="panel p-5">
            <div className="eyebrow">Today</div>
            <div className="mt-4 grid gap-4">
              <div className="kpi">
                <div className="text-sm text-white/45">New incidents</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {incidents.filter((incident) => incident.status === "new").length
                    .toString()
                    .padStart(2, "0")}
                </div>
              </div>
              <div className="kpi">
                <div className="text-sm text-white/45">Investigating</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {incidents.filter((incident) => incident.status === "investigating").length
                    .toString()
                    .padStart(2, "0")}
                </div>
              </div>
              <div className="kpi">
                <div className="text-sm text-white/45">Total incidents</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {incidents.length.toString().padStart(2, "0")}
                </div>
              </div>
            </div>
          </div>
          <div className="panel p-5">
            <div className="eyebrow">Focus</div>
            <h2 className="mt-2 text-xl font-semibold text-white">Recurring failure cluster</h2>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Phoenix DC has shown three localization-related incidents after the latest map refresh.
              Prioritize aisle M-14 and charging corridor validations.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
