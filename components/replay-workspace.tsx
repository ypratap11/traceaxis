"use client";

import { useMemo, useState } from "react";
import { Incident } from "@/lib/types";
import {
  commandTrace,
  eventMarkers,
  inspectorTopics,
  replayBookmarks,
  replayFrames,
  telemetrySignals
} from "@/lib/data";
import { IncidentSummaryCard } from "@/components/incident-summary";

function toneClass(tone: "normal" | "warning" | "info" | "danger") {
  if (tone === "danger") {
    return "border-danger/20 bg-danger/10 text-danger";
  }
  if (tone === "warning") {
    return "border-warning/20 bg-warning/10 text-warning";
  }
  if (tone === "info") {
    return "border-info/20 bg-info/10 text-info";
  }
  return "border-white/10 bg-white/[0.03] text-white/78";
}

export function ReplayWorkspace({ incident }: { incident: Incident }) {
  const [currentIndex, setCurrentIndex] = useState(3);
  const [selectedTopic, setSelectedTopic] = useState(inspectorTopics[0].name);

  const activeFrame = replayFrames[currentIndex] ?? replayFrames[0];
  const activeEvent = eventMarkers[Math.min(currentIndex, eventMarkers.length - 1)] ?? eventMarkers[0];
  const activeTrace = commandTrace[Math.min(currentIndex, commandTrace.length - 1)] ?? commandTrace[0];
  const topic = inspectorTopics.find((item) => item.name === selectedTopic) ?? inspectorTopics[0];

  const signalCards = useMemo(
    () =>
      telemetrySignals.map((signal) => {
        const max = Math.max(...signal.values);
        return { ...signal, max };
      }),
    []
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <div className="panel p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="metric-tile">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">Robot</div>
              <div className="mt-2 text-2xl font-semibold text-white">{incident.robot}</div>
            </div>
            <div className="metric-tile">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">Site</div>
              <div className="mt-2 text-2xl font-semibold text-white">{incident.site}</div>
            </div>
            <div className="metric-tile">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">Version</div>
              <div className="mt-2 text-2xl font-semibold text-white">{incident.softwareVersion}</div>
            </div>
            <div className="metric-tile">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">Active frame</div>
              <div className="mt-2 text-2xl font-semibold text-white">{activeFrame.time}</div>
            </div>
          </div>
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <div>
              <div className="eyebrow">Primary Replay</div>
              <h2 className="mt-2 text-2xl font-semibold text-white">Interactive incident stage</h2>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="control-chip"
                onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
              >
                Prev
              </button>
              <button
                type="button"
                className="control-chip"
                onClick={() =>
                  setCurrentIndex((value) => Math.min(replayFrames.length - 1, value + 1))
                }
              >
                Next
              </button>
              <div className="control-chip-accent">T + {activeFrame.time}</div>
            </div>
          </div>
          <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="border-b border-white/10 p-5 xl:border-b-0 xl:border-r">
              <div className="h-[420px] rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(76,242,197,0.16),transparent_24%),linear-gradient(180deg,#151c29_0%,#090d14_100%)] p-6">
                <div className="flex h-full flex-col justify-between rounded-[22px] border border-dashed border-white/10 bg-black/10 p-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/35">
                    <span>Forward camera</span>
                    <span>{activeFrame.location}</span>
                  </div>
                  <div className="max-w-xl">
                    <div className="text-4xl font-semibold tracking-[-0.04em] text-white">
                      {activeFrame.title}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/58">{activeFrame.narrative}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="control-chip">{activeFrame.primaryMetric}</div>
                    <div className="control-chip">Event: {activeEvent.label}</div>
                    <div className="control-chip">Trace: {activeTrace.label}</div>
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {replayBookmarks.map((bookmark) => (
                  <button
                    key={bookmark.time}
                    type="button"
                    onClick={() =>
                      setCurrentIndex(
                        Math.max(
                          0,
                          replayFrames.findIndex((frame) => frame.time >= bookmark.time)
                        )
                      )
                    }
                    className="text-left rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 transition hover:border-accent-500/25"
                  >
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">
                      {bookmark.owner}
                    </div>
                    <div className="mt-2 text-base font-semibold text-white">{bookmark.title}</div>
                    <div className="mt-3 font-mono text-sm text-accent-400">{bookmark.time}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              <div className="eyebrow">Control Trace</div>
              <h3 className="mt-2 text-xl font-semibold text-white">Commands and transitions</h3>
              <div className="mt-5 space-y-3">
                {commandTrace.map((item) => (
                  <button
                    key={`${item.time}_${item.label}`}
                    type="button"
                    onClick={() =>
                      setCurrentIndex(
                        Math.max(
                          0,
                          replayFrames.findIndex((frame) => frame.time >= item.time)
                        )
                      )
                    }
                    className={`block w-full rounded-[22px] border px-4 py-3 text-left transition hover:border-accent-500/30 ${toneClass(item.tone)}`}
                  >
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em]">
                      <span>{item.label}</span>
                      <span className="font-mono">{item.time}</span>
                    </div>
                    <div className="mt-2 text-base font-semibold">{item.value}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow">Replay Timeline</div>
              <h2 className="mt-2 text-2xl font-semibold text-white">Scrub incident progression</h2>
            </div>
            <div className="control-chip">Selected event {activeEvent.timestamp}</div>
          </div>
          <div className="mt-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#101520_0%,#0a0e15_100%)] px-5 py-6">
            <input
              type="range"
              min={0}
              max={replayFrames.length - 1}
              value={currentIndex}
              onChange={(event) => setCurrentIndex(Number(event.target.value))}
              className="w-full accent-[#4cf2c5]"
            />
            <div className="mt-6 grid gap-3 md:grid-cols-5">
              {replayFrames.map((frame, index) => {
                const active = index === currentIndex;
                return (
                  <button
                    key={frame.time}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`rounded-[20px] border px-3 py-3 text-left transition ${
                      active
                        ? "border-accent-500/35 bg-accent-500/10"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20"
                    }`}
                  >
                    <div className="font-mono text-xs text-accent-400">{frame.time}</div>
                    <div className="mt-2 text-sm font-medium text-white">{frame.title}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow">Signals</div>
              <h2 className="mt-2 text-2xl font-semibold text-white">Telemetry synchronized to cursor</h2>
            </div>
            <div className="control-chip">Cursor {activeFrame.time}</div>
          </div>
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {signalCards.map((signal) => (
              <div
                key={signal.label}
                className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{signal.label}</span>
                  <span className="font-mono text-xs text-white/45">
                    {signal.values[currentIndex] ?? signal.values.at(-1)}
                  </span>
                </div>
                <div className="mb-4 text-[11px] uppercase tracking-[0.22em] text-white/32">
                  Sample aligned to selected frame
                </div>
                <div className="flex h-24 items-end gap-2">
                  {signal.values.map((value, index) => (
                    <button key={`${signal.label}_${index}`} type="button" className="flex-1" onClick={() => setCurrentIndex(index)}>
                      <div
                        className={`rounded-t-full shadow-[0_0_18px_rgba(255,255,255,0.06)] ${
                          index === currentIndex ? "ring-2 ring-white/60" : ""
                        }`}
                        style={{
                          height: `${Math.max((value / signal.max) * 100, 6)}%`,
                          backgroundColor: signal.color,
                          opacity: index >= signal.values.length - 3 || index === currentIndex ? 1 : 0.72
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="panel p-5">
          <div className="eyebrow">Event Stream</div>
          <h2 className="mt-2 text-2xl font-semibold text-white">Anomalies and transitions</h2>
          <div className="mt-5 space-y-3">
            {eventMarkers.map((marker, index) => {
              const tones: Record<string, string> = {
                warning: "bg-warning/15 text-warning border-warning/20",
                danger: "bg-danger/15 text-danger border-danger/20",
                info: "bg-info/15 text-info border-info/20",
                accent: "bg-accent-500/15 text-accent-400 border-accent-500/20"
              };

              const active = Math.min(currentIndex, eventMarkers.length - 1) === index;

              return (
                <button
                  key={marker.id}
                  type="button"
                  onClick={() => setCurrentIndex(Math.min(index + 1, replayFrames.length - 1))}
                  className={`block w-full rounded-[22px] border px-4 py-3 text-left transition hover:border-accent-500/30 ${tones[marker.tone]} ${
                    active ? "ring-2 ring-white/35" : ""
                  }`}
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{marker.label}</span>
                    <span className="font-mono">{marker.timestamp}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="panel p-5">
          <div className="eyebrow">Run Metadata</div>
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/45">Robot</span>
              <span className="font-medium text-white">{incident.robot}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/45">Site</span>
              <span className="font-medium text-white">{incident.site}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/45">Version</span>
              <span className="font-medium text-white">{incident.softwareVersion}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/45">Selected frame</span>
              <span className="font-medium text-white">{activeFrame.time}</span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <div className="control-chip">Cause: {incident.failureType}</div>
            <div className="control-chip">Status: {incident.status}</div>
          </div>
        </div>

        <div className="panel p-5">
          <div className="eyebrow">Inspector</div>
          <h2 className="mt-2 text-2xl font-semibold text-white">Pinned topics</h2>
          <div className="mt-5 space-y-3">
            {inspectorTopics.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => setSelectedTopic(item.name)}
                className={`block w-full rounded-[22px] border px-4 py-4 text-left transition ${
                  selectedTopic === item.name
                    ? "border-accent-500/35 bg-accent-500/10"
                    : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="font-mono text-sm text-white">{item.name}</div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-accent-400">{item.state}</div>
                </div>
                <div className="mt-2 text-sm text-white/45">{item.detail}</div>
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/36">Preview</div>
            <div className="mt-3 font-mono text-sm text-white/72">{topic.preview}</div>
          </div>
        </div>

        <IncidentSummaryCard />
      </div>
    </div>
  );
}
