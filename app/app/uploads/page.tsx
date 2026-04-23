import { AppShell } from "@/components/app-shell";

export default function UploadsPage() {
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
      <div className="panel p-5">
        <div className="eyebrow">Ingestion Queue</div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="kpi">
            <div className="text-sm text-white/45">Queued</div>
            <div className="mt-2 text-3xl font-semibold text-white">02</div>
          </div>
          <div className="kpi">
            <div className="text-sm text-white/45">Processing</div>
            <div className="mt-2 text-3xl font-semibold text-white">01</div>
          </div>
          <div className="kpi">
            <div className="text-sm text-white/45">Ready</div>
            <div className="mt-2 text-3xl font-semibold text-white">18</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
