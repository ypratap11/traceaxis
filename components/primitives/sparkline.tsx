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
          {unit && <span className="ml-1 text-[11px] text-ink-3">{unit}</span>}
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
