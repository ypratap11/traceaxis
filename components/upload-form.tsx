export function UploadForm() {
  return (
    <div className="panel p-5">
      <div className="eyebrow">Create Incident</div>
      <h2 className="mt-2 text-xl font-semibold text-white">Seed a new upload</h2>
      <p className="mt-3 text-sm leading-6 text-white/60">
        This form writes the first real TraceAxis records. Submitting it creates an upload entry
        and a linked incident in the local data store.
      </p>
      <form action="/api/uploads" method="post" className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm text-white/65">
          Incident title
          <input
            name="title"
            required
            defaultValue="Planner timeout near charging corridor"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-accent-500/50"
          />
        </label>
        <div className="grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2 text-sm text-white/65">
            Robot
            <input
              name="robot"
              required
              defaultValue="AX-31"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-accent-500/50"
            />
          </label>
          <label className="grid gap-2 text-sm text-white/65">
            Site
            <input
              name="site"
              required
              defaultValue="Dallas Pilot"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-accent-500/50"
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
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-accent-500/50"
            />
          </label>
          <label className="grid gap-2 text-sm text-white/65">
            Source file
            <input
              name="sourceName"
              required
              defaultValue="ax31-dallas-20260423.bag"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-accent-500/50"
            />
          </label>
        </div>
        <label className="grid gap-2 text-sm text-white/65">
          Software version
          <input
            name="softwareVersion"
            defaultValue="v0.9.15"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition focus:border-accent-500/50"
          />
        </label>
        <button
          type="submit"
          className="mt-2 rounded-full bg-accent-500 px-4 py-3 text-sm font-semibold text-graphite-950"
        >
          Create Upload And Incident
        </button>
      </form>
    </div>
  );
}
