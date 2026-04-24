import { describe, it, expect } from "vitest";
import {
  parseClockToMs,
  toScrubberEvents,
  inferDurationMs,
  cursorIndexFor
} from "@/lib/replay-data";

describe("parseClockToMs", () => {
  it("parses MM:SS into ms", () => {
    expect(parseClockToMs("06:12")).toBe(6 * 60 * 1000 + 12 * 1000);
  });

  it("parses MM:SS.mmm into ms", () => {
    expect(parseClockToMs("00:01.500")).toBe(1500);
  });

  it("returns 0 for empty input", () => {
    expect(parseClockToMs("")).toBe(0);
  });
});

describe("toScrubberEvents", () => {
  it("maps tone -> severity and timestamp -> ms", () => {
    const result = toScrubberEvents([
      { id: "a", label: "x", timestamp: "00:01", tone: "warning" },
      { id: "b", label: "y", timestamp: "00:02", tone: "danger" },
      { id: "c", label: "z", timestamp: "00:03", tone: "info" },
      { id: "d", label: "w", timestamp: "00:04", tone: "accent" }
    ]);
    expect(result).toEqual([
      { id: "a", label: "x", ms: 1000, severity: "warn" },
      { id: "b", label: "y", ms: 2000, severity: "err" },
      { id: "c", label: "z", ms: 3000, severity: "info" },
      { id: "d", label: "w", ms: 4000, severity: "ok" }
    ]);
  });
});

describe("inferDurationMs", () => {
  it("returns the largest event ms padded by 5%", () => {
    const events = [
      { id: "a", label: "x", ms: 0, severity: "info" as const },
      { id: "b", label: "y", ms: 10_000, severity: "warn" as const }
    ];
    expect(inferDurationMs(events)).toBe(10_500);
  });

  it("returns a sane minimum when no events", () => {
    expect(inferDurationMs([])).toBe(1000);
  });
});

describe("cursorIndexFor", () => {
  it("returns the index closest to the current ms ratio", () => {
    expect(cursorIndexFor(0, 12)).toBe(0);
    expect(cursorIndexFor(1, 12)).toBe(11);
    expect(cursorIndexFor(0.5, 12)).toBe(6);
  });
});
