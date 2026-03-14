export function BuildCanvas() {
  return (
    <section className="flex-1 space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
          Your build
        </h2>
        <div className="price text-sm">$0 • estimated</div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="card">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            CPU
          </div>
          <div className="text-sm">No CPU selected</div>
        </div>
        <div className="card">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            GPU
          </div>
          <div className="text-sm">No GPU selected</div>
        </div>
        <div className="card">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            RAM
          </div>
          <div className="text-sm">No RAM selected</div>
        </div>
      </div>
    </section>
  );
}

