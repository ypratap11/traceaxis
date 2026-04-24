"use client";

import { useMemo } from "react";
import { Scrubber } from "@/components/primitives/scrubber";
import { ReplayProvider, useReplay } from "@/components/replay/replay-context";
import { IncidentHeader } from "@/components/replay/incident-header";
import { VideoPane } from "@/components/replay/video-pane";
import { EventStream } from "@/components/replay/event-stream";
import { TelemetryRow } from "@/components/replay/telemetry-row";
import { TopicInspectorPanel } from "@/components/replay/topic-inspector-panel";
import { RobotStateGrid } from "@/components/replay/robot-state-grid";
import {
  eventMarkers,
  inspectorTopics,
  telemetrySignals
} from "@/lib/data";
import { inferDurationMs, toScrubberEvents } from "@/lib/replay-data";
import type { Incident } from "@/lib/types";

function fmtClock(ms: number) {
  const total = ms / 1000;
  const minutes = Math.floor(total / 60);
  const seconds = Math.floor(total % 60);
  const millis = Math.floor(ms % 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

function ReplayBody({ incident }: { incident: Incident }) {
  const { currentMs, durationMs, events, isPlaying, seek, togglePlay } =
    useReplay();
  const cursorRatio = currentMs / Math.max(durationMs, 1);

  const signals = telemetrySignals.map((s) => ({
    label: s.label,
    values: s.values
  }));

  const topics = inspectorTopics.map((t, idx) => ({
    name: t.name,
    type: t.detail,
    samples: 100 + idx * 50,
    pinned: t.state === "watch"
  }));

  const stateCells = [
    { k: "mode", v: "autonomous" },
    { k: "planner", v: incident.failureType.toLowerCase() },
    { k: "x", v: "14.382" },
    { k: "y", v: "-3.114" },
    { k: "θ", v: "1.572" },
    { k: "battery", v: "23.4 V" }
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <IncidentHeader
        incident={{
          id: incident.id,
          title: incident.title,
          detectedAt: incident.detectedAt,
          robot: incident.robot,
          site: incident.site,
          softwareVersion: incident.softwareVersion,
          duration: incident.duration,
          severity: incident.severity,
          failureType: incident.failureType
        }}
      />
      <div className="grid min-h-0 flex-1 gap-3 overflow-auto px-3 py-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="grid min-h-0 gap-3 lg:grid-cols-[1.4fr_1fr]">
            <VideoPane
              label="Forward camera"
              source="/camera/front · 30 fps"
              frame="frame 372 / 387"
              timestamp={fmtClock(currentMs)}
            />
            <EventStream events={events} currentMs={currentMs} onSeek={seek} />
          </div>
          <TelemetryRow signals={signals} cursorRatio={cursorRatio} />
        </div>
        <aside className="flex min-h-0 flex-col gap-3">
          <TopicInspectorPanel topics={topics} />
          <RobotStateGrid cells={stateCells} />
        </aside>
      </div>
      <div className="border-t border-line bg-surface-0 px-5 py-3">
        <Scrubber
          events={[]}
          currentMs={currentMs}
          durationMs={durationMs}
          isPlaying={isPlaying}
          onSeek={seek}
          onPlayToggle={togglePlay}
        />
      </div>
    </div>
  );
}

export function ReplayWorkspace({ incident }: { incident: Incident }) {
  const events = useMemo(() => toScrubberEvents(eventMarkers), []);
  const durationMs = useMemo(() => inferDurationMs(events), [events]);

  return (
    <ReplayProvider events={events} durationMs={durationMs}>
      <ReplayBody incident={incident} />
    </ReplayProvider>
  );
}
