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
