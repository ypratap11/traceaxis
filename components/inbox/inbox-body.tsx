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

      <aside data-testid="inbox-right-rail" className="space-y-4">
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
