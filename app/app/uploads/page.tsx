import { AppShell } from "@/components/app-shell";
import { UploadForm } from "@/components/upload-form";
import { listUploads } from "@/lib/store";

export default async function UploadsPage() {
  const uploads = await listUploads();

  return (
    <AppShell
      title="Run Uploads"
      subtitle="Manage ingestion jobs for ROS bags and structured log archives before they become replayable incidents."
      actions={
        <button className="rounded-full bg-accent-500 px-4 py-2.5 text-sm font-semibold text-graphite-950">
          New Upload
        </button>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <UploadForm />
        <div className="space-y-5">
          <div className="panel p-5">
            <div className="eyebrow">Ingestion Queue</div>
            <div className="mt-5 grid gap-4">
              <div className="kpi">
                <div className="text-sm text-white/45">Queued</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {uploads.filter((upload) => upload.status === "queued").length
                    .toString()
                    .padStart(2, "0")}
                </div>
              </div>
              <div className="kpi">
                <div className="text-sm text-white/45">Processing</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {uploads.filter((upload) => upload.status === "processing").length
                    .toString()
                    .padStart(2, "0")}
                </div>
              </div>
              <div className="kpi">
                <div className="text-sm text-white/45">Ready</div>
                <div className="mt-2 text-3xl font-semibold text-white">
                  {uploads.filter((upload) => upload.status === "ready").length
                    .toString()
                    .padStart(2, "0")}
                </div>
              </div>
            </div>
          </div>
          <div className="panel p-5">
            <div className="eyebrow">Recent Uploads</div>
            <div className="mt-4 space-y-3">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3"
                >
                  <div className="text-sm font-medium text-white">{upload.sourceName}</div>
                  <div className="mt-1 text-sm text-white/45">
                    {upload.robot} | {upload.site} | {upload.failureType}
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-accent-400">
                    {upload.status} | {upload.createdAt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
