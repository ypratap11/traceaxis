import type { EventMarker, TimelineSignal } from "@/lib/types";

export type Severity = "ok" | "warn" | "err" | "info";

export type ScrubEvent = {
  id: string;
  label: string;
  ms: number;
  severity: Severity;
};

const TONE_TO_SEVERITY: Record<EventMarker["tone"], Severity> = {
  info: "info",
  warning: "warn",
  danger: "err",
  accent: "ok"
};

export function parseClockToMs(clock: string): number {
  if (!clock) return 0;
  const [mmss, millis = "0"] = clock.split(".");
  const [mm, ss] = mmss.split(":");
  const minutes = Number(mm) || 0;
  const seconds = Number(ss) || 0;
  const ms = Number(millis.padEnd(3, "0").slice(0, 3)) || 0;
  return minutes * 60_000 + seconds * 1000 + ms;
}

export function toScrubberEvents(markers: EventMarker[]): ScrubEvent[] {
  return markers.map((m) => ({
    id: m.id,
    label: m.label,
    ms: parseClockToMs(m.timestamp),
    severity: TONE_TO_SEVERITY[m.tone]
  }));
}

export function inferDurationMs(events: ScrubEvent[]): number {
  if (events.length === 0) return 1000;
  const max = Math.max(...events.map((e) => e.ms));
  return Math.round(max * 1.05);
}

export function cursorIndexFor(ratio: number, length: number): number {
  if (length <= 0) return 0;
  const clamped = Math.min(1, Math.max(0, ratio));
  return Math.min(length - 1, Math.round(clamped * (length - 1)));
}

export function signalCursorIndex(
  currentMs: number,
  durationMs: number,
  signal: TimelineSignal
): number {
  return cursorIndexFor(
    currentMs / Math.max(durationMs, 1),
    signal.values.length
  );
}
