import { AppShell } from "@/components/app-shell";

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      subtitle="Configure workspace defaults, ingestion behavior, and how TraceAxis interprets common event markers."
    >
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="panel p-5">
          <div className="eyebrow">Workspace Defaults</div>
          <div className="mt-5 space-y-4 text-sm text-white/60">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              Default timezone: America/Los_Angeles
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              Preferred baseline selection: same robot, same route, previous healthy run
            </div>
          </div>
        </div>
        <div className="panel p-5">
          <div className="eyebrow">Event Taxonomy</div>
          <div className="mt-5 space-y-4 text-sm text-white/60">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              E-stop, localization loss, planner timeout, network disconnect, battery sag
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              Future hook: custom parsers and workspace-specific event rules
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
