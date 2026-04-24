import { telemetrySignals } from "@/lib/data";
import type { ScrubEvent } from "@/lib/replay-data";
import type { Diff } from "@/components/primitives/diff-strip";

export function buildBaselineEvents(): ScrubEvent[] {
  return [
    { id: "base_start", label: "Mission start", ms: 0, severity: "info" },
    {
      id: "base_complete",
      label: "Mission complete",
      ms: 7 * 60 * 1000,
      severity: "ok"
    }
  ];
}

export function buildBaselineSignals() {
  return telemetrySignals.map((signal) => {
    const label = signal.label.toLowerCase();
    if (label.includes("localization")) {
      return {
        label: signal.label,
        values: signal.values.map(() => 90)
      };
    }
    if (label.includes("battery")) {
      return {
        label: signal.label,
        values: signal.values.map((v) => Math.max(v + 2, v))
      };
    }
    if (label.includes("velocity")) {
      return {
        label: signal.label,
        values: signal.values.map(() => 0.6)
      };
    }
    return { label: signal.label, values: [...signal.values] };
  });
}

export function buildCompareDiffs(): Diff[] {
  return [
    {
      label: "Localization drift",
      delta: "−32% lower",
      worse: "left"
    },
    {
      label: "cmd_vel",
      delta: "dropped 2.4 s earlier",
      worse: "left"
    },
    {
      label: "Planner recovery",
      delta: "11.8 s longer",
      worse: "left"
    },
    {
      label: "Battery",
      delta: "stable in both",
      worse: "none"
    }
  ];
}
