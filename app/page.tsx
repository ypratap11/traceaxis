import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { Panel } from "@/components/primitives/panel";
import { ScrubberHero } from "@/components/marketing/scrubber-hero";
import { eventMarkers } from "@/lib/data";
import { inferDurationMs, toScrubberEvents } from "@/lib/replay-data";

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
  const events = toScrubberEvents(eventMarkers);
  const durationMs = inferDurationMs(events);

  return (
    <MarketingShell>
      <main className="mx-auto max-w-7xl space-y-14 px-6 py-16 sm:px-8">
        <section className="space-y-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
            TraceAxis
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink-0 sm:text-6xl">
            Find robot failures faster.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-ink-2">
            Incident replay for robotics teams. TraceAxis turns ROS bags and robot
            logs into a synchronized investigation console built for autonomy
            engineers.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href="/app/incidents"
              className="rounded-xs bg-ink-0 px-4 py-2 text-xs font-semibold text-surface-0"
            >
              View sample incident
            </Link>
            <Link
              href="/app/incidents"
              className="rounded-xs border border-line-strong px-4 py-2 text-xs font-medium text-ink-1 transition hover:border-ink-3 hover:text-ink-0"
            >
              Book demo
            </Link>
          </div>
        </section>

        <section className="space-y-3" id="hero-animation">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
            Live sample
          </div>
          <ScrubberHero events={events} durationMs={durationMs} />
          <p className="max-w-2xl text-xs leading-6 text-ink-3">
            The same timeline that drives the replay console — playing a sample
            incident end-to-end. Click any marker to seek.
          </p>
        </section>

        <section id="product" className="grid gap-3 lg:grid-cols-3">
          {productPoints.map((point, index) => (
            <Panel key={point} eyebrow={`0${index + 1}`}>
              <p className="text-sm leading-6 text-ink-1">{point}</p>
            </Panel>
          ))}
        </section>

        <section id="workflow" className="space-y-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
            Workflow
          </div>
          <h2 className="max-w-3xl text-2xl font-semibold tracking-[-0.01em] text-ink-0">
            A debugging console, not just a file viewer.
          </h2>
          <div className="grid gap-3 lg:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <Panel key={step} eyebrow={`Step 0${index + 1}`}>
                <p className="text-sm leading-6 text-ink-1">{step}</p>
              </Panel>
            ))}
          </div>
        </section>

        <footer className="border-t border-line pt-6 text-xs text-ink-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>TraceAxis · incident replay for robotics teams</span>
            <span className="font-mono">© 2026</span>
          </div>
        </footer>
      </main>
    </MarketingShell>
  );
}
