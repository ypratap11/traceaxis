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
