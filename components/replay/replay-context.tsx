"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { ScrubEvent } from "@/lib/replay-data";

type ReplayContextValue = {
  currentMs: number;
  durationMs: number;
  events: ScrubEvent[];
  isPlaying: boolean;
  seek: (ms: number) => void;
  togglePlay: () => void;
};

const ReplayContext = createContext<ReplayContextValue | null>(null);

type Props = {
  events: ScrubEvent[];
  durationMs: number;
  initialMs?: number;
  children: ReactNode;
};

export function ReplayProvider({
  events,
  durationMs,
  initialMs = 0,
  children
}: Props) {
  const [currentMs, setCurrentMs] = useState(initialMs);
  const [isPlaying, setIsPlaying] = useState(false);

  const seek = useCallback(
    (ms: number) => {
      setCurrentMs(Math.max(0, Math.min(durationMs, ms)));
    },
    [durationMs]
  );

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  const value = useMemo<ReplayContextValue>(
    () => ({ currentMs, durationMs, events, isPlaying, seek, togglePlay }),
    [currentMs, durationMs, events, isPlaying, seek, togglePlay]
  );

  return (
    <ReplayContext.Provider value={value}>{children}</ReplayContext.Provider>
  );
}

export function useReplay(): ReplayContextValue {
  const ctx = useContext(ReplayContext);
  if (!ctx) {
    throw new Error("useReplay must be used inside a <ReplayProvider>");
  }
  return ctx;
}
