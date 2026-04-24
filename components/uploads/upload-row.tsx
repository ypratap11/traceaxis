import Link from "next/link";
import type { UploadJob } from "@/lib/types";

const statusTone: Record<UploadJob["status"], string> = {
  queued: "bg-ink-3/10 text-ink-2",
  processing: "bg-info/10 text-info",
  ready: "bg-ok/10 text-ok",
  failed: "bg-err/10 text-err"
};

type Props = {
  upload: UploadJob;
};

export function UploadRow({ upload }: Props) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate font-mono text-xs text-ink-0">
          {upload.sourceName}
        </div>
        <div className="mt-0.5 text-[11px] text-ink-3">
          {upload.robot} · {upload.site} · {upload.failureType}
        </div>
        {upload.status === "processing" && (
          <div
            data-progress
            className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-line"
          >
            <div className="h-full w-2/3 rounded-full bg-info" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center rounded-xs px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ${statusTone[upload.status]}`}
        >
          {upload.status}
        </span>
        {upload.status === "ready" && upload.incidentId && (
          <Link
            href={`/app/incidents/${upload.incidentId}`}
            className="rounded-xs bg-ink-0 px-3 py-1 text-[11px] font-semibold text-surface-0"
          >
            Open as incident
          </Link>
        )}
      </div>
    </div>
  );
}
