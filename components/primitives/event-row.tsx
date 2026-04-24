import { Pulse } from "@/components/primitives/pulse";

export type EventSeverity = "ok" | "warn" | "err" | "info";

type Props = {
  label: string;
  timestamp: string;
  severity: EventSeverity;
  active?: boolean;
  onClick?: () => void;
};

const sevDot: Record<EventSeverity, string> = {
  ok: "bg-ok",
  warn: "bg-warn",
  err: "bg-err",
  info: "bg-info"
};

export function EventRow({
  label,
  timestamp,
  severity,
  active = false,
  onClick
}: Props) {
  const base =
    "flex w-full items-center justify-between border-l-2 border-l-transparent px-3.5 py-2.5 text-left text-xs transition-all duration-200 ease-spring";
  const stateClasses = active
    ? "border-l-bloom bg-gradient-to-r from-bloom-soft via-bloom-soft/30 to-transparent pl-3"
    : "hover:bg-surface-2/40";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${stateClasses}`}
    >
      <span className="flex items-center gap-2">
        {active ? (
          <Pulse size="sm" />
        ) : (
          <span
            aria-hidden="true"
            className={`inline-block h-1.5 w-1.5 rounded-full ${sevDot[severity]}`}
          />
        )}
        <span
          className={`font-medium ${active ? "text-bloom-tint" : "text-ink-1"}`}
        >
          {label}
        </span>
      </span>
      <span className="font-mono text-ink-3">{timestamp}</span>
    </button>
  );
}
