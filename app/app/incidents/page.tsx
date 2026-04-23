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
          <button className="control-chip">
            Filter Incidents
          </button>
          <button className="control-chip-accent">
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
              <div className="metric-tile">
                <div className="text-sm text-white/45">New incidents</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {incidents.filter((incident) => incident.status === "new").length
                    .toString()
                    .padStart(2, "0")}
                </div>
              </div>
              <div className="metric-tile">
                <div className="text-sm text-white/45">Investigating</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {incidents.filter((incident) => incident.status === "investigating").length
                    .toString()
                    .padStart(2, "0")}
                </div>
              </div>
              <div className="metric-tile">
                <div className="text-sm text-white/45">Total incidents</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {incidents.length.toString().padStart(2, "0")}
                </div>
              </div>
            </div>
          </div>
          <div className="panel p-5">
            <div className="eyebrow">Focus</div>
            <h2 className="mt-2 text-2xl font-semibold text-white">Recurring failure cluster</h2>
            <p className="mt-3 text-sm leading-7 text-white/60">
              Phoenix DC has shown three localization-related incidents after the latest map refresh.
              Prioritize aisle M-14 and charging corridor validations.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <div className="control-chip">Site: Phoenix DC</div>
              <div className="control-chip">Pattern: localization drift</div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
