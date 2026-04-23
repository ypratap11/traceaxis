import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";

const productPoints = [
  "Replay the exact failure across video, telemetry, logs, and robot state.",
  "Jump straight to anomaly markers instead of reconstructing incidents by hand.",
  "Compare failed runs against healthy baselines without writing ad hoc scripts."
];

const workflowSteps = [
  "Upload a failed run from a ROS bag or structured log archive.",
  "Open a synchronized timeline with event markers and aligned telemetry.",
  "Bookmark the failure moment, compare against a healthy run, and share the report."
];

export default function HomePage() {
  return (
    <MarketingShell>
      <main className="mx-auto mt-8 max-w-7xl space-y-8">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="panel p-8 sm:p-10">
            <div className="eyebrow">TraceAxis</div>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold leading-tight text-white sm:text-6xl">
              Find robot failures faster.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60">
              Incident replay for robotics teams. TraceAxis turns ROS bags and robot logs into a
              synchronized investigation console built for autonomy engineers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/app/incidents"
                className="rounded-full bg-accent-500 px-5 py-3 text-sm font-semibold text-graphite-950 transition hover:bg-accent-400"
              >
                Open Demo App
              </Link>
              <Link
                href="/docs/incident-replay-startup-brief.md"
                className="rounded-full border border-white/10 bg-white/[0.035] px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
              >
                Review Product Brief
              </Link>
            </div>
          </div>
          <div className="panel p-8">
            <div className="eyebrow">Why It Matters</div>
            <div className="mt-5 grid gap-4">
              <div className="kpi">
                <div className="text-sm text-white/45">Investigation time</div>
                <div className="mt-2 text-3xl font-semibold text-white">Hours to minutes</div>
              </div>
              <div className="kpi">
                <div className="text-sm text-white/45">Primary workflow</div>
                <div className="mt-2 text-2xl font-semibold text-white">Replay, compare, report</div>
              </div>
              <div className="kpi">
                <div className="text-sm text-white/45">Best fit</div>
                <div className="mt-2 text-2xl font-semibold text-white">ROS-based robotics teams</div>
              </div>
            </div>
          </div>
        </section>

        <section id="product" className="grid gap-6 lg:grid-cols-3">
          {productPoints.map((point, index) => (
            <div key={point} className="panel p-6">
              <div className="eyebrow">0{index + 1}</div>
              <p className="mt-4 text-lg leading-7 text-white/80">{point}</p>
            </div>
          ))}
        </section>

        <section id="workflow" className="panel p-8">
          <div className="eyebrow">Workflow</div>
          <h2 className="mt-3 text-3xl font-semibold text-white">A debugging console, not just a file viewer</h2>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <div className="text-sm uppercase tracking-[0.22em] text-accent-400">Step 0{index + 1}</div>
                <p className="mt-4 text-sm leading-6 text-white/60">{step}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
