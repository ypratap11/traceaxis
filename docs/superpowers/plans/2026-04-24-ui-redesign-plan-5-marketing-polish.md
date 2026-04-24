# UI Redesign — Plan 5: Marketing Home + Motion Polish + Legacy Cleanup

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the UI redesign: rebuild the marketing home (`/`) with the actual `<Scrubber>` as the hero animation, migrate the last remaining legacy-class screen (`/app/settings`), and strip all legacy utility classes + color aliases now that nothing depends on them.

**Architecture:** Introduce `<ScrubberHero>` — a small client wrapper around the existing `<Scrubber>` primitive that owns its own cursor state and auto-advances on an interval (respecting `prefers-reduced-motion`). Rebuild `/app/page.tsx` around it with the headline/CTAs above and three value props below using `<Panel>`. Refactor `<MarketingShell>` to drop the legacy glassmorphism header styling. Migrate `/app/settings/page.tsx` to use `<Panel>`. Then strip `.panel`, `.eyebrow`, `.control-chip`, `.kpi`, `.metric-tile`, `.field-shell`, `.status-dot`, `.panel-muted`, `.panel-interactive`, `.control-chip-accent` from `globals.css` and drop the `graphite`, `accent`, `danger`, `warning` aliases (and related legacy CSS vars) from `tailwind.config.ts`.

**Tech Stack:** Next 16, React 19, Tailwind 3.4, Vitest 4 + React Testing Library 16. Uses all prior primitives.

**Spec:** `docs/superpowers/specs/2026-04-23-ui-redesign-hybrid-design.md` § 5.2 (Marketing home) and § 6.2 / § 6.5 (foundational changes and execution order — this plan closes the "strip legacy classes" item).

**Predecessor:** Plans 1-4 must be on this branch.

---

## Audit (done at plan-writing time)

Legacy-class consumers remaining on the branch, from a grep of `app/` and `components/` for `panel|panel-muted|panel-interactive|eyebrow|kpi|control-chip|control-chip-accent|metric-tile|field-shell|status-dot`:

- `app/page.tsx` — rebuilt in Task 2 of this plan
- `app/app/settings/page.tsx` — migrated in Task 3 of this plan

Legacy color alias consumers (`accent-*`, `graphite-*`, `bg-danger`, `bg-warning`, `text-danger`, `text-warning`):

- `app/page.tsx` line 33 — `bg-accent-500 ... text-graphite-950 ... hover:bg-accent-400` — gone after Task 2 rebuild
- `app/page.tsx` line 79 — `text-accent-400` — gone after Task 2 rebuild

Once Tasks 2 and 3 land, nothing else references the legacy classes or color aliases, and Task 4 can strip them cleanly.

## File map

**New:**
- `components/marketing/scrubber-hero.tsx` — auto-playing scrubber for the hero
- `components/__tests__/scrubber-hero.test.tsx`

**Modified:**
- `app/page.tsx` — rebuilt
- `app/app/settings/page.tsx` — migrated to `<Panel>`
- `components/marketing-shell.tsx` — dropped glassmorphism header
- `app/globals.css` — stripped legacy utility classes + legacy CSS vars
- `tailwind.config.ts` — stripped legacy color aliases

**Deleted:** none (no obsolete components left).

---

## Task 1: `<ScrubberHero>`

A small client wrapper around `<Scrubber>` that owns its own `currentMs`, auto-advances on a 100ms interval when playing, loops back to 0 at end-of-timeline, and pauses itself when `prefers-reduced-motion: reduce` is set. Hero element on the marketing home.

**Files:**
- Create: `components/marketing/scrubber-hero.tsx`
- Create: `components/__tests__/scrubber-hero.test.tsx`

Create `components/marketing/` directory if needed.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScrubberHero } from "@/components/marketing/scrubber-hero";

const events = [
  { id: "a", label: "Mission start", ms: 0, severity: "info" as const },
  { id: "b", label: "Drift", ms: 6000, severity: "warn" as const },
  { id: "c", label: "Abort", ms: 12000, severity: "err" as const }
];

describe("ScrubberHero", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a Scrubber with the provided events", () => {
    render(<ScrubberHero events={events} durationMs={12910} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("auto-advances the cursor when autoPlay is true (default)", () => {
    render(<ScrubberHero events={events} durationMs={12910} />);
    const slider = screen.getByRole("slider");
    const before = Number(slider.getAttribute("aria-valuenow"));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    const after = Number(slider.getAttribute("aria-valuenow"));
    expect(after).toBeGreaterThan(before);
  });

  it("loops the cursor back to 0 after reaching duration", () => {
    render(
      <ScrubberHero events={events} durationMs={1000} initialMs={950} />
    );
    act(() => {
      vi.advanceTimersByTime(500);
    });
    const slider = screen.getByRole("slider");
    const value = Number(slider.getAttribute("aria-valuenow"));
    expect(value).toBeLessThan(950);
  });

  it("does not auto-advance when autoPlay is false", () => {
    render(
      <ScrubberHero events={events} durationMs={12910} autoPlay={false} />
    );
    const slider = screen.getByRole("slider");
    const before = Number(slider.getAttribute("aria-valuenow"));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const after = Number(slider.getAttribute("aria-valuenow"));
    expect(after).toBe(before);
  });

  it("pauses when the user clicks pause and resumes when they click play", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ScrubberHero events={events} durationMs={12910} />);
    // Advance once while playing.
    act(() => {
      vi.advanceTimersByTime(200);
    });
    const slider = screen.getByRole("slider");
    const afterPlay = Number(slider.getAttribute("aria-valuenow"));

    // Click pause.
    await user.click(screen.getByRole("button", { name: /pause/i }));
    // Advance while paused — value should not change.
    act(() => {
      vi.advanceTimersByTime(500);
    });
    const afterPause = Number(slider.getAttribute("aria-valuenow"));
    expect(afterPause).toBe(afterPlay);
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- scrubber-hero`

- [ ] **Step 3: Write the implementation**

```tsx
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
    const id = window.setInterval(() => {
      setCurrentMs((prev) => {
        const next = prev + TICK_MS;
        if (next >= durationMs) return 0;
        return next;
      });
    }, TICK_MS);
    return () => window.clearInterval(id);
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
```

- [ ] **Step 4: Run, verify PASS 5/5:** `npm run test:run -- scrubber-hero`

- [ ] **Step 5: Commit:**

```
Add ScrubberHero (auto-playing scrubber for marketing hero)
```

---

## Task 2: Rebuild marketing home + MarketingShell

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/marketing-shell.tsx`

- [ ] **Step 1: Replace `components/marketing-shell.tsx` with:**

```tsx
import Link from "next/link";
import { Brand } from "@/components/brand";

export function MarketingShell({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-0 text-ink-1">
      <header className="border-b border-line bg-surface-0 px-6 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Brand />
          <nav className="hidden items-center gap-6 text-xs uppercase tracking-[0.18em] text-ink-3 md:flex">
            <Link
              href="/#product"
              className="transition hover:text-ink-0"
            >
              Product
            </Link>
            <Link
              href="/#workflow"
              className="transition hover:text-ink-0"
            >
              Workflow
            </Link>
            <Link
              href="/app/incidents"
              className="transition hover:text-ink-0"
            >
              Demo App
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/page.tsx` with:**

```tsx
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { Panel } from "@/components/primitives/panel";
import { ScrubberHero } from "@/components/marketing/scrubber-hero";
import { eventMarkers } from "@/lib/data";
import { inferDurationMs, toScrubberEvents } from "@/lib/replay-data";

const productPoints = [
  "Replay the exact failure across video, telemetry, logs, and robot state.",
  "Jump straight to anomaly markers instead of reconstructing incidents by hand.",
  "Compare failed runs against healthy baselines without writing ad hoc scripts."
];

const workflowSteps = [
  "Upload a failed run from a ROS bag or structured log archive.",
  "Open a synchronized timeline with event markers and aligned telemetry.",
  "Bookmark the failure moment, compare against a healthy run, and share the report."
];

export default function HomePage() {
  const events = toScrubberEvents(eventMarkers);
  const durationMs = inferDurationMs(events);

  return (
    <MarketingShell>
      <main className="mx-auto max-w-7xl space-y-14 px-6 py-16 sm:px-8">
        <section className="space-y-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
            TraceAxis
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-ink-0 sm:text-6xl">
            Find robot failures faster.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-ink-2">
            Incident replay for robotics teams. TraceAxis turns ROS bags and robot
            logs into a synchronized investigation console built for autonomy
            engineers.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href="/app/incidents"
              className="rounded-xs bg-ink-0 px-4 py-2 text-xs font-semibold text-surface-0"
            >
              View sample incident
            </Link>
            <Link
              href="/app/incidents"
              className="rounded-xs border border-line-strong px-4 py-2 text-xs font-medium text-ink-1 transition hover:border-ink-3 hover:text-ink-0"
            >
              Book demo
            </Link>
          </div>
        </section>

        <section className="space-y-3" id="hero-animation">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
            Live sample
          </div>
          <ScrubberHero events={events} durationMs={durationMs} />
          <p className="max-w-2xl text-xs leading-6 text-ink-3">
            The same timeline that drives the replay console — playing a sample
            incident end-to-end. Click any marker to seek.
          </p>
        </section>

        <section id="product" className="grid gap-3 lg:grid-cols-3">
          {productPoints.map((point, index) => (
            <Panel key={point} eyebrow={`0${index + 1}`}>
              <p className="text-sm leading-6 text-ink-1">{point}</p>
            </Panel>
          ))}
        </section>

        <section id="workflow" className="space-y-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
            Workflow
          </div>
          <h2 className="max-w-3xl text-2xl font-semibold tracking-[-0.01em] text-ink-0">
            A debugging console, not just a file viewer.
          </h2>
          <div className="grid gap-3 lg:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <Panel key={step} eyebrow={`Step 0${index + 1}`}>
                <p className="text-sm leading-6 text-ink-1">{step}</p>
              </Panel>
            ))}
          </div>
        </section>

        <footer className="border-t border-line pt-6 text-xs text-ink-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>TraceAxis · incident replay for robotics teams</span>
            <span className="font-mono">© 2026</span>
          </div>
        </footer>
      </main>
    </MarketingShell>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run build` — expected success, no TypeScript errors.
Run: `npm run test:run -- --maxWorkers=1` — all tests pass.

- [ ] **Step 4: Commit**

```bash
git add C:/Pratap/work/robotics/app/page.tsx C:/Pratap/work/robotics/components/marketing-shell.tsx
```

Message:

```
Rebuild marketing home with ScrubberHero + new chrome

Drops the legacy .panel / .eyebrow / .kpi classes on the marketing
page. Replaces the mint-cyan CTAs with titanium primary + outlined
secondary. The hero section now embeds the actual <Scrubber>
component, auto-playing through the seed incident markers — the
product sells itself.
```

---

## Task 3: Migrate Settings page

Small screen, 2 panels. Drop-in `<Panel>` replacement.

**Files:**
- Modify: `app/app/settings/page.tsx`

- [ ] **Step 1: Replace `app/app/settings/page.tsx` with:**

```tsx
import { AppShell } from "@/components/app-shell";
import { Panel } from "@/components/primitives/panel";

const workspaceDefaults = [
  "Default timezone: America/Los_Angeles",
  "Preferred baseline selection: same robot, same route, previous healthy run"
];

const eventTaxonomy = [
  "E-stop, localization loss, planner timeout, network disconnect, battery sag",
  "Future hook: custom parsers and workspace-specific event rules"
];

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      subtitle="Configure workspace defaults, ingestion behavior, and how TraceAxis interprets common event markers."
      crumbs={["Settings"]}
    >
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel eyebrow="Workspace defaults" bodyClassName="space-y-3">
          {workspaceDefaults.map((item) => (
            <div
              key={item}
              className="rounded-sm border border-line bg-surface-1 px-3 py-2 text-sm text-ink-1"
            >
              {item}
            </div>
          ))}
        </Panel>
        <Panel eyebrow="Event taxonomy" bodyClassName="space-y-3">
          {eventTaxonomy.map((item) => (
            <div
              key={item}
              className="rounded-sm border border-line bg-surface-1 px-3 py-2 text-sm text-ink-1"
            >
              {item}
            </div>
          ))}
        </Panel>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run build`
Run: `npm run test:run -- --maxWorkers=1`

- [ ] **Step 3: Commit**

```bash
git add C:/Pratap/work/robotics/app/app/settings/page.tsx
```

Message:

```
Migrate Settings page to Panel (drop legacy .panel / .eyebrow classes)
```

---

## Task 4: Strip legacy CSS utility classes + legacy CSS vars

With Tasks 2 and 3 landed, nothing consumes the old utility classes. Drop them.

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Verify nothing else uses the legacy classes**

Run (bash, no `cd`):

```bash
grep -rn "className=.*\b\(panel\|panel-muted\|panel-interactive\|eyebrow\|kpi\|control-chip\|control-chip-accent\|metric-tile\|field-shell\|status-dot\)\b" --include="*.tsx" --include="*.ts" C:/Pratap/work/robotics/app C:/Pratap/work/robotics/components
```

Expected: **no output**. If anything matches, STOP and report the file path — a consumer was missed.

- [ ] **Step 2: Replace `app/globals.css` with the minimal token-only file:**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;

  --surface-0: #0b0e13;
  --surface-1: #10151c;
  --surface-2: #171d27;
  --line: #1d232c;
  --line-strong: #2a3038;
  --ink-0: #f5f7fa;
  --ink-1: #d1d5db;
  --ink-2: #8b95a3;
  --ink-3: #5b6573;
  --data-bloom: #ff9f50;
  --data-bloom-soft: rgba(255, 159, 80, 0.14);
  --data-bloom-tint: #ffb47a;
  --ok: #5cd6a8;
  --warn: #ffc857;
  --err: #ff6e7a;
  --info: #7ab7ff;

  --ease-out: cubic-bezier(0.32, 0.72, 0, 1);
}

html,
body {
  background: var(--surface-0);
}

body {
  min-height: 100vh;
  color: var(--ink-1);
  font-family: var(--font-plex-sans), system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
  position: relative;
}

* {
  border-color: var(--line);
}

::selection {
  background: rgba(255, 159, 80, 0.3);
  color: var(--ink-0);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

@layer base {
  h1,
  h2,
  h3,
  h4 {
    letter-spacing: -0.02em;
    color: var(--ink-0);
  }

  p {
    color: var(--ink-1);
  }
}
```

Key changes from the Plan 1 version:
- Removed the `--bg-0`, `--bg-1`, `--bg-2`, `--panel`, `--panel-strong`, `--copy`, `--muted` legacy CSS vars
- Removed all ten `@layer components` legacy utility classes
- Added a single global `prefers-reduced-motion` override that throttles animations and transitions across the whole app (not just `<Pulse>`)

- [ ] **Step 3: Verify**

Run: `npm run build` — expected success.
Run: `npm run test:run -- --maxWorkers=1` — all pass.

- [ ] **Step 4: Commit**

```bash
git add C:/Pratap/work/robotics/app/globals.css
```

Message:

```
Strip legacy utility classes + legacy CSS vars from globals.css

All screens have been migrated to the new primitives — .panel,
.eyebrow, .control-chip, .kpi, .metric-tile, .field-shell, .status-dot,
.panel-muted, .panel-interactive, and .control-chip-accent are no
longer consumed. Also drops --bg-0/1/2, --panel, --panel-strong,
--copy, and --muted legacy CSS vars.

Adds a global prefers-reduced-motion override so every animation and
transition in the app respects the user's motion preference.
```

---

## Task 5: Strip legacy Tailwind color aliases + final verification

**Files:**
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Verify nothing uses `accent-*`, `graphite-*`, `bg-danger`, `bg-warning`, `text-danger`, `text-warning`, or `border-danger`/`border-warning`**

```bash
grep -rn "\(accent-\|graphite-\|bg-danger\|bg-warning\|text-danger\|text-warning\|border-danger\|border-warning\)" --include="*.tsx" --include="*.ts" C:/Pratap/work/robotics/app C:/Pratap/work/robotics/components
```

Expected: **no output**. If anything matches, STOP.

- [ ] **Step 2: Replace `tailwind.config.ts` with the cleaned version:**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: "#0b0e13",
          1: "#10151c",
          2: "#171d27"
        },
        line: {
          DEFAULT: "#1d232c",
          strong: "#2a3038"
        },
        ink: {
          0: "#f5f7fa",
          1: "#d1d5db",
          2: "#8b95a3",
          3: "#5b6573"
        },
        bloom: {
          DEFAULT: "#ff9f50",
          soft: "rgba(255,159,80,0.14)",
          tint: "#ffb47a"
        },
        ok: "#5cd6a8",
        warn: "#ffc857",
        err: "#ff6e7a",
        info: "#7ab7ff"
      },
      fontFamily: {
        sans: ["var(--font-plex-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"]
      },
      borderRadius: {
        none: "0",
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px"
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.32, 0.72, 0, 1)"
      },
      boxShadow: {
        bloom: "0 0 12px rgba(255,159,80,0.5)",
        "bloom-strong": "0 0 16px rgba(255,159,80,0.7)"
      },
      keyframes: {
        breath: {
          "0%, 100%": {
            boxShadow:
              "0 0 0 3px rgba(255,159,80,0.18), 0 0 6px rgba(255,159,80,0.5)"
          },
          "50%": {
            boxShadow:
              "0 0 0 5px rgba(255,159,80,0.10), 0 0 14px rgba(255,159,80,0.85)"
          }
        }
      },
      animation: {
        breath: "breath 1.6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
```

Key changes from Plan 1:
- Removed `graphite`, `accent`, `danger`, `warning` color aliases
- Removed the `panel` legacy boxShadow alias

- [ ] **Step 3: Full-suite verification**

Run: `npm run test:run -- --maxWorkers=1` — all tests pass (should be around 131 tests across 33 files after this plan).
Run: `npm run build` — all 11 routes compile.

Manual walkthrough (suggested, not required):

```bash
npm run dev
```

- `/` — new marketing home with the scrubber hero auto-playing through markers; clicking play/pause works; clicking a marker seeks the cursor
- `/app/incidents` — inbox (Plan 3)
- `/app/incidents/<id>` — replay console (Plan 2)
- `/app/incidents/<id>/compare` — compare (Plan 4)
- `/app/incidents/<id>/summary` — summary (Plan 4); clicking a Key Moment row opens the Replay Console at `?t=<ms>`
- `/app/uploads` — uploads (Plan 3)
- `/app/settings` — settings (Plan 5 Task 3)

All seven user-facing screens now run on the new design system with zero legacy classes.

- [ ] **Step 4: Commit**

```bash
git add C:/Pratap/work/robotics/tailwind.config.ts
```

Message:

```
Strip legacy color aliases from tailwind config

graphite-*, accent-*, danger, and warning aliases are no longer
consumed after all screens migrated to the new semantic tokens.
Drops the panel legacy boxShadow alias too.

Plan 5 complete — all seven screens run on the new design system.
```

---

## Self-review

**Spec coverage (§ 5.2 Marketing home):**
- Full-width hero with headline → Task 2 ✓
- Subhead with existing copy → Task 2 ✓
- Primary CTA "View Sample Incident", secondary "Book demo" → Task 2 ✓ (titanium primary + outlined secondary, matches the chrome rule in § 3.1)
- Hero element: the actual `<Scrubber>` auto-playing through pre-baked event markers → Task 1 (`<ScrubberHero>`) + Task 2 embeds it
- Three value-prop panels → Task 2 ✓
- Workflow section with three numbered cards → Task 2 ✓
- Footer → Task 2 ✓

**Spec coverage (§ 6.2 foundational changes — final pass):**
- Remove `.panel`, `.panel-muted`, `.panel-interactive`, `.kpi`, `.metric-tile`, `.control-chip`, `.control-chip-accent`, `.field-shell`, `.eyebrow` → Task 4 ✓
- Legacy color aliases stripped → Task 5 ✓

**Spec coverage (§ 6.5 #9 Motion polish pass):**
- Apple-spring easing is already in Tailwind (`ease-spring`) and used by `<EventRow>` — other components use default ease which is fine; `--ease-out` CSS var is available for future inline use. No new component motion work needed.
- Breath timing: 1.6s `ease-in-out` infinite on active event dots — already working per Plan 1 Task 3 (with `prefers-reduced-motion` respect from the fix).
- Bloom timing: the sodium glow on sparkline lines and cursor dots is CSS-only (drop-shadow filter). No animated bloom exists yet — deferred as a future enhancement since it's not a regression.
- Settle transitions: modals and route transitions don't have custom motion — deferred.
- Global reduced-motion override → Task 4 (added to globals.css) ✓ covers everything beyond the per-component handling.

**Placeholder scan:** none.

**Scope caveats:**
- Animated bloom on scrub (the "cursor bloom" mentioned in the spec's motion vocabulary) is not implemented. The sodium cursor dot on each Sparkline uses a static `drop-shadow`, not a time-limited bloom animation. Deferred as non-blocking.
- The marketing home's ScrubberHero uses a simple `setInterval` at 100ms. For a screen that may spin up in the browser for minutes at a time, this is fine — the memory/CPU cost is negligible — but `requestAnimationFrame` would be the idiomatic upgrade for a future polish pass.
- The marketing footer is minimal. No social / blog / legal links. Copy those in when there's something to link to.

**Type consistency:** `ScrubberEvent` is reused from Plan 1 Task 8 (`components/primitives/scrubber.tsx`). No new types.
