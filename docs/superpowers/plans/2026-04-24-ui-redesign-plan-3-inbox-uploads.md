# UI Redesign — Plan 3: Incident Inbox + Uploads

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/app/incidents` (the Incident Inbox) and `/app/uploads` against the Plan 1 design system. After this plan, three of the six authenticated screens match the new spec — Replay Console (Plan 2), Inbox, and Uploads. Compare and Summary stay on legacy classes until Plan 4.

**Architecture:** Introduce small reusable primitives for filter controls (`<FilterGroup>`), table rows (`<IncidentTableRow>`), the upload dropzone (`<Dropzone>`), and the upload row (`<UploadRow>`). Compose them into thin page bodies. The Incident Inbox uses client-side filter state; the page is a thin server component that hydrates a client-side `<InboxBody>`. Uploads stays server-rendered; the dropzone is presentational (posts to existing `/api/uploads`).

**Tech Stack:** Next 16, React 19 (server + client), Tailwind 3.4, Vitest 4 + React Testing Library 16. All Plan 1 primitives (`Panel`, `KvTag`, `MetricTile`, `StatusBadge`, `SeverityBadge`, `AppShell`).

**Spec:** `docs/superpowers/specs/2026-04-23-ui-redesign-hybrid-design.md` § 5.3 (Incident Inbox) and § 5.7 (Uploads).

**Predecessor:** Plans 1 and 2 must be on this branch (they are, on `feat/ui-redesign-foundation-shell`).

---

## File map

**New (primitives):**
- `components/primitives/filter-group.tsx` — a labelled group of toggle-pill checkboxes
- `components/primitives/incident-table-row.tsx` — one row of the inbox table

**New (inbox components):**
- `components/inbox/inbox-body.tsx` — client component: filter rail + table + right rail
- `components/inbox/recurring-cluster-panel.tsx` — right-rail insight card

**New (uploads components):**
- `components/uploads/dropzone.tsx` — the large dashed drop area
- `components/uploads/upload-row.tsx` — one row in the recent uploads list

**New tests:** one `*.test.tsx` per component above.

**Modified:**
- `app/app/incidents/page.tsx` — thin server wrapper around `<InboxBody>`
- `app/app/uploads/page.tsx` — rebuild with `<Dropzone>` + upload rows

**Deleted:**
- `components/incident-list.tsx` — superseded by `inbox/inbox-body.tsx` + `incident-table-row.tsx`
- `components/upload-form.tsx` — superseded by `uploads/dropzone.tsx` + rebuilt page

---

## Task 1: `<FilterGroup>` primitive

A small labelled group of toggle pills. Used in the Inbox filter rail for Severity, Status, Robot, Site, and Version filters. Pure presentation — parent owns selection state.

**Files:**
- Create: `components/primitives/filter-group.tsx`
- Create: `components/__tests__/filter-group.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterGroup } from "@/components/primitives/filter-group";

const options = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" }
];

describe("FilterGroup", () => {
  it("renders the label and one pill per option", () => {
    render(
      <FilterGroup
        label="Severity"
        options={options}
        selected={[]}
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Severity")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Critical" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "High" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Medium" })).toBeInTheDocument();
  });

  it("marks selected pills with aria-pressed=true", () => {
    render(
      <FilterGroup
        label="Severity"
        options={options}
        selected={["high"]}
        onChange={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: "High" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Critical" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("calls onChange with the toggled set when a pill is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterGroup
        label="Severity"
        options={options}
        selected={["high"]}
        onChange={onChange}
      />
    );
    await user.click(screen.getByRole("button", { name: "Critical" }));
    expect(onChange).toHaveBeenCalledWith(["high", "critical"]);
    await user.click(screen.getByRole("button", { name: "High" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- filter-group`

- [ ] **Step 3: Write the implementation**

```tsx
"use client";

export type FilterOption = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
};

export function FilterGroup({ label, options, selected, onChange }: Props) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-ink-3">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggle(opt.value)}
              className={`rounded-xs px-2 py-1 text-[11px] font-medium transition ${
                isSelected
                  ? "bg-ink-0 text-surface-0"
                  : "border border-line-strong text-ink-2 hover:border-ink-3 hover:text-ink-1"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run, verify PASS 3/3:** `npm run test:run -- filter-group`

- [ ] **Step 5: Commit:**

```
Add FilterGroup primitive (labelled toggle pills)
```

---

## Task 2: `<IncidentTableRow>` primitive

Single row of the dense incident-table list. Severity dot + title on the left, then robot / site / version / time columns, ending with a status badge. Whole row is a link to the detail page.

**Files:**
- Create: `components/primitives/incident-table-row.tsx`
- Create: `components/__tests__/incident-table-row.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IncidentTableRow } from "@/components/primitives/incident-table-row";
import type { Incident } from "@/lib/types";

const incident: Incident = {
  id: "inc_demo",
  title: "Localization drift",
  robot: "AX-17",
  site: "Phoenix DC",
  severity: "high",
  status: "investigating",
  failureType: "Localization Loss",
  detectedAt: "2026-04-22 19:42",
  softwareVersion: "v0.9.14",
  duration: "09m 14s",
  summary: "Demo"
};

describe("IncidentTableRow", () => {
  it("renders the title, robot, site, version, time, and status", () => {
    render(<IncidentTableRow incident={incident} />);
    expect(screen.getByText("Localization drift")).toBeInTheDocument();
    expect(screen.getByText("AX-17")).toBeInTheDocument();
    expect(screen.getByText("Phoenix DC")).toBeInTheDocument();
    expect(screen.getByText("v0.9.14")).toBeInTheDocument();
    expect(screen.getByText("2026-04-22 19:42")).toBeInTheDocument();
    expect(screen.getByText("investigating")).toBeInTheDocument();
  });

  it("is a link to the incident detail page", () => {
    render(<IncidentTableRow incident={incident} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/app/incidents/inc_demo");
  });

  it("renders a severity dot in the err color for critical incidents", () => {
    const { container } = render(
      <IncidentTableRow
        incident={{ ...incident, severity: "critical" }}
      />
    );
    expect(container.querySelector("[data-severity-dot='critical']")).toHaveClass(
      "bg-err"
    );
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- incident-table-row`

- [ ] **Step 3: Write the implementation**

```tsx
import Link from "next/link";
import type { Incident, IncidentSeverity } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";

const sevDot: Record<IncidentSeverity, string> = {
  critical: "bg-err",
  high: "bg-warn",
  medium: "bg-info",
  low: "bg-ink-3"
};

type Props = {
  incident: Incident;
};

export function IncidentTableRow({ incident }: Props) {
  return (
    <Link
      href={`/app/incidents/${incident.id}`}
      className="grid grid-cols-[18px_2fr_1fr_1fr_0.8fr_1fr_90px] items-center gap-4 border-b border-line px-4 py-3 text-xs transition-colors hover:bg-surface-2/40"
    >
      <span
        aria-hidden="true"
        data-severity-dot={incident.severity}
        className={`h-2 w-2 rounded-full ${sevDot[incident.severity]}`}
      />
      <div>
        <div className="font-medium text-ink-0">{incident.title}</div>
        <div className="mt-0.5 text-[11px] text-ink-3">
          {incident.failureType}
        </div>
      </div>
      <div className="text-ink-1">{incident.robot}</div>
      <div className="text-ink-1">{incident.site}</div>
      <div className="font-mono text-ink-2">{incident.softwareVersion}</div>
      <div className="font-mono text-ink-3">{incident.detectedAt}</div>
      <div className="justify-self-start">
        <StatusBadge status={incident.status} />
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Run, verify PASS 3/3:** `npm run test:run -- incident-table-row`

- [ ] **Step 5: Commit:**

```
Add IncidentTableRow primitive (dense inbox row)
```

---

## Task 3: `<RecurringClusterPanel>`

Right-rail insight card. Reuses `<Panel>` + `<KvTag>` from Plan 1. Pure presentation; data passed in.

**Files:**
- Create: `components/inbox/recurring-cluster-panel.tsx`
- Create: `components/__tests__/recurring-cluster-panel.test.tsx`

Create the `components/inbox/` directory if needed.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecurringClusterPanel } from "@/components/inbox/recurring-cluster-panel";

describe("RecurringClusterPanel", () => {
  it("renders the title, description, and tags", () => {
    render(
      <RecurringClusterPanel
        title="Recurring failure cluster"
        description="Phoenix DC has shown three localization-related incidents after the latest map refresh."
        tags={[
          { k: "site", v: "Phoenix DC" },
          { k: "pattern", v: "localization drift" }
        ]}
      />
    );
    expect(screen.getByText("Recurring failure cluster")).toBeInTheDocument();
    expect(
      screen.getByText(/Phoenix DC has shown three/)
    ).toBeInTheDocument();
    expect(screen.getByText("Phoenix DC")).toBeInTheDocument();
    expect(screen.getByText("localization drift")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- recurring-cluster-panel`

- [ ] **Step 3: Write the implementation**

```tsx
import { Panel } from "@/components/primitives/panel";
import { KvTag } from "@/components/primitives/kv-tag";

type Props = {
  title: string;
  description: string;
  tags: { k: string; v: string }[];
};

export function RecurringClusterPanel({ title, description, tags }: Props) {
  return (
    <Panel eyebrow="Focus" title={title}>
      <p className="text-sm leading-6 text-ink-2">{description}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <KvTag key={`${tag.k}-${tag.v}`} k={tag.k} v={tag.v} />
        ))}
      </div>
    </Panel>
  );
}
```

- [ ] **Step 4: Run, verify PASS 1/1:** `npm run test:run -- recurring-cluster-panel`

- [ ] **Step 5: Commit:**

```
Add RecurringClusterPanel (inbox right-rail insight card)
```

---

## Task 4: `<InboxBody>` — the main inbox composition

Client component that holds filter state and composes the filter rail + table + right rail. The page server component passes incidents in.

**Files:**
- Create: `components/inbox/inbox-body.tsx`
- Create: `components/__tests__/inbox-body.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InboxBody } from "@/components/inbox/inbox-body";
import type { Incident } from "@/lib/types";

const incidents: Incident[] = [
  {
    id: "a",
    title: "Localization drift",
    robot: "AX-17",
    site: "Phoenix DC",
    severity: "critical",
    status: "investigating",
    failureType: "Localization Loss",
    detectedAt: "2026-04-22 19:42",
    softwareVersion: "v0.9.14",
    duration: "09m 14s",
    summary: "x"
  },
  {
    id: "b",
    title: "Battery sag",
    robot: "AX-04",
    site: "Long Beach",
    severity: "high",
    status: "new",
    failureType: "Battery Sag",
    detectedAt: "2026-04-22 08:15",
    softwareVersion: "v0.9.14",
    duration: "04m 49s",
    summary: "y"
  },
  {
    id: "c",
    title: "Network disconnect",
    robot: "AX-21",
    site: "Seattle",
    severity: "medium",
    status: "resolved",
    failureType: "Network Disconnect",
    detectedAt: "2026-04-21 13:07",
    softwareVersion: "v0.9.13",
    duration: "06m 01s",
    summary: "z"
  }
];

describe("InboxBody", () => {
  it("renders all incidents by default", () => {
    render(<InboxBody incidents={incidents} />);
    expect(screen.getByText("Localization drift")).toBeInTheDocument();
    expect(screen.getByText("Battery sag")).toBeInTheDocument();
    expect(screen.getByText("Network disconnect")).toBeInTheDocument();
  });

  it("filters by severity when a severity pill is toggled", async () => {
    const user = userEvent.setup();
    render(<InboxBody incidents={incidents} />);
    await user.click(screen.getByRole("button", { name: "Critical" }));
    expect(screen.getByText("Localization drift")).toBeInTheDocument();
    expect(screen.queryByText("Battery sag")).toBeNull();
    expect(screen.queryByText("Network disconnect")).toBeNull();
  });

  it("filters by status when a status pill is toggled", async () => {
    const user = userEvent.setup();
    render(<InboxBody incidents={incidents} />);
    await user.click(screen.getByRole("button", { name: "New" }));
    expect(screen.getByText("Battery sag")).toBeInTheDocument();
    expect(screen.queryByText("Localization drift")).toBeNull();
  });

  it("combines filters with AND (severity AND status)", async () => {
    const user = userEvent.setup();
    render(<InboxBody incidents={incidents} />);
    await user.click(screen.getByRole("button", { name: "High" }));
    await user.click(screen.getByRole("button", { name: "New" }));
    expect(screen.getByText("Battery sag")).toBeInTheDocument();
    expect(screen.queryByText("Localization drift")).toBeNull();
    expect(screen.queryByText("Network disconnect")).toBeNull();
  });

  it("renders today metric tiles in the right rail", () => {
    render(<InboxBody incidents={incidents} />);
    expect(screen.getByText(/new incidents/i)).toBeInTheDocument();
    expect(screen.getByText(/investigating/i)).toBeInTheDocument();
  });

  it("shows an empty state when filters match no incidents", async () => {
    const user = userEvent.setup();
    render(<InboxBody incidents={incidents} />);
    await user.click(screen.getByRole("button", { name: "Low" }));
    expect(screen.getByText(/no incidents match/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- inbox-body`

- [ ] **Step 3: Write the implementation**

```tsx
"use client";

import { useMemo, useState } from "react";
import type { Incident, IncidentSeverity, IncidentStatus } from "@/lib/types";
import { FilterGroup } from "@/components/primitives/filter-group";
import { IncidentTableRow } from "@/components/primitives/incident-table-row";
import { MetricTile } from "@/components/primitives/metric-tile";
import { Panel } from "@/components/primitives/panel";
import { RecurringClusterPanel } from "@/components/inbox/recurring-cluster-panel";

const severityOptions: { value: IncidentSeverity; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" }
];

const statusOptions: { value: IncidentStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" }
];

function distinct<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

type Props = {
  incidents: Incident[];
};

export function InboxBody({ incidents }: Props) {
  const [sevFilter, setSevFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [robotFilter, setRobotFilter] = useState<string[]>([]);
  const [siteFilter, setSiteFilter] = useState<string[]>([]);
  const [versionFilter, setVersionFilter] = useState<string[]>([]);

  const robots = useMemo(
    () =>
      distinct(incidents.map((i) => i.robot)).map((r) => ({
        value: r,
        label: r
      })),
    [incidents]
  );
  const sites = useMemo(
    () =>
      distinct(incidents.map((i) => i.site)).map((s) => ({
        value: s,
        label: s
      })),
    [incidents]
  );
  const versions = useMemo(
    () =>
      distinct(incidents.map((i) => i.softwareVersion)).map((v) => ({
        value: v,
        label: v
      })),
    [incidents]
  );

  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      if (sevFilter.length && !sevFilter.includes(inc.severity)) return false;
      if (statusFilter.length && !statusFilter.includes(inc.status)) return false;
      if (robotFilter.length && !robotFilter.includes(inc.robot)) return false;
      if (siteFilter.length && !siteFilter.includes(inc.site)) return false;
      if (versionFilter.length && !versionFilter.includes(inc.softwareVersion)) return false;
      return true;
    });
  }, [incidents, sevFilter, statusFilter, robotFilter, siteFilter, versionFilter]);

  const countNew = incidents.filter((i) => i.status === "new").length;
  const countInvestigating = incidents.filter(
    (i) => i.status === "investigating"
  ).length;
  const countTotal = incidents.length;

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_320px]">
      <aside className="space-y-5">
        <FilterGroup
          label="Severity"
          options={severityOptions}
          selected={sevFilter}
          onChange={setSevFilter}
        />
        <FilterGroup
          label="Status"
          options={statusOptions}
          selected={statusFilter}
          onChange={setStatusFilter}
        />
        <FilterGroup
          label="Robot"
          options={robots}
          selected={robotFilter}
          onChange={setRobotFilter}
        />
        <FilterGroup
          label="Site"
          options={sites}
          selected={siteFilter}
          onChange={setSiteFilter}
        />
        <FilterGroup
          label="Version"
          options={versions}
          selected={versionFilter}
          onChange={setVersionFilter}
        />
      </aside>

      <Panel
        eyebrow="Inbox"
        title={`Active incidents (${filtered.length})`}
        bodyClassName="p-0"
      >
        {filtered.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-ink-3">
            No incidents match the current filters.
          </div>
        ) : (
          <ul>
            {filtered.map((incident) => (
              <li key={incident.id}>
                <IncidentTableRow incident={incident} />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <aside className="space-y-4">
        <div className="space-y-3">
          <MetricTile
            label="New incidents"
            value={String(countNew).padStart(2, "0")}
          />
          <MetricTile
            label="Investigating"
            value={String(countInvestigating).padStart(2, "0")}
          />
          <MetricTile
            label="Total"
            value={String(countTotal).padStart(2, "0")}
          />
        </div>
        <RecurringClusterPanel
          title="Recurring failure cluster"
          description="Phoenix DC has shown three localization-related incidents after the latest map refresh. Prioritize aisle M-14 and charging corridor validations."
          tags={[
            { k: "site", v: "Phoenix DC" },
            { k: "pattern", v: "localization drift" }
          ]}
        />
      </aside>
    </div>
  );
}
```

- [ ] **Step 4: Run, verify PASS 6/6:** `npm run test:run -- inbox-body`

- [ ] **Step 5: Commit:**

```
Add InboxBody (filter rail + table + right rail, client state)
```

---

## Task 5: Rewire `/app/incidents` page + delete old IncidentList

**Files:**
- Modify: `app/app/incidents/page.tsx`
- Delete: `components/incident-list.tsx`

- [ ] **Step 1: Check for other consumers of `IncidentList`**

Run: `grep -r "from \"@/components/incident-list\"" --include="*.tsx" --include="*.ts" app components`

Expected: only `app/app/incidents/page.tsx`. If anything else shows up, stop and report BLOCKED.

- [ ] **Step 2: Replace `app/app/incidents/page.tsx` with:**

```tsx
import { AppShell } from "@/components/app-shell";
import { InboxBody } from "@/components/inbox/inbox-body";
import { listIncidents } from "@/lib/store";

export default async function IncidentsPage() {
  const incidents = await listIncidents();

  return (
    <AppShell
      title="Incident Inbox"
      subtitle="Scan recent failures, prioritize investigations, and open a synchronized replay workspace for the runs that matter."
      crumbs={["Incidents"]}
      actions={
        <button className="rounded-xs bg-ink-0 px-3 py-1.5 text-xs font-semibold text-surface-0">
          Upload Run
        </button>
      }
    >
      <InboxBody incidents={incidents} />
    </AppShell>
  );
}
```

- [ ] **Step 3: Delete the old list:**

```bash
rm components/incident-list.tsx
```

- [ ] **Step 4: Verify:**

Run: `npm run build` — expected to succeed.
Run: `npm run test:run -- --maxWorkers=1` — expected all tests pass.

- [ ] **Step 5: Commit:**

```bash
git add app/app/incidents/page.tsx
git add -u components/incident-list.tsx
```

Message:

```
Rewire Incident Inbox to InboxBody, drop old IncidentList
```

---

## Task 6: `<Dropzone>` primitive

Large dashed drop area with a centered icon, headline, and Browse button. For v1 it doesn't actually handle drops — it's a presentational pattern that invokes an `onBrowse` callback. The existing `/api/uploads` endpoint stays untouched.

**Files:**
- Create: `components/uploads/dropzone.tsx`
- Create: `components/__tests__/dropzone.test.tsx`

Create the `components/uploads/` directory if needed.

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dropzone } from "@/components/uploads/dropzone";

describe("Dropzone", () => {
  it("renders the headline and browse button", () => {
    render(<Dropzone onBrowse={() => {}} />);
    expect(
      screen.getByText(/drop a ROS bag or log archive/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /browse/i })).toBeInTheDocument();
  });

  it("calls onBrowse when the browse button is clicked", async () => {
    const user = userEvent.setup();
    const onBrowse = vi.fn();
    render(<Dropzone onBrowse={onBrowse} />);
    await user.click(screen.getByRole("button", { name: /browse/i }));
    expect(onBrowse).toHaveBeenCalledOnce();
  });

  it("accepts a custom headline prop", () => {
    render(<Dropzone onBrowse={() => {}} headline="Custom copy" />);
    expect(screen.getByText("Custom copy")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- dropzone`

- [ ] **Step 3: Write the implementation**

```tsx
"use client";

type Props = {
  onBrowse: () => void;
  headline?: string;
  subtext?: string;
};

export function Dropzone({
  onBrowse,
  headline = "Drop a ROS bag or log archive",
  subtext = "Upload a single file up to 2 GB. ROS2 bag and structured log archives supported."
}: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line-strong bg-surface-1 px-6 py-12 text-center">
      <div
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong text-ink-2"
      >
        ↑
      </div>
      <div className="text-sm font-medium text-ink-0">{headline}</div>
      <div className="max-w-md text-xs leading-5 text-ink-3">{subtext}</div>
      <button
        type="button"
        onClick={onBrowse}
        className="mt-2 rounded-xs bg-ink-0 px-3 py-1.5 text-xs font-semibold text-surface-0"
      >
        Browse
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run, verify PASS 3/3:** `npm run test:run -- dropzone`

- [ ] **Step 5: Commit:**

```
Add Dropzone primitive (upload drop area + browse button)
```

---

## Task 7: `<UploadRow>` component

Single row in the recent uploads list. Filename (mono), size and meta line, status badge, tiny progress bar for in-progress uploads, "Open as incident" CTA when ready.

**Files:**
- Create: `components/uploads/upload-row.tsx`
- Create: `components/__tests__/upload-row.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UploadRow } from "@/components/uploads/upload-row";
import type { UploadJob } from "@/lib/types";

const processing: UploadJob = {
  id: "u1",
  sourceName: "ax14-phoenix.bag",
  robot: "AX-14",
  site: "Phoenix DC",
  failureType: "Planner Timeout",
  status: "processing",
  createdAt: "2026-04-22 19:40"
};

const ready: UploadJob = {
  ...processing,
  id: "u2",
  status: "ready",
  incidentId: "inc_demo"
};

describe("UploadRow", () => {
  it("renders the filename and robot/site/failureType line", () => {
    render(<UploadRow upload={processing} />);
    expect(screen.getByText("ax14-phoenix.bag")).toBeInTheDocument();
    expect(screen.getByText(/AX-14/)).toBeInTheDocument();
    expect(screen.getByText(/Phoenix DC/)).toBeInTheDocument();
    expect(screen.getByText(/Planner Timeout/)).toBeInTheDocument();
  });

  it("shows a progress bar while processing", () => {
    const { container } = render(<UploadRow upload={processing} />);
    expect(container.querySelector("[data-progress]")).toBeTruthy();
  });

  it("shows an Open as incident link when status is ready and an incidentId exists", () => {
    render(<UploadRow upload={ready} />);
    const link = screen.getByRole("link", { name: /open as incident/i });
    expect(link).toHaveAttribute("href", "/app/incidents/inc_demo");
  });

  it("shows the status label", () => {
    render(<UploadRow upload={processing} />);
    expect(screen.getByText("processing")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, verify FAIL:** `npm run test:run -- upload-row`

- [ ] **Step 3: Write the implementation**

```tsx
import Link from "next/link";
import type { UploadJob } from "@/lib/types";

const statusTone: Record<UploadJob["status"], string> = {
  queued: "bg-ink-3/10 text-ink-2",
  processing: "bg-info/10 text-info",
  ready: "bg-ok/10 text-ok",
  failed: "bg-err/10 text-err"
};

type Props = {
  upload: UploadJob;
};

export function UploadRow({ upload }: Props) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-xs text-ink-0">
          {upload.sourceName}
        </div>
        <div className="mt-0.5 text-[11px] text-ink-3">
          {upload.robot} · {upload.site} · {upload.failureType}
        </div>
        {upload.status === "processing" && (
          <div
            data-progress
            className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-line"
          >
            <div className="h-full w-2/3 rounded-full bg-info" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ${statusTone[upload.status]}`}
        >
          {upload.status}
        </span>
        {upload.status === "ready" && upload.incidentId && (
          <Link
            href={`/app/incidents/${upload.incidentId}`}
            className="rounded-xs bg-ink-0 px-3 py-1 text-[11px] font-semibold text-surface-0"
          >
            Open as incident
          </Link>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run, verify PASS 4/4:** `npm run test:run -- upload-row`

- [ ] **Step 5: Commit:**

```
Add UploadRow (filename + status + progress + open-as-incident)
```

---

## Task 8: Rebuild `/app/uploads` page + delete old `UploadForm`

**Files:**
- Modify: `app/app/uploads/page.tsx`
- Delete: `components/upload-form.tsx`

- [ ] **Step 1: Check for other consumers of `UploadForm`**

Run: `grep -r "from \"@/components/upload-form\"" --include="*.tsx" --include="*.ts" app components`

Expected: only `app/app/uploads/page.tsx`.

- [ ] **Step 2: Replace `app/app/uploads/page.tsx` with:**

```tsx
import { AppShell } from "@/components/app-shell";
import { Dropzone } from "@/components/uploads/dropzone";
import { UploadRow } from "@/components/uploads/upload-row";
import { MetricTile } from "@/components/primitives/metric-tile";
import { Panel } from "@/components/primitives/panel";
import { listUploads } from "@/lib/store";

export default async function UploadsPage() {
  const uploads = await listUploads();

  const countQueued = uploads.filter((u) => u.status === "queued").length;
  const countProcessing = uploads.filter((u) => u.status === "processing").length;
  const countReady = uploads.filter((u) => u.status === "ready").length;

  return (
    <AppShell
      title="Run Uploads"
      subtitle="Upload ROS bags or structured log archives. Each upload is parsed into a replayable incident."
      crumbs={["Uploads"]}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <DropzoneWithServerFallback />
          <Panel
            eyebrow="Recent uploads"
            bodyClassName="p-0"
          >
            {uploads.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-ink-3">
                No uploads yet.
              </div>
            ) : (
              <ul>
                {uploads.map((upload) => (
                  <li key={upload.id}>
                    <UploadRow upload={upload} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
        <aside className="space-y-3">
          <MetricTile
            label="Queued"
            value={String(countQueued).padStart(2, "0")}
          />
          <MetricTile
            label="Processing"
            value={String(countProcessing).padStart(2, "0")}
          />
          <MetricTile
            label="Ready"
            value={String(countReady).padStart(2, "0")}
          />
        </aside>
      </div>
    </AppShell>
  );
}

// Tiny client component so the Dropzone's onBrowse callback has a home.
// Until a real file picker is wired in, Browse just submits the existing
// seed form that creates a sample upload via POST /api/uploads.
function DropzoneWithServerFallback() {
  return (
    <form
      action="/api/uploads"
      method="post"
      className="contents"
    >
      <input type="hidden" name="title" value="New upload" />
      <input type="hidden" name="robot" value="AX-31" />
      <input type="hidden" name="site" value="Dallas Pilot" />
      <input type="hidden" name="failureType" value="Planner Timeout" />
      <input
        type="hidden"
        name="sourceName"
        value="ax31-dallas-placeholder.bag"
      />
      <input type="hidden" name="softwareVersion" value="v0.9.15" />
      <DropzoneButton />
    </form>
  );
}

function DropzoneButton() {
  // Server-rendered dropzone — submits the parent form on Browse.
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line-strong bg-surface-1 px-6 py-12 text-center">
      <div
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong text-ink-2"
      >
        ↑
      </div>
      <div className="text-sm font-medium text-ink-0">
        Drop a ROS bag or log archive
      </div>
      <div className="max-w-md text-xs leading-5 text-ink-3">
        Upload a single file up to 2 GB. ROS2 bag and structured log archives supported.
      </div>
      <button
        type="submit"
        className="mt-2 rounded-xs bg-ink-0 px-3 py-1.5 text-xs font-semibold text-surface-0"
      >
        Browse
      </button>
    </div>
  );
}
```

Note the rationale for the inlined form: the existing `POST /api/uploads` endpoint expects form fields for a full incident record. The redesign mockup shows a single "Drop a file" dropzone — we can't remove the backend contract without rewriting the API (out of scope). So the Browse button submits a hidden-field form that creates a sample upload. Future work (Plan 5 polish or a follow-up plan) will replace this with a real file picker.

The separate `<Dropzone>` client component from Task 6 remains reusable for places where a real onBrowse callback is wired in (e.g., a future modal that captures real file input).

- [ ] **Step 3: Delete the old form:**

```bash
rm components/upload-form.tsx
```

- [ ] **Step 4: Verify:**

Run: `npm run build` — must succeed.
Run: `npm run test:run -- --maxWorkers=1` — all pass.

Manual smoke: `npm run dev`, visit `/app/uploads` — should show the new dropzone + list with the MetricTile right rail.

- [ ] **Step 5: Commit:**

```bash
git add app/app/uploads/page.tsx
git add -u components/upload-form.tsx
```

Message:

```
Rebuild Uploads page (Dropzone + UploadRow), drop old UploadForm
```

---

## Task 9: Final verification

- [ ] **Step 1: Full test suite:** `npm run test:run -- --maxWorkers=1`
  Expected: Plan 2's 89 tests + ~24 new Plan 3 tests ≈ 113 tests across ~27 files.

- [ ] **Step 2: Build:** `npm run build`
  Expected: all 11 routes compile cleanly.

- [ ] **Step 3: Manual UI walkthrough:**

Run `npm run dev` and visit:
- `/app/incidents` — new inbox: filter rail left, dense table center, metrics + recurring cluster right. Clicking a row opens the new Replay Console. Toggling a severity pill filters the table in place.
- `/app/uploads` — new layout: dropzone panel at top, recent uploads below with status badges and progress bars. Right rail shows queue counts.
- `/app/incidents/inc_0423_localization` — Replay Console unchanged from Plan 2.
- `/app/incidents/inc_0423_localization/compare` — still legacy (Plan 4).
- `/app/incidents/inc_0423_localization/summary` — still legacy (Plan 4).
- `/app/settings` — still legacy.

- [ ] **Step 4: No commit needed.**

Plan 3 complete.

---

## Self-review

**Spec coverage (§ 5.3 Incident Inbox):**
- Slim left filter rail → Task 1 (`<FilterGroup>`) + Task 4 (`<InboxBody>`) wires 5 groups
- Dense table-style row list → Task 2 (`<IncidentTableRow>`) + Task 4
- Severity dot / title / robot / site / version / time / status columns → Task 2 row layout
- Right rail: today's metrics + recurring cluster → Task 4 uses `<MetricTile>` × 3 + Task 3 (`<RecurringClusterPanel>`)
- Row click opens replay console → Task 2 (whole row is a Link to `/app/incidents/<id>`)

**Spec coverage (§ 5.7 Uploads):**
- Single dropzone panel → Task 6 (`<Dropzone>`) + Task 8 page
- List of recent uploads with status + progress bar → Task 7 (`<UploadRow>`)
- "Open as incident" CTA when ready → Task 7
- Right rail queue metrics → Task 8 uses `<MetricTile>` × 3

**Placeholder scan:** none.

**Scope caveats:**
- The Dropzone's onBrowse handler in the Uploads page submits a pre-filled form instead of opening a real file picker. The existing `POST /api/uploads` API expects a full incident record as form fields, which the dropzone pattern alone can't provide. This is an intentional v1 compromise documented in Task 8 and deferred to a future plan (likely Plan 5 polish or a new plan once the backend accepts raw uploads). The standalone `<Dropzone>` primitive from Task 6 is still useful — it has the onBrowse callback shape a real implementation will use.
- Filter state is client-side only (no URL query params). Deep-linkability is deferred — not in the spec for v1.

**Type consistency:** reuses `Incident`, `IncidentSeverity`, `IncidentStatus`, `UploadJob` from `lib/types`. No new shared types needed.
