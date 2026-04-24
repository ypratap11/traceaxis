# TraceAxis UI Redesign — Hybrid (Titanium chrome + Sodium data)

Date: 2026-04-23
Status: Approved design, ready for implementation planning
Owner: Pratap Yeragudipati

---

## 1. Goal

Replace the current TraceAxis UI (built by Codex, mint-cyan accents on rounded glass panels over a grid-paper background) with a redesign that reads as a **Boston Dynamics × Apple** engineering tool: dense but calm, restrained chrome, with the "alive" character of robotics expressed through motion and the way data renders.

This spec defines the design system, component patterns, screen layouts, and implementation approach. It does not change product scope, the data model, the API surface, or the route map defined in `docs/incident-replay-app-spec.md`.

## 2. Design principles

1. **Engineering tool, not consumer dashboard.** Hard edges, single-pixel borders, monospace for numbers, key-value tag readouts. No glassmorphism, no decorative gradients, no rounded-pillow corners.
2. **Dense but calm.** Bloomberg-grade information density, ordered by Apple-grade hierarchy. Lots on screen, no clutter.
3. **Static reads cool. Active reads warm.** Chrome is monochrome titanium. Sodium amber lives only inside the data layer (charts, scrub cursor, active event marker, telemetry trails). A static screenshot looks pure Apple; the moment you interact, sodium light blooms.
4. **Motion is the second half of the brand.** Apple-spring easing on every transition. A 1.6s breath pulse on the active event marker. Data-point bloom on scrub. Nothing decorative — every motion reinforces temporal navigation or active state.
5. **Numbers are mono. Always.** Timestamps, voltages, percentages, counts, IDs.

## 3. Design tokens

### 3.1 Color

Tokens defined as CSS custom properties on `:root`. All UI should reference tokens, never literal hex values.

| Token | Hex | Used for |
|---|---|---|
| `--surface-0` | `#0b0e13` | App background |
| `--surface-1` | `#10151c` | Panel base |
| `--surface-2` | `#171d27` | Raised elements (panel headers, active chips) |
| `--line` | `#1d232c` | Borders (1px, never glowing) |
| `--line-strong` | `#2a3038` | Section dividers, secondary outlines |
| `--ink-0` | `#f5f7fa` | Primary text, "white accent" (active pills, hard highlights) |
| `--ink-1` | `#d1d5db` | Body text |
| `--ink-2` | `#8b95a3` | Secondary text |
| `--ink-3` | `#5b6573` | Muted / metadata / eyebrow labels |
| `--data-bloom` | `#ff9f50` | **Sodium amber. Data layer only.** Charts, scrub cursor, active event marker, telemetry trails. |
| `--data-bloom-soft` | `rgba(255,159,80,0.14)` | Glow halo, gradient fills under charts |
| `--data-bloom-tint` | `#ffb47a` | Lighter sodium for active text on `<EventRow>` (label color when active) |
| `--ok` | `#5cd6a8` | Healthy / success |
| `--warn` | `#ffc857` | Warning (semantic — distinct from sodium) |
| `--err` | `#ff6e7a` | Error / danger |
| `--info` | `#7ab7ff` | Info |

**Strict rule (chrome/data separation):** chrome (panels, type, controls, chips, eyebrows) is monochrome titanium. `--data-bloom` only appears where data lives or where data flows through. Violating this rule weakens the static-cool / active-warm contrast that defines the brand.

Status colors (`--ok`, `--warn`, `--err`, `--info`) are used for semantic state and are intentionally distinct from `--data-bloom`. Specifically, `--warn` (yellow) ≠ `--data-bloom` (amber), so a warning marker on a sodium chart remains visually distinct.

### 3.2 Typography

- **UI sans:** IBM Plex Sans (400 / 500 / 600 / 700) — replaces Space Grotesk
- **Mono:** IBM Plex Mono (400 / 500) — for timestamps, topic names, telemetry values, IDs
- Loaded via `next/font/google` in `app/layout.tsx`

**Scale** (no half-steps): 11 / 13 / 15 / 18 / 24 / 32 / 48 px

**Tracking:**
- Display sizes (24+): `-0.02em`
- Body (13-18): `0`
- Small uppercase labels (eyebrows, status badges): `+0.18em` to `+0.22em`

**Weight:** 400 default body, 500 for emphasis and chips, 600 for titles and primary buttons.

### 3.3 Surface treatment

- **Radius scale:** 4 (badges, mini chips), 6 (chips, buttons, inner panels, event rows), 8 (cards, charts), 12 (top-level panels, app shell). **Maximum radius is 12px.** No 16+, no 28.
- **Borders:** single 1px, `var(--line)` for default, `var(--line-strong)` for strong dividers. Never glowing or doubled.
- **No glassmorphism.** No `backdrop-filter: blur()`. Surfaces are opaque.
- **No grid-paper background overlay.** Drop the `body::before` grid pattern from the current `globals.css`.
- **No radial gradient backgrounds.** Drop the mint/blue glows on `html` and `body` from the current `globals.css`.
- **Depth via layered surfaces** (`--surface-0/1/2`), not via shadow or gradient. Default panel: `--surface-1` body, `--surface-2` header, `--surface-0` page background.

### 3.4 Motion

The "organic" half of the brief lives here.

- **Default easing:** `cubic-bezier(0.32, 0.72, 0, 1)` (Apple spring). Set as `--ease-out` CSS var. Replaces all default `ease`, `ease-in-out`, etc.
- **Durations:** 120ms (micro: hover, focus), 240ms (default: state change), 380ms (large layout shifts)
- **Breath:** active event-row dot pulses on a 1.6s `ease-in-out infinite` cycle. Box-shadow halo expands from 3px / 6px-blur to 5px / 14px-blur and back. Pulse applies only to the dot — never the row text or background.
- **Bloom:** when the scrub cursor lands on a data point, the point briefly enlarges and brightens for 180ms then settles. Implemented as a transient class added on cursor change.
- **Settle:** modals, panels, and route transitions fade in with a 4px translate-Y. They do not slide from off-screen.

## 4. Component patterns

All components are reusable building blocks. Screens compose from these — they do not introduce new patterns inline.

### 4.1 Panel

- `--surface-1` body, 12px radius, 1px border `--line`
- Optional header bar: `--surface-2`, padding 14px 18px, 1px bottom border `--line`
- Header contains an eyebrow label (`--ink-3`, uppercase, +0.22em tracking) above a title (`--ink-0`, 18px, 600)
- Body padding: 16-18px

### 4.2 Buttons

- **Primary:** solid `--ink-0` background, `--surface-0` text, 6px radius, 600 weight, 12px font, padding 7px 14px. **One per view.** Reserved for the action that moves the workflow forward (Upload Run, Open Replay, Open Summary, Share).
- **Secondary:** transparent background, 1px border `--line-strong`, `--ink-1` text, 500 weight. Hover lifts border to a slightly stronger gray and text to `--ink-0`.
- **Ghost:** transparent background, no border, `--ink-2` text. Hover lifts text to `--ink-1`. Used for cancel-style actions.

### 4.3 Chips (key-value tags)

Chips replace pill-style capsules. Pattern:

```
[ key  value ]
```

- Background transparent, 1px border `--line-strong`, 6px radius, 11px font, padding 5px 10px
- Key in `--ink-3`, value in `--ink-1`
- Variant: **solid time pill** — `--ink-0` background, `--surface-0` text, monospace, used for the active timestamp marker (e.g. `T+04:12.380`). One per panel maximum.

### 4.4 Status badges

- Semantic colors: `b-ok`, `b-warn`, `b-err`, `b-info`
- Pattern: 5px colored dot + uppercase label, 10px font, 600 weight, +0.04em tracking, 4px radius
- Background is the semantic color at 10% opacity; text and dot are the semantic color at 100%
- **Sodium is never a status badge color** — it is reserved for data layer only

### 4.5 Event row

- Used in the Replay Console event stream and in the incident summary "key moments" list
- Inactive: 12px font, 5px severity dot (semantic color), label in `--ink-1`, timestamp in `--ink-3` mono, padding 10px 14px, 1px top border between rows
- Active: 2px left border `--data-bloom`, gradient left-to-transparent background using `--data-bloom-soft`, label color shifts to `--data-bloom-tint`, severity dot becomes `--data-bloom` and pulses (Section 3.4)
- Click: jumps the master scrubber to that event's timestamp

### 4.6 Telemetry sparkline tile

- Compact card: panel surface, 8px radius, padding 10px 14px 12px
- Header row: small uppercase label (left), monospace value with optional unit (left, large), monospace delta (right, with up/down arrow and semantic color for direction)
- Sparkline below: 36px tall, sodium line at 1.4px stroke with `drop-shadow(0 0 3px rgba(255,159,80,0.5))` glow, sodium fill at 10% opacity below the line, cursor-position dot at the playhead time
- Sparkline is synchronized to the master scrubber cursor (cursor on scrubber = bloom dot on every sparkline)

### 4.7 Topic inspector row

- Mono topic name (12-13px, `--ink-0`)
- Pinned topics get a leading sodium dot (`•`) — this is one of the few sodium uses outside a chart, justified because pinning means "this topic is being watched as data"
- Below the name: secondary metadata in mono `--ink-3` (message type, sample count, optional time range)
- Optional row of key-value chips below for active values

### 4.8 Metric tile

- For inbox & summary screens
- Panel surface, 8px radius, padding 14px 16px
- Pattern: small uppercase key label, then a large monospace value (24px), then a delta line (11px) with semantic color (green up arrow, red down arrow)

### 4.9 Master timeline scrubber

The centerpiece component. Reused across Replay Console, Compare View, and the Marketing home hero.

- Panel surface, 8px radius, padding 14px 22px 18px
- Header row: mission window label and event count (left, `--ink-3`), cursor timestamp (right, mono, `--data-bloom`)
- Controls (24px square buttons): prev / play / next. Play button uses primary-button styling (white solid).
- Track:
  - 36px tall track region with tick marks every 100ms (1px wide, `--line-strong`) and major ticks every second (slightly taller, `--ink-3`)
  - 2px center rail in `--line`
  - Progress fill from start to playhead: linear gradient from transparent to `--data-bloom`, with `0 0 12px rgba(255,159,80,0.5)` glow
  - Event markers: 1px wide × 14px tall vertical bars positioned at event time, colored by severity (`--warn` / `--err` / `--info`), each with a soft glow at 4-6px blur. **Sodium playhead is the only marker that's bloom-amber.**
  - Playhead: 14px circle at `--data-bloom`, with 3px static halo + 16px outer glow
- Axis labels below: 5 evenly-spaced timestamps in mono `--ink-3`

## 5. Screen layouts

All screens use the new app shell (Section 5.1). All screens compose from Section 4 components.

### 5.1 App shell

- 56px icon-only side nav (replaces current 280px sidebar)
  - Logo square at the top (`--ink-0` background, brand letter "T")
  - 36px square icon buttons: Incidents, Uploads, Search, (gap), Settings, user avatar
  - Active item: `--surface-1` background + 2px left inset shadow in `--data-bloom`
- Top bar inside main column: 12px vertical padding, breadcrumb (left), action buttons (right). Bottom border `--line`.
- Main content: full-bleed below top bar; each route renders its own layout

### 5.2 Marketing home (`/`)

- Full-width hero section
  - Headline: "Find robot failures faster." (48px, `--ink-0`, -0.02em)
  - Subhead: existing copy
  - Primary CTA: "View Sample Incident" (white solid). Secondary: "Book Demo".
  - Hero element below the copy: the actual `<Scrubber />` component, slowly auto-playing through pre-baked event markers — this *is* the marketing material. No screenshot of the product needed; the product is on the page.
- Three value-prop panels (existing copy lines preserved)
- Workflow section: three numbered cards with the existing 3-step workflow text
- Footer

### 5.3 Incident Inbox (`/app/incidents`)

- Slim left filter rail (~220px): severity, status, robot, site, software version. Each filter is a list of toggle pills.
- Main: dense table-style list. One row per incident, columns: severity dot + title, robot, site, version, time (relative), status badge. Row click opens the Replay Console.
- Right rail (~320px): "Today" metric tiles (new, investigating, total) + "Focus" panel (recurring failure cluster, copied from existing screen)

### 5.4 Replay Console (`/app/incidents/[incidentId]`)

The make-or-break screen. Layout as mocked up:

- Top bar: breadcrumb + actions (Compare / Share / Export / Open Summary)
- Incident header: meta line (id + detected time), incident title, severity badge + key-value chip row (robot / site / version / duration)
- Main grid (`1fr 320px` columns):
  - Left (center pane):
    - Stage row (`1.4fr 1fr` split): video pane on the left, event stream on the right
    - Telemetry row: 3 sparkline tiles (`cmd_vel.linear_x`, `localization confidence`, `battery voltage`) — defaults; user can swap from the topic inspector
  - Right (rail): topic inspector (search + pinned/all list) on top, "Robot state @ cursor" 2-column key-value grid below
- Sticky bottom: master timeline scrubber

The event under the playhead is always the active event in the stream (animated highlight). The sparkline cursor dots all reflect the playhead position.

### 5.5 Compare View (`/app/incidents/[incidentId]/compare`)

- Same shell as Replay
- Diff strip across the top: 3-4 chips summarizing key differences (e.g., "localization confidence: -32%", "cmd_vel: dropped 0.4s earlier", "battery: stable in both"). Sodium accents on the worse-performing side.
- Stage splits into two video panes side-by-side, two event streams stacked, two telemetry rows stacked
- **Single shared scrubber at the bottom drives both.** This is the design's core reason — comparison is impossible if the timelines aren't locked.

### 5.6 Incident Summary (`/app/incidents/[incidentId]/summary`)

- Narrow centered column (max-width ~720px), reads like a report
- Title + severity badge
- Root-cause hypothesis paragraph (editable)
- "Key moments" list — each item uses the EventRow pattern, clicking jumps back to the Replay Console at that timestamp
- Notes section
- Bookmarks list
- Export button (primary)

### 5.7 Uploads (`/app/uploads`)

- Single dropzone panel: large dashed border (`--line-strong`), centered icon + "Drop a ROS bag or log archive" copy + "or browse" button
- Below: list of in-progress and recent uploads. One row per upload: filename (mono), size, parse status badge, tiny progress bar for in-progress ones. Once `ready`, the row reveals an "Open as incident" primary button.

## 6. Implementation approach

### 6.1 What stays

- Next.js 16 + React 19 + Tailwind project structure
- App router, route map, page composition
- Data layer (`lib/data`, `lib/store`, `lib/types`)
- API routes (`app/api/incidents/*`, `app/api/uploads`)
- Existing entity definitions in `docs/incident-replay-app-spec.md`

### 6.2 Foundational changes (do first; everything else depends)

- `tailwind.config.ts`
  - Replace `colors` palette with new tokens (mapped from CSS vars)
  - Add IBM Plex Sans / Plex Mono to `fontFamily.sans` and `fontFamily.mono`
  - Tighten `borderRadius` scale (cap at 12px)
  - Add `transitionTimingFunction.spring` = `cubic-bezier(0.32, 0.72, 0, 1)`
  - Add `boxShadow.bloom` utility for the sodium glow
- `app/globals.css`
  - Remove `body::before` grid overlay
  - Remove all `radial-gradient` declarations on `html` and `body`
  - Remove `.panel`, `.panel-muted`, `.panel-interactive`, `.kpi`, `.metric-tile`, `.control-chip`, `.control-chip-accent`, `.field-shell`, `.eyebrow` — they're being replaced with components
  - Define new CSS custom properties from Section 3.1
  - Set `--ease-out` CSS var
  - Body background = `var(--surface-0)`, font-family = Plex Sans
- `app/layout.tsx`
  - Load IBM Plex Sans and Plex Mono via `next/font/google`
  - Apply to `<body>`

### 6.3 Component refactors

| File | Change |
|---|---|
| `components/app-shell.tsx` | 280px sidebar → 56px icon-only side nav; new compact top bar |
| `components/marketing-shell.tsx` | Lighter chrome; remove `.panel-interactive` hover lift |
| `components/replay-workspace.tsx` | Full rebuild to match Section 5.4 layout (largest single change) |
| `components/incident-list.tsx` | Card grid → dense table-row list (Section 5.3) |
| `components/upload-form.tsx` | Single dropzone + status row pattern (Section 5.7) |
| `components/telemetry-chart.tsx` | Bar chart → sodium-glow sparkline (Section 4.6) |
| `components/status-badge.tsx` | Use semantic colors only (no sodium) |
| `components/topic-inspector.tsx` | New row pattern: mono name + key-value tags (Section 4.7) |
| `components/timeline-card.tsx` | **Removed** — superseded by `<Scrubber />` |
| `components/compare-strip.tsx` | New diff-strip pattern (Section 5.5) |
| `components/incident-summary.tsx` | Centered narrow report layout (Section 5.6) |
| `components/brand.tsx` | Adjust to monochrome titanium palette |

### 6.4 New components

- `<Scrubber />` — Section 4.9. Reusable across Replay, Compare, Marketing hero. Props: `events: Event[]`, `currentMs: number`, `durationMs: number`, `onSeek: (ms: number) => void`, `onPlayToggle?`. Emits change events on seek and on play state.
- `<Sparkline />` — Section 4.6. Props: `data: number[]`, `cursorMs: number`, `valueAt: (ms) => number`, `label`, `unit?`, `delta?`.
- `<EventRow />` — Section 4.5. Props: `event: Event`, `active: boolean`, `onClick`.
- `<KvTag />` — Section 4.3. Props: `k: string`, `v: string | ReactNode`, `variant?: "default" | "solid"`.
- `<SideNav />` — Section 5.1. Extracted from `app-shell`.
- `<TopBar />` — Section 5.1. Props: `crumbs: string[]`, `actions?: ReactNode`.
- `<MetricTile />` — Section 4.8. Props: `label`, `value`, `unit?`, `delta?`, `deltaDirection?: "up" | "down" | "stable"`.
- `<Pulse />` — small primitive; renders the breathing-dot animation as a styled span. Used by `<EventRow active>` and the scrubber playhead.
- `<Panel />` — generic surface wrapper. Props: `eyebrow?`, `title?`, `actions?`, `children`. Most existing panels can migrate to this.

### 6.5 Execution order (each step ships a working app)

1. Tokens + fonts + `globals.css` (foundational)
2. New primitives: `<KvTag>`, `<Sparkline>`, `<EventRow>`, `<MetricTile>`, `<Pulse>`, `<Panel>`
3. New `<Scrubber>` (the centerpiece — verify in isolation before integrating)
4. New `<SideNav>` + `<TopBar>` + refactored `<AppShell>`
5. Replay Console rebuild (largest visible change)
6. Incident Inbox + Uploads
7. Compare View + Incident Summary
8. Marketing home + scrubber-as-hero animation
9. Motion polish pass: verify cubic-bezier curves, breath timing, bloom durations, settle transitions

### 6.6 Verification

- Each phase ends with a manual UI walkthrough — no broken routes, no console errors
- `pnpm build` (or `npm run build`) green at every phase boundary
- For UI changes specifically: open the affected screen in a browser, verify the static-cool / active-warm contrast holds, verify the scrubber drives all synchronized elements (event row highlight + sparkline cursors)

## 7. Non-goals

- No backend changes
- No data model changes
- No new routes
- No new product features (no auto-RCA, no fleet view, no alerting)
- No changes to ingestion or API contracts
- Not adding a charting library; sparklines are hand-rolled SVG sized for the system
- Not adding a motion library (Framer Motion); CSS transitions and a few keyframes are sufficient for the breath / bloom / settle vocabulary

## 8. Risks

- **Plex Mono digit width:** depending on glyph rendering at 11px, columns of monospace numbers can look uneven. Mitigation: use `font-variant-numeric: tabular-nums` on all timestamp/value contexts.
- **Sparkline performance:** if a real run has tens of thousands of telemetry samples, naive SVG paths will be slow. Mitigation: downsample to ~200 points for sparkline display; full resolution stays in the data layer for cursor lookup.
- **Animated breath in many event rows:** if 50+ rows are visible and one is animating, that's fine; if many are animating simultaneously (e.g. a multi-cursor view in the future), revisit. Today we only animate the single active row.
- **Scrubber synchronization:** the scrubber must drive both the event-row highlight and every sparkline cursor without prop-drill spaghetti. Use a small replay-context (React context) carrying `currentMs` and `setCurrentMs`. Single source of truth.

## 9. Out of scope (deferred but worth noting)

- Keyboard shortcuts (Space, J/K, B, F, C) — design supports them; implementation deferred to a polish phase
- Empty states beyond defaults — generic empty states are fine for v1
- Mobile / tablet responsiveness — desktop-first, will degrade later (per startup brief)
- Custom font hosting (we use `next/font/google` and accept the dependency)

---

## Appendix A — Design references for the implementation team

Visual mockups produced during brainstorming are persisted in:

- `.superpowers/brainstorm/116-1776996686/content/before-after.html` — current vs. proposed panel
- `.superpowers/brainstorm/116-1776996686/content/components.html` — full component library
- `.superpowers/brainstorm/116-1776996686/content/replay-console.html` — Replay Console layout
- `.superpowers/brainstorm/116-1776996686/content/typography.html` — type pair selection
- `.superpowers/brainstorm/116-1776996686/content/titanium-vs-sodium.html` — color direction selection

These render in the brainstorming visual companion server. Use them as the visual reference of record for the redesign.
