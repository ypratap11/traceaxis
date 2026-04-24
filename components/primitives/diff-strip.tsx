export type Diff = {
  label: string;
  delta: string;
  worse: "left" | "right" | "none";
};

type Props = {
  diffs: Diff[];
};

export function DiffStrip({ diffs }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {diffs.map((d) => {
        const isWorse = d.worse !== "none";
        return (
          <span
            key={`${d.label}-${d.delta}`}
            data-worse={d.worse}
            className={`inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 text-[11px] font-medium ${
              isWorse
                ? "border-bloom/40 bg-bloom-soft text-bloom"
                : "border-line-strong text-ink-1"
            }`}
          >
            <span className={isWorse ? "text-bloom" : "text-ink-3"}>
              {d.label}
            </span>
            <span>{d.delta}</span>
          </span>
        );
      })}
    </div>
  );
}
