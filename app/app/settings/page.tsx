import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/primitives/panel";

const workspaceDefaults = [
  "Default timezone: America/Los_Angeles",
  "Preferred baseline selection: same robot, same route, previous healthy run"
];

const eventTaxonomy = [
  "E-stop, localization loss, planner timeout, network disconnect, battery sag",
  "Future hook: custom parsers and workspace-specific event rules"
];

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      subtitle="Configure workspace defaults, ingestion behavior, and how TraceAxis interprets common event markers."
      crumbs={["Settings"]}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel eyebrow="Workspace defaults" bodyClassName="space-y-3">
          {workspaceDefaults.map((item) => (
            <div
              key={item}
              className="rounded-sm border border-line bg-surface-1 px-3 py-2 text-sm text-ink-1"
            >
              {item}
            </div>
          ))}
        </Panel>
        <Panel eyebrow="Event taxonomy" bodyClassName="space-y-3">
          {eventTaxonomy.map((item) => (
            <div
              key={item}
              className="rounded-sm border border-line bg-surface-1 px-3 py-2 text-sm text-ink-1"
            >
              {item}
            </div>
          ))}
        </Panel>
      </div>
    </AppShell>
  );
}
