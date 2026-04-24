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
