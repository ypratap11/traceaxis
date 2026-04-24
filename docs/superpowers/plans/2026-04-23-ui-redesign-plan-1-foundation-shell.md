# UI Redesign — Plan 1: Foundation + Shell

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lay the design-token foundation and rebuild the app shell so subsequent screen-rebuild plans (Replay Console, Inbox, Compare, Summary, Marketing) have all primitives available.

**Architecture:** Replace Tailwind palette with new tokens; load IBM Plex Sans/Mono via `next/font`; build a kit of small reusable primitives (`KvTag`, `Pulse`, `MetricTile`, `Sparkline`, `EventRow`, `Panel`, `Scrubber`); rebuild `AppShell` internals (slim 56px icon nav + compact top bar) while preserving its existing public API so existing screens still render. Keep current `globals.css` utility classes (`.panel`, `.eyebrow`, etc.) for backward-compat — they're stripped in the final plan when no screen depends on them.

**Tech Stack:** Next 16, React 19, Tailwind 3.4, IBM Plex Sans / Plex Mono via `next/font`, Vitest 4 + React Testing Library 16, jsdom.

**Spec:** `docs/superpowers/specs/2026-04-23-ui-redesign-hybrid-design.md`

---

## File map

**New:**
- `components/primitives/kv-tag.tsx`
- `components/primitives/pulse.tsx`
- `components/primitives/metric-tile.tsx`
- `components/primitives/sparkline.tsx`
- `components/primitives/event-row.tsx`
- `components/primitives/panel.tsx`
- `components/primitives/scrubber.tsx`
- `components/primitives/side-nav.tsx`
- `components/primitives/top-bar.tsx`
- `components/__tests__/kv-tag.test.tsx`
- `components/__tests__/pulse.test.tsx`
- `components/__tests__/metric-tile.test.tsx`
- `components/__tests__/sparkline.test.tsx`
- `components/__tests__/event-row.test.tsx`
- `components/__tests__/panel.test.tsx`
- `components/__tests__/scrubber.test.tsx`
- `components/__tests__/side-nav.test.tsx`
- `components/__tests__/top-bar.test.tsx`

**Modified:**
- `tailwind.config.ts` (replace palette / fonts / radii)
- `app/globals.css` (add new tokens; drop only the decorative `body::before` grid + radial gradients; keep `.panel`/`.eyebrow`/etc. classes for now)
- `app/layout.tsx` (load Plex fonts via `next/font`)
- `components/app-shell.tsx` (preserve API, swap internals to SideNav + TopBar)
- `components/brand.tsx` (monochrome titanium)
- `components/status-badge.tsx` (semantic colors via tokens; no sodium)
- `components/__tests__/status-badge.test.tsx` (extend existing test)

---

## Task 1: Foundation — Tailwind config, globals.css, fonts

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `tailwind.config.ts` with new design tokens**

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
        info: "#7ab7ff",
        // Legacy aliases — kept until Plan 5 strips remaining old-class usage.
        graphite: {
          950: "#06070b",
          900: "#0d1017",
          850: "#121722",
          800: "#171d29",
          700: "#20283a"
        },
        accent: {
          400: "#4cf2c5",
          500: "#17c79d",
          600: "#109a79"
        },
        danger: "#ff6e7a",
        warning: "#ffc857"
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
        "bloom-strong": "0 0 16px rgba(255,159,80,0.7)",
        // Legacy alias
        panel: "0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.35)"
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

- [ ] **Step 2: Replace `app/globals.css`**

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

  /* Legacy aliases — kept until Plan 5 strips old-class usage. */
  --bg-0: #06070b;
  --bg-1: #0d1118;
  --bg-2: #121826;
  --panel: rgba(12, 16, 24, 0.84);
  --panel-strong: rgba(18, 25, 38, 0.92);
  --copy: var(--ink-0);
  --muted: var(--ink-2);
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

/*
 * Legacy utility classes — kept so existing screens still render during the
 * incremental rebuild. These are removed in the final UI redesign plan once
 * every screen has been migrated to the new component primitives.
 */
@layer components {
  .panel {
    @apply rounded-lg border;
    background: var(--surface-1);
    border-color: var(--line);
  }

  .panel-muted {
    @apply rounded-md border;
    background: var(--surface-1);
    border-color: var(--line);
  }

  .panel-interactive {
    @apply rounded-md border transition;
    background: var(--surface-1);
    border-color: var(--line);
  }

  .panel-interactive:hover {
    border-color: var(--line-strong);
  }

  .eyebrow {
    @apply text-[10px] font-semibold uppercase tracking-[0.22em];
    color: var(--ink-3);
  }

  .kpi {
    @apply rounded-md border px-4 py-4;
    background: var(--surface-1);
    border-color: var(--line);
  }

  .status-dot {
    @apply inline-block h-2 w-2 rounded-full;
  }

  .control-chip {
    @apply inline-flex items-center gap-2 rounded-sm border px-3 py-1.5 text-xs font-medium transition;
    background: transparent;
    border-color: var(--line-strong);
    color: var(--ink-1);
  }

  .control-chip:hover {
    border-color: var(--ink-3);
    color: var(--ink-0);
  }

  .control-chip-accent {
    @apply inline-flex items-center gap-2 rounded-sm px-3 py-1.5 text-xs font-semibold transition;
    background: var(--ink-0);
    color: var(--surface-0);
  }

  .metric-tile {
    @apply rounded-md border p-4;
    background: var(--surface-1);
    border-color: var(--line);
  }

  .field-shell {
    @apply rounded-sm border px-3 py-2 outline-none transition;
    background: var(--surface-1);
    border-color: var(--line);
  }

  .field-shell:focus {
    border-color: var(--data-bloom);
    box-shadow: 0 0 0 3px var(--data-bloom-soft);
  }
}
```

- [ ] **Step 3: Update `app/layout.tsx` to load Plex fonts**

```tsx
import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap"
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "TraceAxis",
  description: "Incident replay for robotics teams."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Verify the project still builds and renders**

Run: `npm run build`
Expected: build succeeds without TypeScript errors.

Run: `npm run test:run`
Expected: existing 2/2 status-badge tests still pass.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts app/globals.css app/layout.tsx
git commit -m "Replace design tokens, load IBM Plex fonts

Adds new color palette (surface, ink, bloom, semantic) as both Tailwind
tokens and CSS custom properties. Loads IBM Plex Sans / Plex Mono via
next/font. Drops the decorative grid background and mint radial
gradients. Keeps legacy utility classes (.panel, .eyebrow, .control-chip,
etc.) on flat token-backed styles so existing screens still render."
```

---

## Task 2: `<KvTag>` primitive

A key+value chip — replaces all `.control-chip` usages once screens are rebuilt.

**Files:**
- Create: `components/primitives/kv-tag.tsx`
- Create: `components/__tests__/kv-tag.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KvTag } from "@/components/primitives/kv-tag";

describe("KvTag", () => {
  it("renders the key and value", () => {
    render(<KvTag k="cause" v="planner timeout" />);
    expect(screen.getByText("cause")).toBeInTheDocument();
    expect(screen.getByText("planner timeout")).toBeInTheDocument();
  });

  it("renders a ReactNode value", () => {
    render(
      <KvTag
        k="status"
        v={<span data-testid="custom">investigating</span>}
      />
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
  });

  it("renders the solid time-pill variant in mono", () => {
    render(<KvTag variant="solid" v="T+04:12.380" />);
    const el = screen.getByText("T+04:12.380");
    expect(el.parentElement).toHaveClass("font-mono");
    expect(el.parentElement).toHaveClass("bg-ink-0");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- kv-tag`
Expected: FAIL with "Cannot find module '@/components/primitives/kv-tag'".

- [ ] **Step 3: Write the minimal implementation**

```tsx
import type { ReactNode } from "react";

type Props = {
  k?: string;
  v: ReactNode;
  variant?: "default" | "solid";
};

export function KvTag({ k, v, variant = "default" }: Props) {
  if (variant === "solid") {
    return (
      <span className="inline-flex items-center rounded-sm bg-ink-0 px-3 py-1 font-mono text-[11px] font-semibold text-surface-0">
        {v}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-line-strong px-2.5 py-1 text-[11px] font-medium text-ink-1">
      {k && <span className="text-ink-3">{k}</span>}
      <span>{v}</span>
    </span>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- kv-tag`
Expected: PASS — 3/3.

- [ ] **Step 5: Commit**

```bash
git add components/primitives/kv-tag.tsx components/__tests__/kv-tag.test.tsx
git commit -m "Add KvTag primitive (key+value chip + solid time-pill variant)"
```

---

## Task 3: `<Pulse>` primitive

The breathing dot — reused by `<EventRow active>` and the `<Scrubber>` playhead halo.

**Files:**
- Create: `components/primitives/pulse.tsx`
- Create: `components/__tests__/pulse.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Pulse } from "@/components/primitives/pulse";

describe("Pulse", () => {
  it("renders a sodium dot with the breath animation by default", () => {
    const { container } = render(<Pulse />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("animate-breath");
    expect(el).toHaveClass("bg-bloom");
  });

  it("omits the animation when active=false", () => {
    const { container } = render(<Pulse active={false} />);
    const el = container.firstChild as HTMLElement;
    expect(el).not.toHaveClass("animate-breath");
  });

  it("accepts size prop", () => {
    const { container } = render(<Pulse size="lg" />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("h-3.5");
    expect(el).toHaveClass("w-3.5");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- pulse`
Expected: FAIL with "Cannot find module '@/components/primitives/pulse'".

- [ ] **Step 3: Write the implementation**

```tsx
type Props = {
  active?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeClass = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-3.5 w-3.5"
} as const;

export function Pulse({ active = true, size = "md" }: Props) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block rounded-full bg-bloom ${sizeClass[size]} ${
        active ? "animate-breath" : ""
      }`}
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- pulse`
Expected: PASS — 3/3.

- [ ] **Step 5: Commit**

```bash
git add components/primitives/pulse.tsx components/__tests__/pulse.test.tsx
git commit -m "Add Pulse primitive (sodium breathing dot)"
```

---

## Task 4: `<MetricTile>` primitive

Compact stat card used in the inbox right rail and incident summary.

**Files:**
- Create: `components/primitives/metric-tile.tsx`
- Create: `components/__tests__/metric-tile.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricTile } from "@/components/primitives/metric-tile";

describe("MetricTile", () => {
  it("renders label and value", () => {
    render(<MetricTile label="Active investigations" value="03" />);
    expect(screen.getByText("Active investigations")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("renders unit suffix when provided", () => {
    render(<MetricTile label="Battery" value="23.4" unit="V" />);
    expect(screen.getByText("V")).toBeInTheDocument();
  });

  it("renders delta with up direction in ok color", () => {
    render(
      <MetricTile
        label="x"
        value="1"
        delta="↑ 1 vs yesterday"
        deltaDirection="up"
      />
    );
    expect(screen.getByText("↑ 1 vs yesterday")).toHaveClass("text-ok");
  });

  it("renders delta with down direction in err color", () => {
    render(
      <MetricTile label="x" value="1" delta="↓ 4m" deltaDirection="down" />
    );
    expect(screen.getByText("↓ 4m")).toHaveClass("text-err");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- metric-tile`
Expected: FAIL.

- [ ] **Step 3: Write the implementation**

```tsx
type Props = {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  deltaDirection?: "up" | "down" | "stable";
};

const deltaColor: Record<NonNullable<Props["deltaDirection"]>, string> = {
  up: "text-ok",
  down: "text-err",
  stable: "text-ink-3"
};

export function MetricTile({
  label,
  value,
  unit,
  delta,
  deltaDirection = "stable"
}: Props) {
  return (
    <div className="rounded-md border border-line bg-surface-1 px-4 py-3.5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1 font-mono text-2xl font-medium text-ink-0">
        {value}
        {unit && <span className="text-sm text-ink-3">{unit}</span>}
      </div>
      {delta && (
        <div
          className={`mt-1 font-mono text-[11px] ${deltaColor[deltaDirection]}`}
        >
          {delta}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- metric-tile`
Expected: PASS — 4/4.

- [ ] **Step 5: Commit**

```bash
git add components/primitives/metric-tile.tsx components/__tests__/metric-tile.test.tsx
git commit -m "Add MetricTile primitive"
```

---

## Task 5: `<Sparkline>` primitive

Sodium-glow line chart with a cursor-position bloom dot.

**Files:**
- Create: `components/primitives/sparkline.tsx`
- Create: `components/__tests__/sparkline.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sparkline } from "@/components/primitives/sparkline";

const sampleValues = [1, 2, 3, 4, 5, 6, 7, 8];

describe("Sparkline", () => {
  it("renders label and current value", () => {
    render(
      <Sparkline
        label="cmd_vel"
        values={sampleValues}
        cursorIndex={4}
      />
    );
    expect(screen.getByText("cmd_vel")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders a unit when provided", () => {
    render(
      <Sparkline
        label="battery"
        values={sampleValues}
        cursorIndex={0}
        unit="V"
      />
    );
    expect(screen.getByText("V")).toBeInTheDocument();
  });

  it("renders a delta when provided", () => {
    render(
      <Sparkline
        label="x"
        values={sampleValues}
        cursorIndex={0}
        delta="↓ 0.08"
      />
    );
    expect(screen.getByText("↓ 0.08")).toBeInTheDocument();
  });

  it("renders an SVG path for the line", () => {
    const { container } = render(
      <Sparkline label="x" values={sampleValues} cursorIndex={0} />
    );
    expect(container.querySelector("svg path")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- sparkline`
Expected: FAIL.

- [ ] **Step 3: Write the implementation**

```tsx
type Props = {
  label: string;
  values: number[];
  cursorIndex: number;
  unit?: string;
  delta?: string;
};

export function Sparkline({ label, values, cursorIndex, unit, delta }: Props) {
  const safeValues = values.length > 0 ? values : [0];
  const max = Math.max(...safeValues);
  const min = Math.min(...safeValues);
  const range = max - min || 1;
  const w = 200;
  const h = 36;

  const points = safeValues.map((v, i) => {
    const x = (i / Math.max(safeValues.length - 1, 1)) * w;
    const y = h - ((v - min) / range) * h;
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");

  const fillPath = `${linePath} L${w},${h} L0,${h} Z`;
  const cursor = points[Math.min(cursorIndex, points.length - 1)];
  const currentValue = safeValues[Math.min(cursorIndex, safeValues.length - 1)];

  return (
    <div className="rounded-md border border-line bg-surface-1 px-3.5 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline justify-between">
        <div className="font-mono text-lg font-medium text-ink-0">
          {currentValue}
          {unit && (
            <span className="ml-1 text-[11px] text-ink-3">{unit}</span>
          )}
        </div>
        {delta && (
          <span className="font-mono text-[10px] text-ink-3">{delta}</span>
        )}
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="mt-2 block h-9 w-full"
      >
        <path d={fillPath} fill="var(--data-bloom-soft)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--data-bloom)"
          strokeWidth={1.4}
          style={{ filter: "drop-shadow(0 0 3px rgba(255,159,80,0.5))" }}
        />
        <circle cx={cursor[0]} cy={cursor[1]} r={2.4} fill="var(--data-bloom)" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- sparkline`
Expected: PASS — 4/4.

- [ ] **Step 5: Commit**

```bash
git add components/primitives/sparkline.tsx components/__tests__/sparkline.test.tsx
git commit -m "Add Sparkline primitive (sodium-glow line + cursor bloom)"
```

---

## Task 6: `<EventRow>` primitive

A row in the event stream / key-moments list. Active row gets the pulsing dot + sodium left border.

**Files:**
- Create: `components/primitives/event-row.tsx`
- Create: `components/__tests__/event-row.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventRow } from "@/components/primitives/event-row";

describe("EventRow", () => {
  it("renders label and timestamp", () => {
    render(
      <EventRow label="Planner timeout" timestamp="04:12.380" severity="warn" />
    );
    expect(screen.getByText("Planner timeout")).toBeInTheDocument();
    expect(screen.getByText("04:12.380")).toBeInTheDocument();
  });

  it("renders severity dot color matching the severity prop", () => {
    const { container } = render(
      <EventRow label="x" timestamp="00:00" severity="err" />
    );
    expect(container.querySelector(".bg-err")).toBeTruthy();
  });

  it("applies the active sodium styling when active=true", () => {
    const { container } = render(
      <EventRow label="x" timestamp="00:00" severity="warn" active />
    );
    expect(container.querySelector(".border-l-bloom")).toBeTruthy();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <EventRow
        label="Planner timeout"
        timestamp="04:12.380"
        severity="warn"
        onClick={handleClick}
      />
    );
    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- event-row`
Expected: FAIL.

- [ ] **Step 3: Write the implementation**

```tsx
import { Pulse } from "@/components/primitives/pulse";

export type EventSeverity = "ok" | "warn" | "err" | "info";

type Props = {
  label: string;
  timestamp: string;
  severity: EventSeverity;
  active?: boolean;
  onClick?: () => void;
};

const sevDot: Record<EventSeverity, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  err: "bg-err",
  info: "bg-info"
};

export function EventRow({
  label,
  timestamp,
  severity,
  active = false,
  onClick
}: Props) {
  const base =
    "flex w-full items-center justify-between border-l-2 border-l-transparent px-3.5 py-2.5 text-left text-xs transition-all duration-200 ease-spring";
  const stateClasses = active
    ? "border-l-bloom bg-gradient-to-r from-bloom-soft via-bloom-soft/30 to-transparent pl-3"
    : "hover:bg-surface-2/40";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${stateClasses}`}
    >
      <span className="flex items-center gap-2">
        {active ? (
          <Pulse size="sm" />
        ) : (
          <span
            aria-hidden="true"
            className={`inline-block h-1.5 w-1.5 rounded-full ${sevDot[severity]}`}
          />
        )}
        <span
          className={`font-medium ${active ? "text-bloom-tint" : "text-ink-1"}`}
        >
          {label}
        </span>
      </span>
      <span className="font-mono text-ink-3">{timestamp}</span>
    </button>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- event-row`
Expected: PASS — 4/4.

- [ ] **Step 5: Commit**

```bash
git add components/primitives/event-row.tsx components/__tests__/event-row.test.tsx
git commit -m "Add EventRow primitive (severity dot + active pulse)"
```

---

## Task 7: `<Panel>` primitive

Generic surface wrapper with optional header (eyebrow + title + actions).

**Files:**
- Create: `components/primitives/panel.tsx`
- Create: `components/__tests__/panel.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Panel } from "@/components/primitives/panel";

describe("Panel", () => {
  it("renders children", () => {
    render(
      <Panel>
        <p>body content</p>
      </Panel>
    );
    expect(screen.getByText("body content")).toBeInTheDocument();
  });

  it("renders eyebrow and title in the header when provided", () => {
    render(
      <Panel eyebrow="Replay · Telemetry" title="cmd_vel.linear_x">
        <p>x</p>
      </Panel>
    );
    expect(screen.getByText("Replay · Telemetry")).toBeInTheDocument();
    expect(screen.getByText("cmd_vel.linear_x")).toBeInTheDocument();
  });

  it("renders actions in the header when provided", () => {
    render(
      <Panel
        title="x"
        actions={<button>action</button>}
      >
        <p>y</p>
      </Panel>
    );
    expect(screen.getByRole("button", { name: "action" })).toBeInTheDocument();
  });

  it("does not render the header when no eyebrow/title/actions are provided", () => {
    const { container } = render(
      <Panel>
        <p>body</p>
      </Panel>
    );
    expect(container.querySelector("header")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- panel`
Expected: FAIL.

- [ ] **Step 3: Write the implementation**

```tsx
import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

export function Panel({
  eyebrow,
  title,
  actions,
  children,
  className = "",
  bodyClassName = ""
}: Props) {
  const hasHeader = Boolean(eyebrow || title || actions);

  return (
    <section
      className={`overflow-hidden rounded-lg border border-line bg-surface-1 ${className}`}
    >
      {hasHeader && (
        <header className="flex items-start justify-between border-b border-line bg-surface-2 px-4 py-3.5">
          <div>
            {eyebrow && (
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
                {eyebrow}
              </div>
            )}
            {title && (
              <div className="mt-1.5 text-base font-semibold text-ink-0">
                {title}
              </div>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={`px-4 py-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- panel`
Expected: PASS — 4/4.

- [ ] **Step 5: Commit**

```bash
git add components/primitives/panel.tsx components/__tests__/panel.test.tsx
git commit -m "Add Panel primitive"
```

---

## Task 8: `<Scrubber>` centerpiece

The master timeline scrubber. Reusable across Replay, Compare, and the Marketing hero.

**Files:**
- Create: `components/primitives/scrubber.tsx`
- Create: `components/__tests__/scrubber.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Scrubber } from "@/components/primitives/scrubber";

const events = [
  { id: "a", label: "Mission start", ms: 0, severity: "info" as const },
  { id: "b", label: "Localization drop", ms: 9220, severity: "warn" as const },
  { id: "c", label: "Planner timeout", ms: 12380, severity: "err" as const }
];

describe("Scrubber", () => {
  it("renders the cursor timestamp", () => {
    render(
      <Scrubber
        events={events}
        currentMs={12380}
        durationMs={12910}
        onSeek={() => {}}
      />
    );
    expect(screen.getByText(/T\+/)).toBeInTheDocument();
  });

  it("renders a marker per event with severity color", () => {
    const { container } = render(
      <Scrubber
        events={events}
        currentMs={0}
        durationMs={12910}
        onSeek={() => {}}
      />
    );
    expect(container.querySelectorAll("[data-event-marker]").length).toBe(3);
    expect(container.querySelector("[data-severity='err']")).toBeTruthy();
  });

  it("calls onSeek with the clicked event timestamp", async () => {
    const user = userEvent.setup();
    const onSeek = vi.fn();
    render(
      <Scrubber
        events={events}
        currentMs={0}
        durationMs={12910}
        onSeek={onSeek}
      />
    );
    await user.click(
      screen.getByRole("button", { name: /Localization drop/i })
    );
    expect(onSeek).toHaveBeenCalledWith(9220);
  });

  it("calls onPlayToggle when play is clicked", async () => {
    const user = userEvent.setup();
    const onPlayToggle = vi.fn();
    render(
      <Scrubber
        events={events}
        currentMs={0}
        durationMs={12910}
        onSeek={() => {}}
        onPlayToggle={onPlayToggle}
      />
    );
    await user.click(screen.getByRole("button", { name: /play/i }));
    expect(onPlayToggle).toHaveBeenCalledOnce();
  });

  it("seeks when the track itself is clicked", () => {
    const onSeek = vi.fn();
    const { container } = render(
      <Scrubber
        events={events}
        currentMs={0}
        durationMs={10000}
        onSeek={onSeek}
      />
    );
    const track = container.querySelector("[data-scrub-track]") as HTMLElement;
    Object.defineProperty(track, "getBoundingClientRect", {
      value: () => ({ left: 0, width: 200, top: 0, height: 36 }),
      configurable: true
    });
    fireEvent.click(track, { clientX: 100 });
    expect(onSeek).toHaveBeenCalledWith(5000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- scrubber`
Expected: FAIL.

- [ ] **Step 3: Write the implementation**

```tsx
"use client";

import type { MouseEvent } from "react";

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

export function Scrubber({
  events,
  currentMs,
  durationMs,
  onSeek,
  onPlayToggle,
  isPlaying = false
}: Props) {
  const safeDuration = Math.max(durationMs, 1);
  const progressPct = Math.min(100, (currentMs / safeDuration) * 100);

  const handleTrackClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.round(ratio * safeDuration));
  };

  const axisLabels = Array.from({ length: 5 }, (_, i) =>
    fmt((i / 4) * safeDuration)
  );

  return (
    <div className="rounded-md border border-line bg-surface-1 px-5 py-3.5">
      <div className="mb-2 flex items-center justify-between text-[11px] text-ink-3">
        <span>
          Mission window · {(safeDuration / 1000).toFixed(2)} s ·{" "}
          {events.length} events
        </span>
        <span className="font-mono text-bloom">T+{fmt(currentMs)}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="previous"
            onClick={() => onSeek(Math.max(0, currentMs - 1000))}
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
            onClick={() => onSeek(Math.min(safeDuration, currentMs + 1000))}
            className="flex h-6 w-6 items-center justify-center rounded-xs border border-line-strong text-ink-1 transition hover:text-ink-0"
          >
            ››
          </button>
        </div>

        <div
          data-scrub-track
          onClick={handleTrackClick}
          className="relative h-9 flex-1 cursor-pointer select-none"
        >
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
          <div
            className="absolute left-0 top-1/2 h-px -translate-y-1/2 rounded-full shadow-bloom"
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
                className="absolute top-1/2 h-3.5 w-px -translate-y-1/2"
                style={{
                  left: `${left}%`,
                  background: sevColor[evt.severity],
                  boxShadow: `0 0 6px ${sevColor[evt.severity]}`
                }}
              />
            );
          })}
          <div
            aria-hidden="true"
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bloom shadow-bloom-strong"
            style={{ left: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="mt-2 flex justify-between pl-[88px] font-mono text-[10px] text-ink-3">
        {axisLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- scrubber`
Expected: PASS — 5/5.

- [ ] **Step 5: Commit**

```bash
git add components/primitives/scrubber.tsx components/__tests__/scrubber.test.tsx
git commit -m "Add Scrubber primitive (centerpiece timeline component)"
```

---

## Task 9: Refactor `<StatusBadge>` to semantic tokens

Drops mint accent + danger/warning legacy colors in favor of new semantic tokens. Sodium is never a status badge color.

**Files:**
- Modify: `components/status-badge.tsx`
- Modify: `components/__tests__/status-badge.test.tsx`

- [ ] **Step 1: Extend the existing test**

Replace the file contents:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeverityBadge, StatusBadge } from "@/components/status-badge";

describe("SeverityBadge", () => {
  it("renders the severity label", () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByText("critical")).toBeInTheDocument();
  });

  it("uses the err semantic color for critical", () => {
    render(<SeverityBadge severity="critical" />);
    expect(screen.getByText("critical")).toHaveClass("text-err");
  });

  it("uses the warn semantic color for high", () => {
    render(<SeverityBadge severity="high" />);
    expect(screen.getByText("high")).toHaveClass("text-warn");
  });

  it("uses the info semantic color for medium", () => {
    render(<SeverityBadge severity="medium" />);
    expect(screen.getByText("medium")).toHaveClass("text-info");
  });
});

describe("StatusBadge", () => {
  it("renders the status label", () => {
    render(<StatusBadge status="investigating" />);
    expect(screen.getByText("investigating")).toBeInTheDocument();
  });

  it("uses the info semantic color for investigating", () => {
    render(<StatusBadge status="investigating" />);
    expect(screen.getByText("investigating")).toHaveClass("text-info");
  });

  it("uses the ok semantic color for resolved", () => {
    render(<StatusBadge status="resolved" />);
    expect(screen.getByText("resolved")).toHaveClass("text-ok");
  });

  it("does not use the bloom (sodium) color for any status", () => {
    const { container: c1 } = render(<StatusBadge status="new" />);
    const { container: c2 } = render(<StatusBadge status="investigating" />);
    const { container: c3 } = render(<StatusBadge status="resolved" />);
    expect(c1.querySelector(".text-bloom")).toBeNull();
    expect(c2.querySelector(".text-bloom")).toBeNull();
    expect(c3.querySelector(".text-bloom")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- status-badge`
Expected: FAIL — class assertions miss because old classes are mint-cyan.

- [ ] **Step 3: Rewrite `components/status-badge.tsx`**

```tsx
import { IncidentSeverity, IncidentStatus } from "@/lib/types";

const severityClasses: Record<IncidentSeverity, string> = {
  critical: "bg-err/10 text-err",
  high: "bg-warn/10 text-warn",
  medium: "bg-info/10 text-info",
  low: "bg-ink-3/10 text-ink-2"
};

const statusClasses: Record<IncidentStatus, string> = {
  new: "bg-ink-3/10 text-ink-2",
  investigating: "bg-info/10 text-info",
  resolved: "bg-ok/10 text-ok"
};

export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  return (
    <span
      className={`inline-flex items-center rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ${severityClasses[severity]}`}
    >
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- status-badge`
Expected: PASS — 8/8.

- [ ] **Step 5: Commit**

```bash
git add components/status-badge.tsx components/__tests__/status-badge.test.tsx
git commit -m "Refactor StatusBadge to semantic tokens (no sodium)"
```

---

## Task 10: `<SideNav>` primitive

The 56px icon-only side nav.

**Files:**
- Create: `components/primitives/side-nav.tsx`
- Create: `components/__tests__/side-nav.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SideNav } from "@/components/primitives/side-nav";

const items = [
  { href: "/app/incidents", label: "Incidents", icon: "incidents" as const },
  { href: "/app/uploads", label: "Uploads", icon: "uploads" as const },
  { href: "/app/settings", label: "Settings", icon: "settings" as const }
];

describe("SideNav", () => {
  it("renders the brand mark", () => {
    render(<SideNav items={items} activeHref="/app/incidents" />);
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("renders one link per item with an aria-label matching the item label", () => {
    render(<SideNav items={items} activeHref="/app/incidents" />);
    expect(
      screen.getByRole("link", { name: "Incidents" })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Uploads" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
  });

  it("marks the active item via aria-current", () => {
    render(<SideNav items={items} activeHref="/app/uploads" />);
    expect(screen.getByRole("link", { name: "Uploads" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Incidents" })).not.toHaveAttribute(
      "aria-current"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- side-nav`
Expected: FAIL.

- [ ] **Step 3: Write the implementation**

```tsx
import Link from "next/link";

export type SideNavIcon = "incidents" | "uploads" | "search" | "settings";

export type SideNavItem = {
  href: string;
  label: string;
  icon: SideNavIcon;
};

type Props = {
  items: SideNavItem[];
  activeHref: string;
};

function Icon({ name }: { name: SideNavIcon }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5
  } as const;
  switch (name) {
    case "incidents":
      return (
        <svg {...common}>
          <path d="M2 3h12M2 8h12M2 13h12" />
        </svg>
      );
    case "uploads":
      return (
        <svg {...common}>
          <path d="M8 11V3M4 7l4-4 4 4M2 13h12" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="4.5" />
          <path d="M14 14l-3.5-3.5" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="2" />
          <path d="M8 1v2M8 13v2M15 8h-2M3 8H1M12.95 3.05l-1.42 1.42M4.47 11.53l-1.42 1.42M12.95 12.95l-1.42-1.42M4.47 4.47L3.05 3.05" />
        </svg>
      );
  }
}

export function SideNav({ items, activeHref }: Props) {
  return (
    <aside className="flex w-14 flex-col items-center gap-1 border-r border-line bg-surface-0 py-3.5">
      <Link
        href="/"
        aria-label="TraceAxis home"
        className="mb-3 flex h-7 w-7 items-center justify-center rounded-sm bg-ink-0 text-sm font-bold text-surface-0"
      >
        T
      </Link>
      {items.map((item) => {
        const isActive = activeHref.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-sm transition ${
              isActive
                ? "bg-surface-1 text-ink-0 shadow-[inset_2px_0_0_var(--data-bloom)]"
                : "text-ink-3 hover:bg-surface-1 hover:text-ink-1"
            }`}
          >
            <Icon name={item.icon} />
          </Link>
        );
      })}
    </aside>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- side-nav`
Expected: PASS — 3/3.

- [ ] **Step 5: Commit**

```bash
git add components/primitives/side-nav.tsx components/__tests__/side-nav.test.tsx
git commit -m "Add SideNav primitive (56px icon-only nav)"
```

---

## Task 11: `<TopBar>` primitive

Compact top bar — breadcrumb on the left, actions on the right.

**Files:**
- Create: `components/primitives/top-bar.tsx`
- Create: `components/__tests__/top-bar.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopBar } from "@/components/primitives/top-bar";

describe("TopBar", () => {
  it("renders breadcrumb segments separated by '/'", () => {
    render(<TopBar crumbs={["Incidents", "Phoenix DC", "INC-2384"]} />);
    expect(screen.getByText("Incidents")).toBeInTheDocument();
    expect(screen.getByText("Phoenix DC")).toBeInTheDocument();
    expect(screen.getByText("INC-2384")).toBeInTheDocument();
    expect(screen.getAllByText("/").length).toBe(2);
  });

  it("highlights the last crumb as the current page", () => {
    render(<TopBar crumbs={["Incidents", "INC-2384"]} />);
    expect(screen.getByText("INC-2384")).toHaveClass("text-ink-0");
  });

  it("renders actions when provided", () => {
    render(
      <TopBar
        crumbs={["x"]}
        actions={<button>Share</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- top-bar`
Expected: FAIL.

- [ ] **Step 3: Write the implementation**

```tsx
import type { ReactNode } from "react";

type Props = {
  crumbs: string[];
  actions?: ReactNode;
};

export function TopBar({ crumbs, actions }: Props) {
  return (
    <div className="flex items-center justify-between border-b border-line bg-surface-0 px-5 py-3">
      <nav
        aria-label="breadcrumb"
        className="flex items-center gap-2 text-xs text-ink-3"
      >
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <span key={`${crumb}-${idx}`} className="flex items-center gap-2">
              {idx > 0 && <span className="text-line-strong">/</span>}
              <span
                className={isLast ? "font-medium text-ink-0" : ""}
              >
                {crumb}
              </span>
            </span>
          );
        })}
      </nav>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- top-bar`
Expected: PASS — 3/3.

- [ ] **Step 5: Commit**

```bash
git add components/primitives/top-bar.tsx components/__tests__/top-bar.test.tsx
git commit -m "Add TopBar primitive (breadcrumb + actions)"
```

---

## Task 12: Refactor `<Brand>` to monochrome titanium

**Files:**
- Modify: `components/brand.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-ink-0 text-sm font-bold text-surface-0">
        T
      </div>
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-ink-0">
          TraceAxis
        </div>
        <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-ink-3">
          Incident Replay
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Verify the project still builds**

Run: `npm run build`
Expected: build succeeds.

Run: `npm run test:run`
Expected: all existing tests still pass.

- [ ] **Step 3: Commit**

```bash
git add components/brand.tsx
git commit -m "Refactor Brand to monochrome titanium"
```

---

## Task 13: Refactor `<AppShell>` to use new SideNav + TopBar

Preserves the `AppShell` public API (`title`, `subtitle`, `children`, `actions`) so all existing pages keep working without edits.

**Files:**
- Modify: `components/app-shell.tsx`
- Create: `components/__tests__/app-shell.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/app-shell";

describe("AppShell", () => {
  it("renders the title and subtitle", () => {
    render(
      <AppShell title="Incident Inbox" subtitle="Scan recent failures.">
        <p>body</p>
      </AppShell>
    );
    expect(screen.getByText("Incident Inbox")).toBeInTheDocument();
    expect(screen.getByText("Scan recent failures.")).toBeInTheDocument();
  });

  it("renders the children", () => {
    render(
      <AppShell title="x" subtitle="y">
        <p data-testid="child">body</p>
      </AppShell>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders the side nav with all three nav targets", () => {
    render(
      <AppShell title="x" subtitle="y">
        <p>body</p>
      </AppShell>
    );
    expect(screen.getByRole("link", { name: "Incidents" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Uploads" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
  });

  it("renders header actions when provided", () => {
    render(
      <AppShell
        title="x"
        subtitle="y"
        actions={<button>Upload Run</button>}
      >
        <p>body</p>
      </AppShell>
    );
    expect(
      screen.getByRole("button", { name: "Upload Run" })
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:run -- app-shell`
Expected: FAIL — current AppShell doesn't render aria-labelled nav links because it uses plain Link text.

- [ ] **Step 3: Replace `components/app-shell.tsx`**

```tsx
import { SideNav, type SideNavItem } from "@/components/primitives/side-nav";
import { TopBar } from "@/components/primitives/top-bar";

const navItems: SideNavItem[] = [
  { href: "/app/incidents", label: "Incidents", icon: "incidents" },
  { href: "/app/uploads", label: "Uploads", icon: "uploads" },
  { href: "/app/settings", label: "Settings", icon: "settings" }
];

export function AppShell({
  title,
  subtitle,
  children,
  actions,
  activeHref = "/app/incidents",
  crumbs
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  activeHref?: string;
  crumbs?: string[];
}) {
  const breadcrumb = crumbs ?? [title];

  return (
    <div className="flex min-h-screen bg-surface-0 text-ink-1">
      <SideNav items={navItems} activeHref={activeHref} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar crumbs={breadcrumb} actions={actions} />
        <header className="border-b border-line px-6 py-5">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-ink-0">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-2">
            {subtitle}
          </p>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:run -- app-shell`
Expected: PASS — 4/4.

- [ ] **Step 5: Verify the dev build still works end-to-end**

Run: `npm run build`
Expected: build succeeds.

Manual check (start `npm run dev` separately if you want a visual): visit `/app/incidents` — page should render with the new slim side nav, compact top bar, and the existing incident list / right rail (those still use legacy classes — that's intentional; subsequent plans rebuild them).

- [ ] **Step 6: Commit**

```bash
git add components/app-shell.tsx components/__tests__/app-shell.test.tsx
git commit -m "Refactor AppShell to use SideNav + TopBar (preserves API)"
```

---

## Task 14: Final verification

- [ ] **Step 1: Full test suite green**

Run: `npm run test:run`
Expected: all tests pass — original 2 status-badge tests are now 8, plus 4 panel + 3 pulse + 3 kv-tag + 4 sparkline + 4 event-row + 4 metric-tile + 5 scrubber + 3 side-nav + 3 top-bar + 4 app-shell = 45 tests across 11 files.

- [ ] **Step 2: Build green**

Run: `npm run build`
Expected: `next build` succeeds with no TypeScript or lint errors.

- [ ] **Step 3: Manual UI walkthrough**

Run: `npm run dev` and visit each route. Confirm:
- `/` (marketing) — still uses legacy `.panel` classes; renders without errors
- `/app/incidents` — new shell, legacy incident list inside it; renders without errors
- `/app/incidents/<sample id>` — new shell, legacy replay workspace inside it; renders without errors
- `/app/uploads` — new shell, legacy upload form inside it; renders without errors
- `/app/settings` — new shell, settings content inside it; renders without errors

Visual targets:
- Side nav is 56px icon-only, dark `--surface-0`
- Top bar shows breadcrumb on the left
- No grid-paper background overlay anywhere
- Body font is IBM Plex Sans
- Legacy panels render flat (no glass / blur), with the new flat `.panel` style backed by tokens

- [ ] **Step 4: No commit needed (verification only)**

Plan 1 complete. Plans 2-5 (Replay rebuild, Inbox + Uploads, Compare + Summary, Marketing + Polish) can now consume these primitives.

---

## Self-review

**Spec coverage:**
- Section 3 tokens → Task 1 ✓
- Section 4.1 Panel → Task 7 ✓
- Section 4.2 Buttons → spec says "outlined / solid white / ghost" — applied inline within other components (TopBar action slot, Scrubber play button); a dedicated `<Button>` primitive is not strictly required and would be over-engineering for v1. Subsequent plans will use the same inline pattern. (Acknowledged trade-off.)
- Section 4.3 KvTag → Task 2 ✓
- Section 4.4 StatusBadge → Task 9 ✓
- Section 4.5 EventRow → Task 6 ✓
- Section 4.6 Sparkline → Task 5 ✓
- Section 4.7 Topic inspector row → not in this plan (consumed by Replay Console rebuild — Plan 2)
- Section 4.8 MetricTile → Task 4 ✓
- Section 4.9 Scrubber → Task 8 ✓
- Section 5.1 App shell (SideNav + TopBar + AppShell) → Tasks 10, 11, 13 ✓
- Section 5.2-5.7 screen layouts → deferred to Plans 2-5
- Section 6.2 foundational changes → Task 1 ✓ (with the documented exception that legacy utility classes stay until Plan 5 strips them)
- Section 6.3 component refactors → StatusBadge (Task 9), AppShell (Task 13), Brand (Task 12); other refactors deferred to per-screen plans
- Section 6.4 new components → all primitives covered (Tasks 2-8, 10, 11)
- Pulse primitive (used by EventRow + Scrubber) → Task 3 ✓

**Placeholder scan:** none.

**Type consistency:** `EventSeverity` defined in `event-row.tsx`; `ScrubberEvent.severity` uses the same string union inline (`"ok" | "warn" | "err" | "info"`). Plan 2 will consolidate these into a shared type when both are wired into the Replay Console — out of scope for this plan since they are independent at the moment.
