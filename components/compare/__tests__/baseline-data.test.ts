import { describe, it, expect } from "vitest";
import {
  buildBaselineEvents,
  buildBaselineSignals,
  buildCompareDiffs
} from "@/components/compare/baseline-data";
import { telemetrySignals } from "@/lib/data";

describe("buildBaselineEvents", () => {
  it("returns mission start and complete only (no warn/err)", () => {
    const events = buildBaselineEvents();
    expect(events.length).toBe(2);
    expect(events[0].severity).toBe("info");
    expect(events[events.length - 1].severity).toBe("ok");
    expect(events.some((e) => e.severity === "warn")).toBe(false);
    expect(events.some((e) => e.severity === "err")).toBe(false);
  });
});

describe("buildBaselineSignals", () => {
  it("mirrors the labels of the primary telemetrySignals", () => {
    const baseline = buildBaselineSignals();
    const names = baseline.map((b) => b.label);
    expect(names).toEqual(telemetrySignals.map((s) => s.label));
  });

  it("flattens localization values so they stay above 0.8", () => {
    const baseline = buildBaselineSignals();
    const loc = baseline.find((b) =>
      b.label.toLowerCase().includes("localization")
    );
    expect(loc).toBeDefined();
    expect(Math.min(...(loc as { values: number[] }).values)).toBeGreaterThanOrEqual(80);
  });
});

describe("buildCompareDiffs", () => {
  it("returns at least three diffs with worse='left' on the failed-run advantage cases", () => {
    const diffs = buildCompareDiffs();
    expect(diffs.length).toBeGreaterThanOrEqual(3);
    expect(diffs.some((d) => d.worse === "left")).toBe(true);
  });
});
