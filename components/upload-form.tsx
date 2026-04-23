export function UploadForm() {
  return (
    <div className="panel p-6">
      <div className="eyebrow">Create Incident</div>
      <h2 className="mt-2 text-2xl font-semibold text-white">Seed a new upload</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
        This form writes the first real TraceAxis records. Submitting it creates an upload entry
        and a linked incident in the local data store.
      </p>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="metric-tile">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">Input</div>
          <div className="mt-2 text-xl font-semibold text-white">ROS bag metadata</div>
        </div>
        <div className="metric-tile">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">Output</div>
          <div className="mt-2 text-xl font-semibold text-white">Linked incident record</div>
        </div>
        <div className="metric-tile">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/38">Next</div>
          <div className="mt-2 text-xl font-semibold text-white">Ingestion pipeline hook</div>
        </div>
      </div>
      <form action="/api/uploads" method="post" className="mt-8 grid gap-4">
        <label className="grid gap-2 text-sm text-white/65">
          Incident title
          <input
            name="title"
            required
            defaultValue="Planner timeout near charging corridor"
            className="field-shell"
          />
        </label>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2 text-sm text-white/65">
            Robot
            <input
            name="robot"
            required
            defaultValue="AX-31"
            className="field-shell"
          />
          </label>
          <label className="grid gap-2 text-sm text-white/65">
            Site
            <input
            name="site"
            required
            defaultValue="Dallas Pilot"
            className="field-shell"
          />
          </label>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2 text-sm text-white/65">
            Failure type
            <input
            name="failureType"
            required
            defaultValue="Planner Timeout"
            className="field-shell"
          />
          </label>
          <label className="grid gap-2 text-sm text-white/65">
            Source file
            <input
            name="sourceName"
            required
            defaultValue="ax31-dallas-20260423.bag"
            className="field-shell"
          />
          </label>
        </div>
        <label className="grid gap-2 text-sm text-white/65">
          Software version
          <input
            name="softwareVersion"
            defaultValue="v0.9.15"
            className="field-shell"
          />
        </label>
        <button
          type="submit"
          className="control-chip-accent mt-2 w-fit px-5 py-3"
        >
          Create Upload And Incident
        </button>
      </form>
    </div>
  );
}
