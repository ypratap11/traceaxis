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
          <li
            key={topic.name}
            className="border-t border-line pt-2 first:border-t-0 first:pt-0"
          >
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
