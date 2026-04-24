# UI Redesign — Plan 2: Replay Console Rebuild

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/app/incidents/[incidentId]` (the Replay Console — the centerpiece screen) using the primitives from Plan 1: slim icon nav + breadcrumb top bar + incident header + 1.4fr/1fr video+events grid + 3-up sparkline row + 320px right rail (topics + robot state) + sticky bottom scrubber. Everything synchronized through a single `ReplayContext` cursor.

**Architecture:** Introduce `<ReplayProvider>` (React context) holding `{ currentMs, durationMs, events, isPlaying, seek, togglePlay }`. The `<Scrubber>` from Plan 1 drives the cursor; `<EventStream>`, `<TelemetryRow>`, `<RobotStateGrid>` all subscribe to it for synchronized rendering. A new `<ReplayShell>` is a sibling to `<AppShell>` — it uses the same SideNav + TopBar but skips the title-subtitle header and reserves a sticky bottom slot for the scrubber. Existing string-timestamp data (`"06:12"` etc.) is converted to milliseconds via `lib/replay-data.ts` adapters; the source data file is left as-is so the inbox / compare / summary screens keep working.

**Tech Stack:** Next 16, React 19 (server + client where needed), Tailwind 3.4, Vitest 4 + React Testing Library 16. All Plan 1 primitives (`Scrubber`, `EventRow`, `Sparkline`, `Panel`, `KvTag`, `MetricTile`, `Pulse`, `SideNav`, `TopBar`).

**Spec:** `docs/superpowers/specs/2026-04-23-ui-redesign-hybrid-design.md` § 5.4 (Replay Console layout), § 4 (component patterns), § 8 (Scrubber sync risk → ReplayContext is the answer)

**Predecessor:** Plan 1 (`docs/superpowers/plans/2026-04-23-ui-redesign-plan-1-foundation-shell.md`) — must be merged on this branch.

---

## File map

**New (lib):**
- `lib/replay-data.ts` — pure adapter functions from string timestamps to ms; converts existing `eventMarkers`, `replayFrames`, `commandTrace` to the ms shape the new components consume

**New (context):**
- `components/replay/replay-context.tsx` — `<ReplayProvider>` + `useReplay()` hook

**New (shell):**
- `components/replay/replay-shell.tsx` — sibling shell variant: SideNav + TopBar + scrollable middle + sticky scrubber slot

**New (sub-components):**
- `components/replay/incident-header.tsx` — meta line + title + severity badge + KvTag row
- `components/replay/video-pane.tsx` — forward camera placeholder pane
- `components/replay/event-stream.tsx` — Panel with EventRow list, active row driven by cursor
- `components/replay/telemetry-row.tsx` — 3-up Sparkline grid driven by cursor
- `components/replay/topic-inspector-panel.tsx` — search + pinned/all topic list
- `components/replay/robot-state-grid.tsx` — 2-column key-value grid

**New (tests):** one `*.test.tsx` per component above + one for `replay-data.ts` and `replay-context.tsx`.

**Modified:**
- `components/replay-workspace.tsx` — full rebuild: composition of new sub-components, wrapped in ReplayProvider
- `app/app/incidents/[incidentId]/page.tsx` — switch from AppShell → ReplayShell, set breadcrumbs, set page actions

**Deleted:**
- `components/timeline-card.tsx` — superseded by `<Scrubber>`
- `components/telemetry-chart.tsx` — superseded by `<Sparkline>`
- `components/replay-stage.tsx` — superseded by new `video-pane.tsx`
- `components/topic-inspector.tsx` — superseded by `replay/topic-inspector-panel.tsx`

---

## Task 1: ms-based data adapters

A small pure-function module that converts the existing string-timestamp seed data to the ms-based shapes the new components consume. Keeps `lib/data.ts` unchanged so other screens (inbox, compare, summary) keep working.

**Files:**
- Create: `lib/replay-data.ts`
- Create: `lib/__tests__/replay-data.test.ts`

- [ ] **Step 1: Write the failing test** at `lib/__tests__/replay-data.test.ts`:

```ts
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
  it("returns the index closest to the current ms", () => {
    expect(cursorIndexFor(0, 12)).toBe(0);
    expect(cursorIndexFor(1, 12)).toBe(11);
    expect(cursorIndexFor(0.5, 12)).toBe(6);
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- replay-data`

- [ ] **Step 3: Write the implementation** at `lib/replay-data.ts`:

```ts
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

export function signalCursorIndex(currentMs: number, durationMs: number, signal: TimelineSignal): number {
  return cursorIndexFor(currentMs / Math.max(durationMs, 1), signal.values.length);
}
```

- [ ] **Step 4: Run, verify PASS 9/9:** `npm run test:run -- replay-data`

- [ ] **Step 5: Commit:**

Stage exactly the two new files, then commit:

```
Add replay-data adapters (string ts -> ms, tone -> severity)
```

---

## Task 2: ReplayProvider + useReplay hook

A small client-side React context. Single source of truth for `currentMs`, `durationMs`, `events`, `isPlaying`. Exposes `seek(ms)` and `togglePlay()`. Future tasks subscribe to this rather than threading props through the tree.

**Files:**
- Create: `components/replay/replay-context.tsx`
- Create: `components/__tests__/replay-context.test.tsx`

- [ ] **Step 1: Write the failing test** at `components/__tests__/replay-context.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReplayProvider, useReplay } from "@/components/replay/replay-context";

const sampleEvents = [
  { id: "a", label: "Start", ms: 0, severity: "info" as const },
  { id: "b", label: "Drift", ms: 6000, severity: "warn" as const }
];

function Probe() {
  const { currentMs, durationMs, isPlaying, seek, togglePlay } = useReplay();
  return (
    <div>
      <span data-testid="current">{currentMs}</span>
      <span data-testid="duration">{durationMs}</span>
      <span data-testid="playing">{String(isPlaying)}</span>
      <button onClick={() => seek(3000)}>seek</button>
      <button onClick={togglePlay}>toggle</button>
    </div>
  );
}

describe("ReplayProvider", () => {
  it("seeds the cursor at the initialMs and exposes the durationMs", () => {
    render(
      <ReplayProvider events={sampleEvents} durationMs={10000} initialMs={1500}>
        <Probe />
      </ReplayProvider>
    );
    expect(screen.getByTestId("current")).toHaveTextContent("1500");
    expect(screen.getByTestId("duration")).toHaveTextContent("10000");
    expect(screen.getByTestId("playing")).toHaveTextContent("false");
  });

  it("seek updates the cursor", async () => {
    const user = userEvent.setup();
    render(
      <ReplayProvider events={sampleEvents} durationMs={10000}>
        <Probe />
      </ReplayProvider>
    );
    await user.click(screen.getByText("seek"));
    expect(screen.getByTestId("current")).toHaveTextContent("3000");
  });

  it("seek clamps to [0, durationMs]", async () => {
    const user = userEvent.setup();
    function ClampProbe() {
      const { currentMs, seek } = useReplay();
      return (
        <div>
          <span data-testid="current">{currentMs}</span>
          <button onClick={() => seek(-100)}>under</button>
          <button onClick={() => seek(99999)}>over</button>
        </div>
      );
    }
    render(
      <ReplayProvider events={sampleEvents} durationMs={10000}>
        <ClampProbe />
      </ReplayProvider>
    );
    await user.click(screen.getByText("under"));
    expect(screen.getByTestId("current")).toHaveTextContent("0");
    await user.click(screen.getByText("over"));
    expect(screen.getByTestId("current")).toHaveTextContent("10000");
  });

  it("togglePlay flips isPlaying", async () => {
    const user = userEvent.setup();
    render(
      <ReplayProvider events={sampleEvents} durationMs={10000}>
        <Probe />
      </ReplayProvider>
    );
    await user.click(screen.getByText("toggle"));
    expect(screen.getByTestId("playing")).toHaveTextContent("true");
    await user.click(screen.getByText("toggle"));
    expect(screen.getByTestId("playing")).toHaveTextContent("false");
  });

  it("useReplay throws outside of a provider", () => {
    function Orphan() {
      useReplay();
      return null;
    }
    expect(() => render(<Orphan />)).toThrow(/ReplayProvider/);
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- replay-context`

- [ ] **Step 3: Write the implementation** at `components/replay/replay-context.tsx`:

```tsx
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
```

- [ ] **Step 4: Run, verify PASS 5/5:** `npm run test:run -- replay-context`

- [ ] **Step 5: Commit:**

Stage exactly the two new files, then commit:

```
Add ReplayProvider + useReplay hook (single cursor source of truth)
```

---

## Task 3: ReplayShell

The Replay Console doesn't want the AppShell's title/subtitle header (the incident header IS the title). It also needs a sticky bottom region for the scrubber. Build a sibling shell that reuses SideNav + TopBar but lays out as `[topbar] / [scrollable middle] / [sticky bottom]`.

**Files:**
- Create: `components/replay/replay-shell.tsx`
- Create: `components/__tests__/replay-shell.test.tsx`

- [ ] **Step 1: Write the failing test** at `components/__tests__/replay-shell.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReplayShell } from "@/components/replay/replay-shell";

describe("ReplayShell", () => {
  it("renders side nav, breadcrumb, body and footer", () => {
    render(
      <ReplayShell
        crumbs={["Incidents", "INC-2384"]}
        actions={<button>Share</button>}
        footer={<div data-testid="footer">scrubber</div>}
      >
        <p data-testid="body">incident body</p>
      </ReplayShell>
    );
    expect(screen.getByRole("link", { name: "Incidents" })).toBeInTheDocument();
    expect(screen.getByText("INC-2384")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
    expect(screen.getByTestId("body")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("does not render the AppShell-style title header", () => {
    render(
      <ReplayShell crumbs={["x"]}>
        <p>body</p>
      </ReplayShell>
    );
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("activates the incidents tab by default", () => {
    render(
      <ReplayShell crumbs={["x"]}>
        <p>body</p>
      </ReplayShell>
    );
    expect(screen.getByRole("link", { name: "Incidents" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- replay-shell`

- [ ] **Step 3: Write the implementation** at `components/replay/replay-shell.tsx`:

```tsx
import type { ReactNode } from "react";
import { SideNav, type SideNavItem } from "@/components/primitives/side-nav";
import { TopBar } from "@/components/primitives/top-bar";

const navItems: SideNavItem[] = [
  { href: "/app/incidents", label: "Incidents", icon: "incidents" },
  { href: "/app/uploads", label: "Uploads", icon: "uploads" },
  { href: "/app/settings", label: "Settings", icon: "settings" }
];

type Props = {
  crumbs: string[];
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  activeHref?: string;
};

export function ReplayShell({
  crumbs,
  actions,
  footer,
  children,
  activeHref = "/app/incidents"
}: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-0 text-ink-1">
      <SideNav items={navItems} activeHref={activeHref} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar crumbs={crumbs} actions={actions} />
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        {footer && (
          <div className="border-t border-line bg-surface-0 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run, verify PASS 3/3:** `npm run test:run -- replay-shell`

- [ ] **Step 5: Commit:**

Stage exactly the two new files, then commit:

```
Add ReplayShell (sibling shell with sticky scrubber slot)
```

---

## Task 4: IncidentHeader

The header that sits between TopBar and the main grid. Meta line + incident title + severity badge + key-value tag row.

**Files:**
- Create: `components/replay/incident-header.tsx`
- Create: `components/__tests__/incident-header.test.tsx`

- [ ] **Step 1: Write the failing test:**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IncidentHeader } from "@/components/replay/incident-header";

const incident = {
  id: "INC-2384",
  title: "Planner timeout led to mission abort in aisle M-14",
  detectedAt: "04:12.380",
  robot: "amr-014",
  site: "Phoenix DC",
  softwareVersion: "v2.4.1",
  duration: "12.91 s",
  severity: "high" as const,
  failureType: "localization drift"
};

describe("IncidentHeader", () => {
  it("renders the title and id", () => {
    render(<IncidentHeader incident={incident} />);
    expect(screen.getByText(incident.title)).toBeInTheDocument();
    expect(screen.getByText(/INC-2384/)).toBeInTheDocument();
  });

  it("renders the severity badge for the failure type", () => {
    render(<IncidentHeader incident={incident} />);
    expect(screen.getByText("localization drift")).toBeInTheDocument();
  });

  it("renders robot, site, version, duration as tags", () => {
    render(<IncidentHeader incident={incident} />);
    expect(screen.getByText("amr-014")).toBeInTheDocument();
    expect(screen.getByText("Phoenix DC")).toBeInTheDocument();
    expect(screen.getByText("v2.4.1")).toBeInTheDocument();
    expect(screen.getByText("12.91 s")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- incident-header`

- [ ] **Step 3: Write the implementation:**

```tsx
import { KvTag } from "@/components/primitives/kv-tag";

export type IncidentHeaderData = {
  id: string;
  title: string;
  detectedAt: string;
  robot: string;
  site: string;
  softwareVersion: string;
  duration: string;
  severity: "critical" | "high" | "medium" | "low";
  failureType: string;
};

const sevToBadge: Record<IncidentHeaderData["severity"], string> = {
  critical: "bg-err/10 text-err",
  high: "bg-warn/10 text-warn",
  medium: "bg-info/10 text-info",
  low: "bg-ink-3/10 text-ink-2"
};

export function IncidentHeader({ incident }: { incident: IncidentHeaderData }) {
  return (
    <header className="border-b border-line px-6 py-5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
        Incident · {incident.id} · detected {incident.detectedAt}
      </div>
      <h1 className="mt-2 text-xl font-semibold tracking-[-0.01em] text-ink-0">
        {incident.title}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ${sevToBadge[incident.severity]}`}
        >
          {incident.failureType}
        </span>
        <KvTag k="robot" v={incident.robot} />
        <KvTag k="site" v={incident.site} />
        <KvTag k="version" v={incident.softwareVersion} />
        <KvTag k="duration" v={incident.duration} />
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Run, verify PASS 3/3:** `npm run test:run -- incident-header`

- [ ] **Step 5: Commit:**

```
Add IncidentHeader (replay console title + tags)
```

---

## Task 5: VideoPane

Placeholder video pane (real video integration is not in v1). Shows a panel with header (camera label + source) + a centered play affordance + bottom info strip with frame number and timestamp.

**Files:**
- Create: `components/replay/video-pane.tsx`
- Create: `components/__tests__/video-pane.test.tsx`

- [ ] **Step 1: Write the failing test:**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VideoPane } from "@/components/replay/video-pane";

describe("VideoPane", () => {
  it("renders the camera label and source path", () => {
    render(<VideoPane label="Forward camera" source="/camera/front · 30 fps" />);
    expect(screen.getByText("Forward camera")).toBeInTheDocument();
    expect(screen.getByText(/\/camera\/front/)).toBeInTheDocument();
  });

  it("renders a play affordance", () => {
    render(<VideoPane label="x" source="y" />);
    expect(screen.getByLabelText(/play preview/i)).toBeInTheDocument();
  });

  it("renders the cursor footer when provided", () => {
    render(
      <VideoPane
        label="x"
        source="y"
        frame="frame 372 / 387"
        timestamp="04:12.380"
      />
    );
    expect(screen.getByText("frame 372 / 387")).toBeInTheDocument();
    expect(screen.getByText("04:12.380")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- video-pane`

- [ ] **Step 3: Write the implementation:**

```tsx
type Props = {
  label: string;
  source: string;
  frame?: string;
  timestamp?: string;
};

export function VideoPane({ label, source, frame, timestamp }: Props) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-md border border-line bg-surface-1">
      <header className="flex items-center justify-between border-b border-line bg-surface-2 px-4 py-2.5 text-[11px]">
        <span className="font-semibold uppercase tracking-[0.22em] text-ink-3">
          {label}
        </span>
        <span className="font-mono text-ink-2">{source}</span>
      </header>
      <div className="relative flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_center,#1a2030_0%,#0b0e13_80%)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-4 rounded border border-dashed border-line-strong"
        />
        <button
          type="button"
          aria-label="play preview"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-0/25 bg-ink-0/10 text-lg text-ink-0 transition hover:bg-ink-0/15"
        >
          ▶
        </button>
      </div>
      {(frame || timestamp) && (
        <footer className="flex items-center justify-between border-t border-line bg-surface-0 px-4 py-2 font-mono text-[11px] text-ink-3">
          <span>{frame}</span>
          <span>{timestamp}</span>
        </footer>
      )}
    </section>
  );
}
```

- [ ] **Step 4: Run, verify PASS 3/3:** `npm run test:run -- video-pane`

- [ ] **Step 5: Commit:**

```
Add VideoPane (forward-camera placeholder pane)
```

---

## Task 6: EventStream

A scrollable list of EventRow items wrapped in a Panel. Active row matches the current cursor (closest event ≤ currentMs).

**Files:**
- Create: `components/replay/event-stream.tsx`
- Create: `components/__tests__/event-stream.test.tsx`

- [ ] **Step 1: Write the failing test:**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventStream } from "@/components/replay/event-stream";

const events = [
  { id: "a", label: "Mission start", ms: 0, severity: "info" as const },
  { id: "b", label: "Drift", ms: 6000, severity: "warn" as const },
  { id: "c", label: "Abort", ms: 12000, severity: "err" as const }
];

describe("EventStream", () => {
  it("renders one row per event", () => {
    render(<EventStream events={events} currentMs={0} onSeek={() => {}} />);
    expect(screen.getByText("Mission start")).toBeInTheDocument();
    expect(screen.getByText("Drift")).toBeInTheDocument();
    expect(screen.getByText("Abort")).toBeInTheDocument();
  });

  it("marks the row at or before the cursor as active", () => {
    render(<EventStream events={events} currentMs={7000} onSeek={() => {}} />);
    const driftRow = screen.getByRole("button", { name: /Drift/ });
    expect(driftRow.className).toMatch(/border-l-bloom/);
  });

  it("calls onSeek with the row's ms when clicked", async () => {
    const user = userEvent.setup();
    const onSeek = vi.fn();
    render(<EventStream events={events} currentMs={0} onSeek={onSeek} />);
    await user.click(screen.getByRole("button", { name: /Abort/ }));
    expect(onSeek).toHaveBeenCalledWith(12000);
  });

  it("renders the count and anomaly summary in the header", () => {
    render(<EventStream events={events} currentMs={0} onSeek={() => {}} />);
    expect(screen.getByText(/3 events/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- event-stream`

- [ ] **Step 3: Write the implementation** at `components/replay/event-stream.tsx`:

```tsx
import { Panel } from "@/components/primitives/panel";
import { EventRow } from "@/components/primitives/event-row";
import type { ScrubEvent } from "@/lib/replay-data";

function fmt(ms: number) {
  const total = ms / 1000;
  const minutes = Math.floor(total / 60);
  const seconds = Math.floor(total % 60);
  const millis = Math.floor(ms % 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

function activeIndex(events: ScrubEvent[], currentMs: number): number {
  let idx = -1;
  for (let i = 0; i < events.length; i++) {
    if (events[i].ms <= currentMs) idx = i;
    else break;
  }
  return idx;
}

type Props = {
  events: ScrubEvent[];
  currentMs: number;
  onSeek: (ms: number) => void;
};

export function EventStream({ events, currentMs, onSeek }: Props) {
  const active = activeIndex(events, currentMs);
  const anomalies = events.filter((e) => e.severity === "warn" || e.severity === "err").length;

  return (
    <Panel
      eyebrow="Event stream"
      actions={
        <span className="font-mono text-[11px] text-ink-3">
          {events.length} events · {anomalies} anomalies
        </span>
      }
      bodyClassName="p-0 max-h-full overflow-auto"
    >
      <ul className="divide-y divide-line">
        {events.map((evt, idx) => (
          <li key={evt.id}>
            <EventRow
              label={evt.label}
              timestamp={fmt(evt.ms)}
              severity={evt.severity}
              active={idx === active}
              onClick={() => onSeek(evt.ms)}
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
```

- [ ] **Step 4: Run, verify PASS 4/4:** `npm run test:run -- event-stream`

- [ ] **Step 5: Commit:**

```
Add EventStream (cursor-driven event list)
```

---

## Task 7: TelemetryRow

A 3-up grid of Sparkline tiles. Each subscribes to the current cursor and shows the corresponding sample value.

**Files:**
- Create: `components/replay/telemetry-row.tsx`
- Create: `components/__tests__/telemetry-row.test.tsx`

- [ ] **Step 1: Write the failing test:**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TelemetryRow } from "@/components/replay/telemetry-row";

const signals = [
  {
    label: "cmd_vel.linear_x",
    unit: "m/s",
    values: [0.8, 0.7, 0.6, 0.5, 0.4]
  },
  {
    label: "localization confidence",
    values: [0.92, 0.85, 0.7, 0.62, 0.51]
  },
  {
    label: "battery voltage",
    unit: "V",
    values: [23.6, 23.5, 23.4, 23.4, 23.3]
  }
];

describe("TelemetryRow", () => {
  it("renders one tile per signal", () => {
    render(<TelemetryRow signals={signals} cursorRatio={0} />);
    expect(screen.getByText("cmd_vel.linear_x")).toBeInTheDocument();
    expect(screen.getByText("localization confidence")).toBeInTheDocument();
    expect(screen.getByText("battery voltage")).toBeInTheDocument();
  });

  it("renders the value at the cursor ratio for each signal", () => {
    render(<TelemetryRow signals={signals} cursorRatio={1} />);
    expect(screen.getByText("0.4")).toBeInTheDocument();
    expect(screen.getByText("0.51")).toBeInTheDocument();
    expect(screen.getByText("23.3")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- telemetry-row`

- [ ] **Step 3: Write the implementation:**

```tsx
import { Sparkline } from "@/components/primitives/sparkline";
import { cursorIndexFor } from "@/lib/replay-data";

export type TelemetrySignal = {
  label: string;
  values: number[];
  unit?: string;
  delta?: string;
};

type Props = {
  signals: TelemetrySignal[];
  cursorRatio: number;
};

export function TelemetryRow({ signals, cursorRatio }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {signals.map((signal) => {
        const idx = cursorIndexFor(cursorRatio, signal.values.length);
        return (
          <Sparkline
            key={signal.label}
            label={signal.label}
            values={signal.values}
            cursorIndex={idx}
            unit={signal.unit}
            delta={signal.delta}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run, verify PASS 2/2:** `npm run test:run -- telemetry-row`

- [ ] **Step 5: Commit:**

```
Add TelemetryRow (3-up sparkline grid driven by cursor ratio)
```

---

## Task 8: TopicInspector panel

Right-rail panel: search field + list of topics. Pinned topics get a leading sodium dot (rendered inline, since it's the documented exception in the spec where sodium appears outside the data layer — pinning means "watching as data").

**Files:**
- Create: `components/replay/topic-inspector-panel.tsx`
- Create: `components/__tests__/topic-inspector-panel.test.tsx`

- [ ] **Step 1: Write the failing test:**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopicInspectorPanel } from "@/components/replay/topic-inspector-panel";

const topics = [
  {
    name: "/move_base/cmd_vel",
    type: "geometry_msgs",
    samples: 1248,
    pinned: true
  },
  {
    name: "/amcl_pose",
    type: "geometry_msgs",
    samples: 312,
    pinned: true
  },
  { name: "/scan", type: "sensor_msgs", samples: 1289, pinned: false }
];

describe("TopicInspectorPanel", () => {
  it("renders all topics by default", () => {
    render(<TopicInspectorPanel topics={topics} />);
    expect(screen.getByText("/move_base/cmd_vel")).toBeInTheDocument();
    expect(screen.getByText("/amcl_pose")).toBeInTheDocument();
    expect(screen.getByText("/scan")).toBeInTheDocument();
  });

  it("filters topics when the user types in the search field", async () => {
    const user = userEvent.setup();
    render(<TopicInspectorPanel topics={topics} />);
    await user.type(screen.getByPlaceholderText(/search topics/i), "amcl");
    expect(screen.queryByText("/move_base/cmd_vel")).toBeNull();
    expect(screen.getByText("/amcl_pose")).toBeInTheDocument();
  });

  it("marks pinned topics with a sodium dot indicator", () => {
    const { container } = render(<TopicInspectorPanel topics={topics} />);
    expect(container.querySelectorAll("[data-pinned-dot]").length).toBe(2);
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- topic-inspector-panel`

- [ ] **Step 3: Write the implementation:**

```tsx
"use client";

import { useState } from "react";
import { Panel } from "@/components/primitives/panel";

export type ReplayTopic = {
  name: string;
  type: string;
  samples: number;
  pinned: boolean;
};

type Props = {
  topics: ReplayTopic[];
};

export function TopicInspectorPanel({ topics }: Props) {
  const [query, setQuery] = useState("");
  const filtered = topics.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Panel eyebrow="Topics" bodyClassName="space-y-3">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="search topics…"
        className="w-full rounded-sm border border-line bg-surface-1 px-3 py-1.5 text-xs text-ink-1 outline-none placeholder:text-ink-3 focus:border-bloom"
      />
      <ul className="space-y-2">
        {filtered.map((topic) => (
          <li key={topic.name} className="border-t border-line pt-2 first:border-t-0 first:pt-0">
            <div className="flex items-center gap-2">
              {topic.pinned && (
                <span
                  data-pinned-dot
                  aria-hidden="true"
                  className="inline-block h-1.5 w-1.5 rounded-full bg-bloom"
                />
              )}
              <span className="font-mono text-[12px] text-ink-0">
                {topic.name}
              </span>
            </div>
            <div className="mt-0.5 font-mono text-[10px] text-ink-3">
              {topic.type} · {topic.samples} samples
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
```

- [ ] **Step 4: Run, verify PASS 3/3:** `npm run test:run -- topic-inspector-panel`

- [ ] **Step 5: Commit:**

```
Add TopicInspectorPanel (search + pinned dot)
```

---

## Task 9: RobotStateGrid

Compact 2-column key/value grid panel. Pure presentation — values come from props.

**Files:**
- Create: `components/replay/robot-state-grid.tsx`
- Create: `components/__tests__/robot-state-grid.test.tsx`

- [ ] **Step 1: Write the failing test:**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RobotStateGrid } from "@/components/replay/robot-state-grid";

const cells = [
  { k: "mode", v: "autonomous" },
  { k: "planner", v: "timeout" },
  { k: "x", v: "14.382" },
  { k: "y", v: "-3.114" }
];

describe("RobotStateGrid", () => {
  it("renders one cell per item", () => {
    render(<RobotStateGrid cells={cells} />);
    expect(screen.getByText("autonomous")).toBeInTheDocument();
    expect(screen.getByText("timeout")).toBeInTheDocument();
    expect(screen.getByText("14.382")).toBeInTheDocument();
    expect(screen.getByText("-3.114")).toBeInTheDocument();
  });

  it("renders keys in uppercase eyebrow style", () => {
    render(<RobotStateGrid cells={cells} />);
    expect(screen.getByText("mode").className).toMatch(/uppercase/);
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- robot-state-grid`

- [ ] **Step 3: Write the implementation:**

```tsx
import { Panel } from "@/components/primitives/panel";

export type StateCell = { k: string; v: string };

type Props = {
  cells: StateCell[];
};

export function RobotStateGrid({ cells }: Props) {
  return (
    <Panel eyebrow="Robot state @ cursor" bodyClassName="grid grid-cols-2 gap-2">
      {cells.map(({ k, v }) => (
        <div
          key={k}
          className="rounded-sm border border-line bg-surface-1 px-2.5 py-1.5"
        >
          <div className="text-[9px] font-semibold uppercase tracking-[0.22em] text-ink-3">
            {k}
          </div>
          <div className="mt-0.5 font-mono text-xs text-ink-0">{v}</div>
        </div>
      ))}
    </Panel>
  );
}
```

- [ ] **Step 4: Run, verify PASS 2/2:** `npm run test:run -- robot-state-grid`

- [ ] **Step 5: Commit:**

```
Add RobotStateGrid (2-column key/value at-cursor panel)
```

---

## Task 10: Rebuild ReplayWorkspace

Compose all sub-components inside `<ReplayProvider>`. Wire the bottom Scrubber + EventStream + TelemetryRow + RobotStateGrid + VideoPane to the shared cursor.

**Files:**
- Modify: `components/replay-workspace.tsx`
- Create: `components/__tests__/replay-workspace.test.tsx`

- [ ] **Step 1: Write the failing test** at `components/__tests__/replay-workspace.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReplayWorkspace } from "@/components/replay-workspace";
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

describe("ReplayWorkspace", () => {
  it("renders the incident header, video pane, event stream, telemetry row, topic inspector, robot state, and scrubber", () => {
    render(<ReplayWorkspace incident={incident} />);
    expect(screen.getByText("Demo incident")).toBeInTheDocument(); // header
    expect(screen.getByLabelText(/play preview/i)).toBeInTheDocument(); // video pane
    expect(screen.getByText(/events/)).toBeInTheDocument(); // event stream header
    expect(screen.getByText(/cmd_vel/i)).toBeInTheDocument(); // telemetry row
    expect(screen.getByPlaceholderText(/search topics/i)).toBeInTheDocument(); // inspector
    expect(screen.getByText(/Robot state/)).toBeInTheDocument(); // state grid
    expect(screen.getByRole("slider")).toBeInTheDocument(); // scrubber
  });

  it("clicking an event row updates the scrubber cursor", async () => {
    const user = userEvent.setup();
    render(<ReplayWorkspace incident={incident} />);
    const startBefore = screen.getByRole("slider").getAttribute("aria-valuenow");
    const driftButton = screen.getByRole("button", { name: /drift/i });
    await user.click(driftButton);
    const startAfter = screen.getByRole("slider").getAttribute("aria-valuenow");
    expect(startAfter).not.toBe(startBefore);
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- replay-workspace`

- [ ] **Step 3: Replace `components/replay-workspace.tsx` with:**

```tsx
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
import {
  inferDurationMs,
  toScrubberEvents
} from "@/lib/replay-data";
import type { Incident } from "@/lib/types";

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
    <>
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
      <div className="grid min-h-0 flex-1 gap-3 px-3 py-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="grid min-h-0 gap-3 lg:grid-cols-[1.4fr_1fr]">
            <VideoPane
              label="Forward camera"
              source="/camera/front · 30 fps"
              frame="frame 372 / 387"
              timestamp={fmtClock(currentMs)}
            />
            <EventStream
              events={events}
              currentMs={currentMs}
              onSeek={seek}
            />
          </div>
          <TelemetryRow signals={signals} cursorRatio={cursorRatio} />
        </div>
        <aside className="flex min-h-0 flex-col gap-3">
          <TopicInspectorPanel topics={topics} />
          <RobotStateGrid cells={stateCells} />
        </aside>
      </div>
      <ScrubberMount
        currentMs={currentMs}
        durationMs={durationMs}
        events={events}
        isPlaying={isPlaying}
        onSeek={seek}
        onPlayToggle={togglePlay}
      />
    </>
  );
}

function ScrubberMount(props: {
  currentMs: number;
  durationMs: number;
  events: ReturnType<typeof toScrubberEvents>;
  isPlaying: boolean;
  onSeek: (ms: number) => void;
  onPlayToggle: () => void;
}) {
  return (
    <Scrubber
      events={props.events}
      currentMs={props.currentMs}
      durationMs={props.durationMs}
      isPlaying={props.isPlaying}
      onSeek={props.onSeek}
      onPlayToggle={props.onPlayToggle}
    />
  );
}

function fmtClock(ms: number) {
  const total = ms / 1000;
  const minutes = Math.floor(total / 60);
  const seconds = Math.floor(total % 60);
  const millis = Math.floor(ms % 1000);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
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

export { ScrubberMount };
```

Note: `ScrubberMount` is exported so the page can render the scrubber inside the `ReplayShell` `footer` slot if it needs to. For now it renders inline at the bottom of `ReplayBody` — the page will move it to the footer slot in Task 11.

Actually — simpler: keep the Scrubber **inline** inside `ReplayBody`. The `ReplayShell.footer` slot is reserved for things that should be sticky outside the scrolling region; we'll move Scrubber into that slot in Task 11 by hoisting it up via context. For Task 10, render inline so the test passes.

Update: remove the `ScrubberMount` export and call `<Scrubber ... />` inline at the bottom of `ReplayBody`. Final clean implementation:

```tsx
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
          events={events}
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
```

- [ ] **Step 4: Run, verify PASS 2/2:** `npm run test:run -- replay-workspace`

- [ ] **Step 5: Verify the full suite stays green:** `npm run test:run`

- [ ] **Step 6: Commit:**

Stage exactly the modified `components/replay-workspace.tsx` and the new test. Message:

```
Rebuild ReplayWorkspace using ReplayProvider + new sub-components

Composes the new Replay Console layout: incident header, video pane,
event stream, telemetry row, topic inspector, robot state grid, and
sticky scrubber. All synchronization flows through ReplayProvider so
clicking an event row updates the scrubber cursor and vice versa.
```

---

## Task 11: Update incident page; delete obsolete components

Wire the new ReplayWorkspace into the page using `<ReplayShell>` instead of `<AppShell>`. Delete the four obsolete components.

**Files:**
- Modify: `app/app/incidents/[incidentId]/page.tsx`
- Delete: `components/timeline-card.tsx`
- Delete: `components/telemetry-chart.tsx`
- Delete: `components/replay-stage.tsx`
- Delete: `components/topic-inspector.tsx`

- [ ] **Step 1: Replace `app/app/incidents/[incidentId]/page.tsx` with:**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReplayShell } from "@/components/replay/replay-shell";
import { ReplayWorkspace } from "@/components/replay-workspace";
import { getIncident } from "@/lib/store";

export default async function IncidentDetailPage({
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
      <ReplayWorkspace incident={incident} />
    </ReplayShell>
  );
}
```

- [ ] **Step 2: Delete the four obsolete components:**

Run from `C:/Pratap/work/robotics`:

```bash
rm components/timeline-card.tsx components/telemetry-chart.tsx components/replay-stage.tsx components/topic-inspector.tsx
```

- [ ] **Step 3: Verify the build is still green:**

Run: `npm run build`
Expected: build succeeds. The old components had no other consumers — verify there are no broken imports. If TypeScript reports an unresolved import, find the consumer and update it to use the new replay/ paths.

Run: `npm run test:run`
Expected: all tests pass.

- [ ] **Step 4: Manual smoke check (optional but recommended):**

Run: `npm run dev`
Visit: `/app/incidents/inc_0423_localization`
Expected: the new Replay Console renders — slim icon nav on the left, breadcrumb at the top, incident header with severity + tags, video pane + event stream above, 3 sparkline tiles below, right rail with topic inspector + robot state grid, and the sticky scrubber at the bottom. Clicking an event row should move the playhead.

- [ ] **Step 5: Commit:**

Stage the modified page and the four deletions:

```
Wire incident detail to ReplayShell, drop obsolete replay components

Replaces the AppShell wrapper with ReplayShell so the Replay Console
gets the new layout (sticky scrubber, no double title header).
Deletes timeline-card, telemetry-chart, replay-stage, and the old
topic-inspector — all superseded by the new replay/ tree built in
Tasks 1-10.
```

---

## Task 12: Final verification

- [ ] **Step 1: Full test suite green:**

Run: `npm run test:run`
Expected: 54 tests from Plan 1 + ~30 new tests from Plan 2 = ~84 tests across ~21 files. All pass.

- [ ] **Step 2: Build green:**

Run: `npm run build`
Expected: `next build` succeeds. No TypeScript or lint errors.

- [ ] **Step 3: Manual UI walkthrough:**

Run: `npm run dev` and visit:
- `/app/incidents` — still uses legacy `<IncidentList>`. New shell, legacy list inside. Renders without errors.
- `/app/incidents/inc_0423_localization` — **new Replay Console**. Confirm layout matches the spec mockup: icon nav, breadcrumb, incident header, video+events grid, sparkline row, right rail, sticky scrubber.
- `/app/incidents/inc_0423_localization/compare` — still uses legacy compare workspace inside the new shell.
- `/app/incidents/inc_0423_localization/summary` — still uses legacy summary inside the new shell.
- `/app/uploads` — still legacy.
- `/app/settings` — still legacy.

Things to verify on the Replay Console specifically:
- Clicking an event row in the right pane moves the scrubber playhead AND highlights the row
- Clicking on the scrubber track moves the playhead and updates the active event row
- Sparkline values reflect the current cursor position
- Search field filters topics
- Pinned topics show a small sodium dot

- [ ] **Step 4: Push branch (optional, do not merge yet):**

`git push -u origin feat/ui-redesign-foundation-shell` — only if you want to share the work or open a PR. Plan 3 (Inbox + Uploads) can land on the same branch before merging.

Plan 2 complete. The Replay Console is rebuilt.

---

## Self-review

**Spec coverage (§ 5.4):**
- Top bar with breadcrumb + actions → Task 11 (page) wires ReplayShell + actions
- Incident header (meta + title + severity + KvTag row) → Task 4 ✓
- Main grid 1.4fr/1fr (video / events) → Task 10 ✓
- Telemetry row (3 sparklines) → Task 7 ✓
- 320px right rail (topic inspector + robot state) → Tasks 8, 9 ✓
- Sticky bottom scrubber → Task 10 (rendered at bottom of ReplayBody inside ReplayShell)
- Single shared cursor across components → Task 2 (ReplayProvider) ✓

**Spec coverage (§ 4 components):**
- All Plan 1 primitives reused in Plan 2 (Scrubber, EventRow, Sparkline, Panel, KvTag, Pulse, SideNav, TopBar)

**Placeholder scan:** none.

**Type consistency:** `Severity` (`"ok" | "warn" | "err" | "info"`) is defined in both `lib/replay-data.ts` (`Severity`) and `components/primitives/event-row.tsx` (`EventSeverity`). They are structurally identical string unions. Plan 1's spec self-review noted this would be consolidated when both were wired together — that consolidation should happen in this plan as a follow-up commit if any test or implementer hits a friction. As written, both are inline structural types and TypeScript treats them as compatible, so it should not block.

**Scope:** 12 tasks, each ships a working app boundary. Replay Console is fully rebuilt by Task 11. Other screens remain on legacy classes (intentional — they get their own plans).
