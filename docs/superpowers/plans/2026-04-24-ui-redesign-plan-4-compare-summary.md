# UI Redesign — Plan 4: Compare View + Incident Summary

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/app/incidents/[incidentId]/compare` (Compare View) and `/app/incidents/[incidentId]/summary` (Incident Summary) against the Plan 1 design system and Plan 2 primitives. After this plan, all five authenticated screens match the spec — only the Marketing home and legacy CSS strip remain for Plan 5.

**Architecture:** Compare reuses `<ReplayShell>` + `<ReplayProvider>` from Plan 2. Both sides share a single cursor; primary-run events drive the scrubber markers, and each side renders its own `<VideoPane>` + `<EventStream>` + `<TelemetryRow>` wired to the shared cursor. A new `<DiffStrip>` primitive renders the top-of-stage diff chips with sodium accents on the worse side. Summary uses `<AppShell>` — it's a narrative report, not a replay surface — in a narrow centered column composing `<Panel>`, `<EventRow>` (reused for "Key moments"), and simple list renderers for notes and bookmarks. Clicking a key moment deep-links to the Replay Console at that timestamp via `?t=<ms>` (parsed by Replay on mount — small extension to Plan 2's context seeding).

**Tech Stack:** Next 16, React 19 (server + client), Tailwind 3.4, Vitest 4 + React Testing Library 16. Reuses Plan 1 primitives (`Panel`, `KvTag`, `EventRow`, `Sparkline`, `Scrubber`) and Plan 2 components (`ReplayShell`, `ReplayProvider`, `IncidentHeader`, `VideoPane`, `EventStream`, `TelemetryRow`, `TopicInspectorPanel`, `RobotStateGrid`).

**Spec:** `docs/superpowers/specs/2026-04-23-ui-redesign-hybrid-design.md` § 5.5 (Compare) and § 5.6 (Summary).

**Predecessor:** Plans 1, 2, 3 must be on this branch.

---

## File map

**New (primitives):**
- `components/primitives/diff-strip.tsx` — top-of-compare diff chips

**New (compare):**
- `components/compare/baseline-data.ts` — pure helper that mocks a "healthy" baseline from the existing seed data (baseline events list + baseline telemetry variants)
- `components/compare/compare-body.tsx` — client composition: ReplayProvider + diff strip + side-by-side VideoPane + two EventStreams + two TelemetryRows + shared Scrubber

**New (summary):**
- `components/summary/key-moments-list.tsx` — stack of EventRow items that deep-link to `/app/incidents/<id>?t=<ms>`
- `components/summary/summary-body.tsx` — full report composition

**New tests:** one `*.test.tsx` per component above.

**Modified:**
- `app/app/incidents/[incidentId]/compare/page.tsx` — switch from AppShell → ReplayShell + `<CompareBody>`
- `app/app/incidents/[incidentId]/summary/page.tsx` — switch to centered report layout with new sub-components
- `components/replay/replay-context.tsx` — small extension: accept `initialMs` from a server-passed prop (already supported, but Replay page will now read `?t=` query and pass it)
- `app/app/incidents/[incidentId]/page.tsx` — pass `searchParams` through to `<ReplayWorkspace>` so the `?t=<ms>` deep link opens the scrubber at that time

**Deleted:**
- `components/compare-strip.tsx` — superseded by `<DiffStrip>`
- `components/incident-summary.tsx` — superseded by `<SummaryBody>` and its sub-components

---

## Task 1: `<DiffStrip>` primitive

A strip of diff chips across the top of the compare stage. Each chip indicates a metric and a side-relative delta. Worse side gets a sodium-tinted chip.

**Files:**
- Create: `components/primitives/diff-strip.tsx`
- Create: `components/__tests__/diff-strip.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DiffStrip } from "@/components/primitives/diff-strip";

const diffs = [
  { label: "Localization confidence", delta: "-32%", worse: "left" as const },
  { label: "cmd_vel", delta: "dropped 0.4s earlier", worse: "left" as const },
  { label: "Battery", delta: "stable in both", worse: "none" as const }
];

describe("DiffStrip", () => {
  it("renders one chip per diff with label and delta", () => {
    render(<DiffStrip diffs={diffs} />);
    expect(screen.getByText("Localization confidence")).toBeInTheDocument();
    expect(screen.getByText("-32%")).toBeInTheDocument();
    expect(screen.getByText("cmd_vel")).toBeInTheDocument();
    expect(screen.getByText(/dropped 0.4s earlier/)).toBeInTheDocument();
    expect(screen.getByText("Battery")).toBeInTheDocument();
    expect(screen.getByText("stable in both")).toBeInTheDocument();
  });

  it("tints worse-side chips with sodium", () => {
    const { container } = render(<DiffStrip diffs={diffs} />);
    const worseChips = container.querySelectorAll("[data-worse='left']");
    expect(worseChips.length).toBe(2);
    worseChips.forEach((chip) => {
      expect(chip.className).toMatch(/border-bloom|text-bloom/);
    });
  });

  it("renders neutral chips without sodium tint", () => {
    const { container } = render(<DiffStrip diffs={diffs} />);
    const neutralChip = container.querySelector("[data-worse='none']");
    expect(neutralChip).toBeTruthy();
    expect(neutralChip?.className).not.toMatch(/border-bloom/);
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- diff-strip`

- [ ] **Step 3: Write the implementation**

```tsx
export type Diff = {
  label: string;
  delta: string;
  worse: "left" | "right" | "none";
};

type Props = {
  diffs: Diff[];
};

export function DiffStrip({ diffs }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {diffs.map((d) => {
        const isWorse = d.worse !== "none";
        return (
          <span
            key={`${d.label}-${d.delta}`}
            data-worse={d.worse}
            className={`inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 text-[11px] font-medium ${
              isWorse
                ? "border-bloom/40 bg-bloom-soft text-bloom"
                : "border-line-strong text-ink-1"
            }`}
          >
            <span className={isWorse ? "text-bloom" : "text-ink-3"}>
              {d.label}
            </span>
            <span>{d.delta}</span>
          </span>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run, verify PASS 3/3:** `npm run test:run -- diff-strip`

- [ ] **Step 5: Commit:**

```
Add DiffStrip primitive (compare diff chips with sodium on worse side)
```

---

## Task 2: Baseline data helper

A small pure module that derives mock "healthy baseline" data from the existing seed. Not a component — just typed helpers used by `<CompareBody>`. Keeps `lib/data.ts` untouched.

**Files:**
- Create: `components/compare/baseline-data.ts`
- Create: `components/compare/__tests__/baseline-data.test.ts`

Create the `components/compare/` directory if needed.

- [ ] **Step 1: Write the failing test** at `components/compare/__tests__/baseline-data.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  buildBaselineEvents,
  buildBaselineSignals,
  buildCompareDiffs
} from "@/components/compare/baseline-data";
import { eventMarkers, telemetrySignals } from "@/lib/data";

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
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- baseline-data`

- [ ] **Step 3: Write the implementation** at `components/compare/baseline-data.ts`:

```ts
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
      // Healthy baseline: localization stays high.
      return {
        label: signal.label,
        values: signal.values.map(() => 90)
      };
    }
    if (label.includes("battery")) {
      // Baseline battery drains slightly less steeply.
      return {
        label: signal.label,
        values: signal.values.map((v) => Math.max(v + 2, v))
      };
    }
    if (label.includes("velocity")) {
      // Velocity stays close to commanded.
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
      label: "Localization confidence",
      delta: "−32% in failed run",
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
```

- [ ] **Step 4: Run, verify PASS 4/4:** `npm run test:run -- baseline-data`

- [ ] **Step 5: Commit:**

```
Add baseline-data helper (mock healthy baseline for compare view)
```

---

## Task 3: `<CompareBody>` client composition

The actual compare layout: diff strip across the top, two video panes side-by-side, two event streams stacked below each pane, two telemetry rows, and a single shared `<Scrubber>` at the bottom. All time-synchronized through a shared `<ReplayProvider>`.

**Files:**
- Create: `components/compare/compare-body.tsx`
- Create: `components/compare/__tests__/compare-body.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompareBody } from "@/components/compare/compare-body";
import type { Incident } from "@/lib/types";

const incident: Incident = {
  id: "inc_demo",
  title: "Demo incident",
  robot: "AX-99",
  site: "Demo Site",
  severity: "high",
  status: "investigating",
  failureType: "Localization Loss",
  detectedAt: "2026-04-22 19:42",
  softwareVersion: "v0.9.14",
  duration: "12.91 s",
  summary: "Demo summary."
};

describe("CompareBody", () => {
  it("renders the diff strip, both sides, and the shared scrubber", () => {
    const { container } = render(<CompareBody incident={incident} />);
    // diff strip
    expect(screen.getByText(/Localization confidence/i)).toBeInTheDocument();
    // Two video panes — at least two play-preview buttons
    expect(screen.getAllByLabelText(/play preview/i).length).toBe(2);
    // Two event streams — each side labelled
    expect(screen.getByText(/Failed run/i)).toBeInTheDocument();
    expect(screen.getByText(/Baseline/i)).toBeInTheDocument();
    // Shared single scrubber
    expect(screen.getAllByRole("slider").length).toBe(1);
    // Both telemetry rows rendered
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(6);
  });

  it("clicking a failed-run event row moves the shared scrubber", async () => {
    const user = userEvent.setup();
    const { container } = render(<CompareBody incident={incident} />);
    const slider = screen.getByRole("slider");
    const before = slider.getAttribute("aria-valuenow");

    // Scope the click to the FAILED side's event stream list.
    // CompareBody renders two event stream <ul>s; the first one is the
    // failed run by layout order.
    const uls = container.querySelectorAll("ul");
    expect(uls.length).toBeGreaterThanOrEqual(2);
    const failedUl = uls[0] as HTMLElement;
    const rows = failedUl.querySelectorAll("button");
    expect(rows.length).toBeGreaterThan(1);

    await user.click(rows[1]);
    const after = slider.getAttribute("aria-valuenow");
    expect(after).not.toBe(before);
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- compare-body`

- [ ] **Step 3: Write the implementation**

```tsx
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
  const baselineSignals = buildBaselineSignals();
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
                source="/camera/front · 30 fps · baseline"
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
```

- [ ] **Step 4: Run, verify PASS 2/2:** `npm run test:run -- compare-body`

Full suite: `npm run test:run -- --maxWorkers=1` — all pass.

- [ ] **Step 5: Commit:**

```
Add CompareBody (side-by-side compare with shared cursor)
```

---

## Task 4: Wire the compare page + delete old files

**Files:**
- Modify: `app/app/incidents/[incidentId]/compare/page.tsx`
- Delete: `components/compare-strip.tsx`

- [ ] **Step 1: Check for other consumers of `compare-strip`**

```bash
grep -r "from \"@/components/compare-strip\"" --include="*.tsx" --include="*.ts" C:/Pratap/work/robotics/app C:/Pratap/work/robotics/components
```

Expected: only `app/app/incidents/[incidentId]/compare/page.tsx`. If anything else shows up, report BLOCKED.

- [ ] **Step 2: Replace `app/app/incidents/[incidentId]/compare/page.tsx` with:**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReplayShell } from "@/components/replay/replay-shell";
import { CompareBody } from "@/components/compare/compare-body";
import { getIncident } from "@/lib/store";

export default async function IncidentComparePage({
  params
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = await params;
  const incident = await getIncident(incidentId);

  if (!incident) {
    notFound();
  }

  return (
    <ReplayShell
      crumbs={["Incidents", incident.site, incident.id, "Compare"]}
      actions={
        <div className="flex gap-2">
          <Link
            href={`/app/incidents/${incidentId}`}
            className="rounded-xs border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-1 transition hover:border-ink-3 hover:text-ink-0"
          >
            Back to Replay
          </Link>
          <Link
            href={`/app/incidents/${incidentId}/summary`}
            className="rounded-xs bg-ink-0 px-3 py-1.5 text-xs font-semibold text-surface-0"
          >
            Open Summary
          </Link>
        </div>
      }
    >
      <CompareBody incident={incident} />
    </ReplayShell>
  );
}
```

- [ ] **Step 3: Delete `components/compare-strip.tsx`**

```bash
rm C:/Pratap/work/robotics/components/compare-strip.tsx
```

- [ ] **Step 4: Verify**

Run: `npm run build` — expected success.
Run: `npm run test:run -- --maxWorkers=1` — all pass.

Manual check: `npm run dev`, visit `/app/incidents/inc_0423_localization/compare` — should show the new layout (diff strip at top, two panes with VideoPane + EventStream + TelemetryRow, shared scrubber at bottom).

- [ ] **Step 5: Commit**

```bash
git add C:/Pratap/work/robotics/app/app/incidents/\[incidentId\]/compare/page.tsx
git add -u C:/Pratap/work/robotics/components/compare-strip.tsx
```

Message: `Rewire Compare page to ReplayShell + CompareBody, drop old strip`

---

## Task 5: `<KeyMomentsList>` component

A stack of clickable key-moment rows used in the Summary. Each row looks like an `<EventRow>` but, instead of seeking an in-page scrubber, it links to `/app/incidents/<id>?t=<ms>` — the Replay Console reads that query to seed the cursor.

**Files:**
- Create: `components/summary/key-moments-list.tsx`
- Create: `components/summary/__tests__/key-moments-list.test.tsx`

Create the `components/summary/` directory if needed.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KeyMomentsList } from "@/components/summary/key-moments-list";

const events = [
  { id: "a", label: "Localization drift begins", ms: 6000, severity: "warn" as const },
  { id: "b", label: "Mission abort", ms: 12000, severity: "err" as const }
];

describe("KeyMomentsList", () => {
  it("renders one clickable row per event", () => {
    render(<KeyMomentsList incidentId="inc_demo" events={events} />);
    expect(screen.getByText("Localization drift begins")).toBeInTheDocument();
    expect(screen.getByText("Mission abort")).toBeInTheDocument();
  });

  it("links each row to the replay console with ?t=<ms>", () => {
    render(<KeyMomentsList incidentId="inc_demo" events={events} />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute(
      "href",
      "/app/incidents/inc_demo?t=6000"
    );
    expect(links[1]).toHaveAttribute(
      "href",
      "/app/incidents/inc_demo?t=12000"
    );
  });

  it("shows severity dot color matching the severity", () => {
    const { container } = render(
      <KeyMomentsList incidentId="inc_demo" events={events} />
    );
    expect(container.querySelector(".bg-warn")).toBeTruthy();
    expect(container.querySelector(".bg-err")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- key-moments-list`

- [ ] **Step 3: Write the implementation**

```tsx
import Link from "next/link";
import type { ScrubEvent } from "@/lib/replay-data";

function fmt(ms: number) {
  const total = ms / 1000;
  const minutes = Math.floor(total / 60);
  const seconds = Math.floor(total % 60);
  const millis = Math.floor(ms % 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

const sevDot: Record<ScrubEvent["severity"], string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  err: "bg-err",
  info: "bg-info"
};

type Props = {
  incidentId: string;
  events: ScrubEvent[];
};

export function KeyMomentsList({ incidentId, events }: Props) {
  return (
    <ul className="divide-y divide-line">
      {events.map((evt) => (
        <li key={evt.id}>
          <Link
            href={`/app/incidents/${incidentId}?t=${evt.ms}`}
            className="flex items-center justify-between px-4 py-2.5 text-xs transition-colors hover:bg-surface-2/40"
          >
            <span className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-block h-1.5 w-1.5 rounded-full ${sevDot[evt.severity]}`}
              />
              <span className="font-medium text-ink-1">{evt.label}</span>
            </span>
            <span className="font-mono text-ink-3">{fmt(evt.ms)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Run, verify PASS 3/3:** `npm run test:run -- key-moments-list`

- [ ] **Step 5: Commit:**

```
Add KeyMomentsList (summary deep-link rows to replay)
```

---

## Task 6: `<SummaryBody>` component

The full Incident Summary report: narrow centered column, summary header, root-cause paragraph with key-value tags, key moments list, notes list, bookmarks list, export CTA.

**Files:**
- Create: `components/summary/summary-body.tsx`
- Create: `components/summary/__tests__/summary-body.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SummaryBody } from "@/components/summary/summary-body";
import type { Incident } from "@/lib/types";

const incident: Incident = {
  id: "inc_demo",
  title: "Demo incident",
  robot: "AX-99",
  site: "Demo Site",
  severity: "high",
  status: "investigating",
  failureType: "Localization Loss",
  detectedAt: "2026-04-22 19:42",
  softwareVersion: "v0.9.14",
  duration: "12.91 s",
  summary: "Localization degraded before mission abort."
};

describe("SummaryBody", () => {
  it("renders the title, severity badge, and root-cause paragraph", () => {
    render(<SummaryBody incident={incident} />);
    expect(screen.getByText("Demo incident")).toBeInTheDocument();
    expect(screen.getByText(/Localization Loss/)).toBeInTheDocument();
    expect(
      screen.getByText(/Localization degraded before mission abort/)
    ).toBeInTheDocument();
  });

  it("renders a Key Moments section with at least one deep link", () => {
    render(<SummaryBody incident={incident} />);
    expect(screen.getByText(/Key moments/i)).toBeInTheDocument();
    const deepLinks = screen
      .getAllByRole("link")
      .filter((l) => l.getAttribute("href")?.includes("?t="));
    expect(deepLinks.length).toBeGreaterThan(0);
  });

  it("renders a Notes section with author and body text", () => {
    render(<SummaryBody incident={incident} />);
    expect(screen.getByText(/Notes/i)).toBeInTheDocument();
    expect(screen.getByText(/Autonomy Lead/)).toBeInTheDocument();
  });

  it("renders a Bookmarks section", () => {
    render(<SummaryBody incident={incident} />);
    expect(screen.getByText(/Bookmarks/i)).toBeInTheDocument();
  });

  it("renders the Export Report primary button", () => {
    render(<SummaryBody incident={incident} />);
    expect(
      screen.getByRole("button", { name: /export report/i })
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- summary-body`

- [ ] **Step 3: Write the implementation**

```tsx
import { Panel } from "@/components/primitives/panel";
import { KvTag } from "@/components/primitives/kv-tag";
import { SeverityBadge } from "@/components/status-badge";
import { KeyMomentsList } from "@/components/summary/key-moments-list";
import { eventMarkers, incidentNotes, replayBookmarks } from "@/lib/data";
import { toScrubberEvents, parseClockToMs } from "@/lib/replay-data";
import type { Incident } from "@/lib/types";

type Props = {
  incident: Incident;
};

export function SummaryBody({ incident }: Props) {
  const events = toScrubberEvents(eventMarkers);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
          Summary · {incident.id} · {incident.detectedAt}
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink-0">
          {incident.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SeverityBadge severity={incident.severity} />
          <KvTag k="robot" v={incident.robot} />
          <KvTag k="site" v={incident.site} />
          <KvTag k="version" v={incident.softwareVersion} />
          <KvTag k="duration" v={incident.duration} />
          <KvTag k="failure" v={incident.failureType} />
        </div>
      </header>

      <Panel eyebrow="Root-cause hypothesis">
        <p className="text-sm leading-7 text-ink-1">{incident.summary}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <KvTag k="primary" v="landmark occlusion" />
          <KvTag k="secondary" v="map shift near M-14" />
        </div>
      </Panel>

      <Panel eyebrow="Key moments" bodyClassName="p-0">
        <KeyMomentsList incidentId={incident.id} events={events} />
      </Panel>

      <Panel eyebrow="Notes">
        <ul className="space-y-4">
          {incidentNotes.map((note) => (
            <li key={note.id}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-ink-0">{note.author}</span>
                <span className="font-mono text-ink-3">{note.timestamp}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-ink-2">{note.body}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel eyebrow="Bookmarks" bodyClassName="p-0">
        <ul className="divide-y divide-line">
          {replayBookmarks.map((bookmark) => (
            <li
              key={`${bookmark.time}-${bookmark.title}`}
              className="flex items-center justify-between px-4 py-2.5 text-xs"
            >
              <span>
                <span className="font-medium text-ink-1">
                  {bookmark.title}
                </span>
                <span className="ml-2 text-ink-3">· {bookmark.owner}</span>
              </span>
              <span className="font-mono text-ink-3">
                {String(parseClockToMs(bookmark.time))}ms
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-xs bg-ink-0 px-4 py-2 text-xs font-semibold text-surface-0"
        >
          Export Report
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run, verify PASS 5/5:** `npm run test:run -- summary-body`

- [ ] **Step 5: Commit:**

```
Add SummaryBody (narrow-column report with key moments, notes, bookmarks)
```

---

## Task 7: Wire the summary page + delete old files + support `?t=` deep link

Two changes: wire the new SummaryBody into the summary page, and have the Replay Console page read the `?t=<ms>` query param and seed the `<ReplayProvider>` cursor with it.

**Files:**
- Modify: `app/app/incidents/[incidentId]/summary/page.tsx`
- Modify: `app/app/incidents/[incidentId]/page.tsx`
- Modify: `components/replay-workspace.tsx`
- Delete: `components/incident-summary.tsx`

- [ ] **Step 1: Check for other consumers of `incident-summary`**

```bash
grep -r "from \"@/components/incident-summary\"" --include="*.tsx" --include="*.ts" C:/Pratap/work/robotics/app C:/Pratap/work/robotics/components
```

Expected: only `app/app/incidents/[incidentId]/summary/page.tsx`.

- [ ] **Step 2: Replace `app/app/incidents/[incidentId]/summary/page.tsx` with:**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SummaryBody } from "@/components/summary/summary-body";
import { getIncident } from "@/lib/store";

export default async function IncidentSummaryPage({
  params
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = await params;
  const incident = await getIncident(incidentId);

  if (!incident) {
    notFound();
  }

  return (
    <AppShell
      title="Incident summary"
      subtitle="Capture the failure narrative, supporting evidence, and internal notes before sharing the incident."
      crumbs={["Incidents", incident.site, incident.id, "Summary"]}
      actions={
        <Link
          href={`/app/incidents/${incidentId}`}
          className="rounded-xs border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-1 transition hover:border-ink-3 hover:text-ink-0"
        >
          Back to Replay
        </Link>
      }
    >
      <SummaryBody incident={incident} />
    </AppShell>
  );
}
```

- [ ] **Step 3: Modify `components/replay-workspace.tsx` to accept an `initialMs` prop**

Find the exported `ReplayWorkspace` function. Change its signature to accept an optional `initialMs` and thread it into `ReplayProvider`. The full replacement for the exported function (leave the rest of the file alone):

```tsx
export function ReplayWorkspace({
  incident,
  initialMs
}: {
  incident: Incident;
  initialMs?: number;
}) {
  const events = useMemo(() => toScrubberEvents(eventMarkers), []);
  const durationMs = useMemo(() => inferDurationMs(events), [events]);

  return (
    <ReplayProvider
      events={events}
      durationMs={durationMs}
      initialMs={initialMs}
    >
      <ReplayBody incident={incident} />
    </ReplayProvider>
  );
}
```

- [ ] **Step 4: Modify `app/app/incidents/[incidentId]/page.tsx` to read `?t=<ms>` and pass it through**

Replace the current file with:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReplayShell } from "@/components/replay/replay-shell";
import { ReplayWorkspace } from "@/components/replay-workspace";
import { getIncident } from "@/lib/store";

export default async function IncidentDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ incidentId: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { incidentId } = await params;
  const { t } = await searchParams;
  const incident = await getIncident(incidentId);

  if (!incident) {
    notFound();
  }

  const initialMs = t ? Math.max(0, Number.parseInt(t, 10) || 0) : undefined;

  return (
    <ReplayShell
      crumbs={["Incidents", incident.site, incident.id]}
      actions={
        <div className="flex gap-2">
          <Link
            href={`/app/incidents/${incidentId}/compare`}
            className="rounded-xs border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-1 transition hover:border-ink-3 hover:text-ink-0"
          >
            Compare
          </Link>
          <Link
            href={`/app/incidents/${incidentId}/summary`}
            className="rounded-xs bg-ink-0 px-3 py-1.5 text-xs font-semibold text-surface-0"
          >
            Open Summary
          </Link>
        </div>
      }
    >
      <ReplayWorkspace incident={incident} initialMs={initialMs} />
    </ReplayShell>
  );
}
```

- [ ] **Step 5: Delete `components/incident-summary.tsx`**

```bash
rm C:/Pratap/work/robotics/components/incident-summary.tsx
```

- [ ] **Step 6: Verify**

Run: `npm run build` — expected success.
Run: `npm run test:run -- --maxWorkers=1` — all tests pass.

- [ ] **Step 7: Commit**

```bash
git add C:/Pratap/work/robotics/app/app/incidents/\[incidentId\]/summary/page.tsx
git add C:/Pratap/work/robotics/app/app/incidents/\[incidentId\]/page.tsx
git add C:/Pratap/work/robotics/components/replay-workspace.tsx
git add -u C:/Pratap/work/robotics/components/incident-summary.tsx
```

Message:

```
Wire Summary page to SummaryBody; Replay supports ?t=<ms> deep link

Summary uses the new narrow-column report. Key moment rows deep-link
to /app/incidents/<id>?t=<ms>; the Replay Console now reads that
query param and seeds the ReplayProvider cursor with it.

Deletes the old incident-summary component.
```

---

## Task 8: Final verification

- [ ] **Step 1: Full suite:** `npm run test:run -- --maxWorkers=1`
  Expected: Plan 3's 109 tests + Plan 4's new tests (~17) ≈ 126 tests across ~32 files.

- [ ] **Step 2: Build:** `npm run build`
  Expected: all 11 routes compile.

- [ ] **Step 3: Manual UI walkthrough**

Run `npm run dev` and visit:
- `/app/incidents/inc_0423_localization/compare` — new layout: diff strip at top, two panes with sections for Failed run / Baseline side by side, each with VideoPane + EventStream + TelemetryRow, single shared scrubber at the bottom. Clicking an event row (either side) moves the shared cursor.
- `/app/incidents/inc_0423_localization/summary` — narrow centered report: title + severity + tag row, root-cause hypothesis panel, Key Moments (each row deep-links to `?t=<ms>`), Notes, Bookmarks, Export Report button.
- Click a Key Moment row — should navigate to `/app/incidents/inc_0423_localization?t=<some_ms>`. The Replay Console should open with the scrubber cursor already at that timestamp.

- [ ] **Step 4: No commit needed.**

Plan 4 complete.

---

## Self-review

**Spec coverage (§ 5.5 Compare):**
- Same shell as Replay (ReplayShell) → Task 4 ✓
- Diff strip across the top → Task 1 (primitive), used by Task 3 (CompareBody)
- Sodium accents on the worse-performing side → Task 1 ✓
- Stage splits into two video panes side-by-side → Task 3 ✓
- Two event streams stacked → Task 3 ✓
- Two telemetry rows → Task 3 ✓
- Single shared scrubber → Task 3 (one ReplayProvider, one Scrubber, both sides subscribe)

**Spec coverage (§ 5.6 Summary):**
- Narrow centered column → Task 6 (`max-w-3xl`)
- Title + severity badge → Task 6 ✓
- Root-cause hypothesis paragraph → Task 6 (uses the incident's existing `summary` field)
- Key moments list → Task 5 (KeyMomentsList) + Task 6 composes it
- Notes section → Task 6 ✓
- Bookmarks list → Task 6 ✓
- Export button → Task 6 (button is presentational only — actual export implementation is out of scope for v1)

**Placeholder scan:** none.

**Deep link:** `/app/incidents/<id>?t=<ms>` is the summary → replay handoff. `ReplayWorkspace` gained an optional `initialMs` prop; the page reads `searchParams.t` and passes it. `ReplayProvider` already supported `initialMs` since Plan 2 Task 2.

**Scope caveats:**
- Baseline data is a static mock (`baseline-data.ts`), not a real separate run. Future work is to wire a proper baseline-run selection mechanism — out of scope for this plan.
- Root-cause hypothesis is static prose from `incident.summary`. Editable rich-text is out of scope.
- Export button is presentational. Real export (PDF, Markdown, whatever) is not in v1.
- Notes section renders `incidentNotes` from `lib/data`. Adding new notes is out of scope; it's display-only.

**Type consistency:** reuses `ScrubEvent` and `Diff` types from previous plans. No new shared types.
