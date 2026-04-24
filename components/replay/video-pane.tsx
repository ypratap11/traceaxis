type Props = {
  label: string;
  source: string;
  frame?: string;
  timestamp?: string;
};

export function VideoPane({ label, source, frame, timestamp }: Props) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-md border border-line bg-surface-1">
      <header className="flex items-center justify-between border-b border-line bg-surface-2 px-4 py-2.5 text-[11px]">
        <span className="font-semibold uppercase tracking-[0.22em] text-ink-3">
          {label}
        </span>
        <span className="font-mono text-ink-2">{source}</span>
      </header>
      <div className="relative flex flex-1 items-center justify-center bg-[radial-gradient(circle_at_center,#1a2030_0%,#0b0e13_80%)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-4 rounded border border-dashed border-line-strong"
        />
        <button
          type="button"
          aria-label="play preview"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-ink-0/25 bg-ink-0/10 text-lg text-ink-0 transition hover:bg-ink-0/15"
        >
          ▶
        </button>
      </div>
      {(frame || timestamp) && (
        <footer className="flex items-center justify-between border-t border-line bg-surface-0 px-4 py-2 font-mono text-[11px] text-ink-3">
          <span>{frame}</span>
          <span>{timestamp}</span>
        </footer>
      )}
    </section>
  );
}
