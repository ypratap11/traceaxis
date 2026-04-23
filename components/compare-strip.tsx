import { compareDiffs } from "@/lib/data";

export function CompareStrip() {
  return (
    <div className="panel p-5">
      <div className="eyebrow">Compare</div>
      <h2 className="mt-2 text-xl font-semibold">Failed run versus baseline</h2>
      <div className="mt-5 flex flex-wrap gap-3">
        {compareDiffs.map((diff) => (
          <div
            key={diff}
            className="rounded-full border border-accent-500/20 bg-accent-500/10 px-3 py-2 text-sm text-accent-400"
          >
            {diff}
          </div>
        ))}
      </div>
    </div>
  );
}
