"use client";

import type { KeyboardEvent, MouseEvent } from "react";

export type ScrubberEvent = {
  id: string;
  label: string;
  ms: number;
  severity: "ok" | "warn" | "err" | "info";
};

type Props = {
  events: ScrubberEvent[];
  currentMs: number;
  durationMs: number;
  onSeek: (ms: number) => void;
  onPlayToggle?: () => void;
  isPlaying?: boolean;
  label?: string;
};

const sevColor: Record<ScrubberEvent["severity"], string> = {
  ok: "var(--ok)",
  warn: "var(--warn)",
  err: "var(--err)",
  info: "var(--info)"
};

function fmt(ms: number) {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const millis = Math.floor(ms % 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}.${String(millis).padStart(3, "0")}`;
}

const KEY_STEP_MS = 100;

export function Scrubber({
  events,
  currentMs,
  durationMs,
  onSeek,
  onPlayToggle,
  isPlaying = false,
  label = "Mission timeline"
}: Props) {
  const safeDuration = Math.max(durationMs, 1);
  const progressPct = Math.min(100, Math.max(0, (currentMs / safeDuration) * 100));

  const seekClamped = (ms: number) => {
    onSeek(Math.max(0, Math.min(safeDuration, ms)));
  };

  const handleTrackClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.round(ratio * safeDuration));
  };

  const handleTrackKey = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        seekClamped(currentMs - KEY_STEP_MS);
        return;
      case "ArrowRight":
        e.preventDefault();
        seekClamped(currentMs + KEY_STEP_MS);
        return;
      case "Home":
        e.preventDefault();
        onSeek(0);
        return;
      case "End":
        e.preventDefault();
        onSeek(safeDuration);
        return;
    }
  };

  const axisLabels = Array.from({ length: 5 }, (_, i) =>
    fmt((i / 4) * safeDuration)
  );

  return (
    <div className="rounded-md border border-line bg-surface-1 px-5 py-3.5">
      <div className="mb-2 flex items-center justify-between text-[11px] text-ink-3">
        <span>
          Mission window · {(safeDuration / 1000).toFixed(2)} s ·{" "}
          {events.length} markers
        </span>
        <span className="font-mono text-bloom">T+{fmt(currentMs)}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="previous"
            onClick={() => seekClamped(currentMs - 1000)}
            className="flex h-6 w-6 items-center justify-center rounded-xs border border-line-strong text-ink-1 transition hover:text-ink-0"
          >
            ‹‹
          </button>
          <button
            type="button"
            aria-label={isPlaying ? "pause" : "play"}
            onClick={onPlayToggle}
            className="flex h-6 w-6 items-center justify-center rounded-xs border border-ink-0 bg-ink-0 text-surface-0"
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
          <button
            type="button"
            aria-label="next"
            onClick={() => seekClamped(currentMs + 1000)}
            className="flex h-6 w-6 items-center justify-center rounded-xs border border-line-strong text-ink-1 transition hover:text-ink-0"
          >
            ››
          </button>
        </div>

        <div
          data-scrub-track
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={durationMs}
          aria-valuenow={currentMs}
          aria-valuetext={`T+${fmt(currentMs)}`}
          onClick={handleTrackClick}
          onKeyDown={handleTrackKey}
          className="relative h-9 flex-1 cursor-pointer select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-bloom"
        >
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
          <div
            className="pointer-events-none absolute left-0 top-1/2 h-px -translate-y-1/2 rounded-full shadow-bloom"
            style={{
              width: `${progressPct}%`,
              background:
                "linear-gradient(90deg, rgba(255,159,80,0) 0%, var(--data-bloom) 100%)"
            }}
          />
          {events.map((evt) => {
            const left = (evt.ms / safeDuration) * 100;
            return (
              <button
                key={evt.id}
                type="button"
                data-event-marker
                data-severity={evt.severity}
                aria-label={evt.label}
                onClick={(e) => {
                  e.stopPropagation();
                  onSeek(evt.ms);
                }}
                className="absolute top-1/2 flex h-full w-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-transparent"
                style={{ left: `${left}%` }}
              >
                <span
                  aria-hidden="true"
                  className="block h-3.5 w-px"
                  style={{
                    background: sevColor[evt.severity],
                    boxShadow: `0 0 6px ${sevColor[evt.severity]}`
                  }}
                />
              </button>
            );
          })}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bloom shadow-bloom-strong"
            style={{ left: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="mt-2 flex justify-between pl-[92px] font-mono text-[10px] text-ink-3">
        {axisLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
