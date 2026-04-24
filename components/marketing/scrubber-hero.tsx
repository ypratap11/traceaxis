"use client";

import { useEffect, useState } from "react";
import { Scrubber, type ScrubberEvent } from "@/components/primitives/scrubber";

const TICK_MS = 100;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Props = {
  events: ScrubberEvent[];
  durationMs: number;
  initialMs?: number;
  autoPlay?: boolean;
};

export function ScrubberHero({
  events,
  durationMs,
  initialMs = 0,
  autoPlay = true
}: Props) {
  const [currentMs, setCurrentMs] = useState(initialMs);
  const [isPlaying, setIsPlaying] = useState(() => {
    if (!autoPlay) return false;
    return !prefersReducedMotion();
  });

  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setCurrentMs((prev) => {
        const next = prev + TICK_MS;
        if (next >= durationMs) return 0;
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [isPlaying, durationMs]);

  return (
    <Scrubber
      events={events}
      currentMs={currentMs}
      durationMs={durationMs}
      isPlaying={isPlaying}
      onSeek={(ms) => setCurrentMs(Math.max(0, Math.min(durationMs, ms)))}
      onPlayToggle={() => setIsPlaying((p) => !p)}
      label="Sample incident timeline"
    />
  );
}
