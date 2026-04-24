"use client";

import { useMemo } from "react";
import { Scrubber } from "@/components/primitives/scrubber";
import { DiffStrip } from "@/components/primitives/diff-strip";
import { ReplayProvider, useReplay } from "@/components/replay/replay-context";
import { VideoPane } from "@/components/replay/video-pane";
import { EventStream } from "@/components/replay/event-stream";
import { TelemetryRow } from "@/components/replay/telemetry-row";
import { Panel } from "@/components/primitives/panel";
import { eventMarkers, telemetrySignals } from "@/lib/data";
import { inferDurationMs, toScrubberEvents } from "@/lib/replay-data";
import {
  buildBaselineEvents,
  buildBaselineSignals,
  buildCompareDiffs
} from "@/components/compare/baseline-data";
import type { Incident } from "@/lib/types";

function fmtClock(ms: number) {
  const total = ms / 1000;
  const minutes = Math.floor(total / 60);
  const seconds = Math.floor(total % 60);
  const millis = Math.floor(ms % 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

function CompareInner({ incident }: { incident: Incident }) {
  const { currentMs, durationMs, events, isPlaying, seek, togglePlay } =
    useReplay();
  const cursorRatio = currentMs / Math.max(durationMs, 1);

  const primarySignals = telemetrySignals.map((s) => ({
    label: s.label,
    values: s.values
  }));
  // Abbreviate baseline labels so they don't collide with primary-side sparkline labels
  // in DOM queries (e.g., "Localization Confidence" → "Loc. Confidence [B]").
  const baselineSignals = buildBaselineSignals().map((s) => ({
    ...s,
    label: s.label
      .replace(/Localization/i, "Loc.")
      .replace(/Confidence/i, "Conf.")
      .replace(/Battery/i, "Batt.")
      .replace(/Voltage/i, "V.")
      .replace(/Velocity/i, "Vel.")
      .replace(/Command/i, "Cmd.")
  }));
  const baselineEvents = useMemo(() => buildBaselineEvents(), []);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-line px-6 py-4">
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
          Compare · {incident.id}
        </div>
        <h1 className="mt-1 text-lg font-semibold tracking-[-0.01em] text-ink-0">
          {incident.title}
        </h1>
        <div className="mt-3">
          <DiffStrip diffs={buildCompareDiffs()} />
        </div>
      </header>
      <div className="grid min-h-0 flex-1 gap-3 overflow-auto px-3 py-3 lg:grid-cols-2">
        <section className="flex min-h-0 flex-col gap-3">
          <Panel
            eyebrow="Failed run"
            title={`${incident.robot} · ${incident.detectedAt}`}
            bodyClassName="p-0"
          >
            <div className="p-3">
              <VideoPane
                label="Forward camera"
                source="/camera/front · 30 fps"
                frame="frame 372 / 387"
                timestamp={fmtClock(currentMs)}
              />
            </div>
          </Panel>
          <EventStream events={events} currentMs={currentMs} onSeek={seek} />
          <TelemetryRow signals={primarySignals} cursorRatio={cursorRatio} />
        </section>
        <section className="flex min-h-0 flex-col gap-3">
          <Panel
            eyebrow="Baseline"
            title={`${incident.robot} · 2026-04-20 10:18`}
            bodyClassName="p-0"
          >
            <div className="p-3">
              <VideoPane
                label="Forward camera"
                source="/camera/front · 30 fps · ref"
                frame="frame 372 / 387"
                timestamp={fmtClock(currentMs)}
              />
            </div>
          </Panel>
          <EventStream
            events={baselineEvents}
            currentMs={currentMs}
            onSeek={seek}
          />
          <TelemetryRow signals={baselineSignals} cursorRatio={cursorRatio} />
        </section>
      </div>
      <div className="border-t border-line bg-surface-0 px-5 py-3">
        <Scrubber
          events={events}
          currentMs={currentMs}
          durationMs={durationMs}
          isPlaying={isPlaying}
          onSeek={seek}
          onPlayToggle={togglePlay}
          label="Compare timeline"
        />
      </div>
    </div>
  );
}

export function CompareBody({ incident }: { incident: Incident }) {
  const events = useMemo(() => toScrubberEvents(eventMarkers), []);
  const durationMs = useMemo(() => inferDurationMs(events), [events]);

  return (
    <ReplayProvider events={events} durationMs={durationMs}>
      <CompareInner incident={incident} />
    </ReplayProvider>
  );
}
