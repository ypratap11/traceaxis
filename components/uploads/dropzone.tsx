"use client";

type Props = {
  onBrowse: () => void;
  headline?: string;
  subtext?: string;
};

export function Dropzone({
  onBrowse,
  headline = "Drop a ROS bag or log archive",
  subtext = "Upload a single file up to 2 GB. ROS2 bag and structured log archives supported."
}: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-line-strong bg-surface-1 px-6 py-12 text-center">
      <div
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-sm border border-line-strong text-ink-2"
      >
        ↑
      </div>
      <div className="text-sm font-medium text-ink-0">{headline}</div>
      <div className="max-w-md text-xs leading-5 text-ink-3">{subtext}</div>
      <button
        type="button"
        onClick={onBrowse}
        className="mt-2 rounded-xs bg-ink-0 px-3 py-1.5 text-xs font-semibold text-surface-0"
      >
        Browse
      </button>
    </div>
  );
}
