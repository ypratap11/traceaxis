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
