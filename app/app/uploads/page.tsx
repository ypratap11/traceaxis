import { AppShell } from "@/components/app-shell";
import { UploadRow } from "@/components/uploads/upload-row";
import { MetricTile } from "@/components/primitives/metric-tile";
import { Panel } from "@/components/primitives/panel";
import { listUploads } from "@/lib/store";

export default async function UploadsPage() {
  const uploads = await listUploads();

  const countQueued = uploads.filter((u) => u.status === "queued").length;
  const countProcessing = uploads.filter((u) => u.status === "processing").length;
  const countReady = uploads.filter((u) => u.status === "ready").length;

  return (
    <AppShell
      title="Run Uploads"
      subtitle="Upload ROS bags or structured log archives. Each upload is parsed into a replayable incident."
      crumbs={["Uploads"]}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <SampleUploadSeeder />
          <Panel eyebrow="Recent uploads" bodyClassName="p-0">
            {uploads.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-ink-3">
                No uploads yet.
              </div>
            ) : (
              <ul>
                {uploads.map((upload) => (
                  <li key={upload.id}>
                    <UploadRow upload={upload} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
        <aside className="space-y-3">
          <MetricTile label="Queued" value={String(countQueued).padStart(2, "0")} />
          <MetricTile
            label="Processing"
            value={String(countProcessing).padStart(2, "0")}
          />
          <MetricTile label="Ready" value={String(countReady).padStart(2, "0")} />
        </aside>
      </div>
    </AppShell>
  );
}

// Until real file ingestion exists, this form explicitly creates
// a sample upload and linked incident. It should not pretend to pick a file.
function SampleUploadSeeder() {
  return (
    <form action="/api/uploads" method="post">
      <input type="hidden" name="title" value="New upload" />
      <input type="hidden" name="robot" value="AX-31" />
      <input type="hidden" name="site" value="Dallas Pilot" />
      <input type="hidden" name="failureType" value="Planner Timeout" />
      <input type="hidden" name="sourceName" value="ax31-dallas-placeholder.bag" />
      <input type="hidden" name="softwareVersion" value="v0.9.15" />
      <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line-strong bg-surface-1 px-6 py-12 text-center">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong text-ink-2"
        >
          S
        </div>
        <div className="text-sm font-medium text-ink-0">Seed a sample upload</div>
        <div className="max-w-md text-xs leading-5 text-ink-3">
          Creates a placeholder incident using sample metadata until real file ingestion is wired.
        </div>
        <button
          type="submit"
          className="mt-2 rounded-xs bg-ink-0 px-3 py-1.5 text-xs font-semibold text-surface-0"
        >
          Create sample incident
        </button>
      </div>
    </form>
  );
}
