import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { CompareStrip } from "@/components/compare-strip";
import { getIncident } from "@/lib/store";
import { eventMarkers } from "@/lib/data";

function TimelineCard() {
  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow">Replay Timeline</div>
          <h2 className="mt-2 text-2xl font-semibold text-white">Incident Window 05:48 - 07:18</h2>
        </div>
        <div className="control-chip">Frame sync 33ms</div>
      </div>
      <div className="mt-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#101520_0%,#0a0e15_100%)] px-5 py-6">
        <div className="mb-5 flex flex-wrap gap-2">
          <div className="control-chip">Jump to anomaly</div>
          <div className="control-chip">Overlay commands</div>
          <div className="control-chip">Bookmark frame</div>
        </div>
        <div className="relative h-28">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
          <div className="absolute inset-x-0 top-1/2 h-[46px] -translate-y-1/2 rounded-full border border-white/6 bg-white/[0.015]" />
          <div className="absolute inset-y-3 left-[62%] w-px bg-accent-400/80 shadow-[0_0_18px_rgba(76,242,197,0.65)]" />
          {eventMarkers.map((marker, index) => {
            const positions = ["24%", "48%", "62%", "70%"];
            const tones: Record<string, string> = {
              warning: "bg-warning",
              danger: "bg-danger",
              info: "bg-info",
              accent: "bg-accent-400"
            };
            return (
              <div
                key={marker.id}
                className="absolute top-1 -translate-x-1/2"
                style={{ left: positions[index] }}
              >
                <div className={`mx-auto h-3 w-3 rounded-full ${tones[marker.tone]}`} />
                <div className="mt-4 w-40 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs text-white/70">
                  <div className="font-medium text-white">{marker.label}</div>
                  <div className="mt-1 text-white/45">{marker.timestamp}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/35">
          <span>05:48</span>
          <span>06:12</span>
          <span>06:37</span>
          <span>07:03</span>
          <span>07:18</span>
        </div>
      </div>
    </div>
  );
}

function ComparePane({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="panel p-5">
      <div className="eyebrow">{label}</div>
      <h2 className="mt-2 text-xl font-semibold text-white">{detail}</h2>
      <div className="mt-5 h-72 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#171d29_0%,#0d1017_100%)] p-5">
        <div className="flex h-full items-end rounded-2xl border border-dashed border-white/10 bg-black/10 p-5 text-sm leading-6 text-white/55">
          Placeholder for synchronized camera, telemetry, and log overlays in compare mode.
        </div>
      </div>
    </div>
  );
}

export default async function IncidentComparePage({
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
      title={`Compare: ${incident.title}`}
      subtitle="Contrast the failed run against a healthy baseline and surface the deviations that matter first."
      actions={
        <Link
          href={`/app/incidents/${incidentId}`}
          className="control-chip"
        >
          Back To Replay
        </Link>
      }
    >
      <div className="space-y-5">
        <CompareStrip />
        <div className="grid gap-5 xl:grid-cols-2">
          <ComparePane label="Failed Run" detail={`${incident.robot} | ${incident.detectedAt}`} />
          <ComparePane label="Baseline Run" detail={`${incident.robot} | 2026-04-20 10:18`} />
        </div>
        <TimelineCard />
      </div>
    </AppShell>
  );
}
