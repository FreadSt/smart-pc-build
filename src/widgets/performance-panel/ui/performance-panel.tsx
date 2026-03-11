export function PerformancePanel() {
  return (
    <aside className="w-80 border-l border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="mb-4 text-sm font-semibold text-[var(--text-secondary)]">
        Performance estimate
      </h2>
      <div className="space-y-3 text-sm text-[var(--text-secondary)]">
        <div className="card">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            1080p Gaming
          </div>
          <div className="text-sm">No data yet</div>
        </div>
        <div className="card">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            1440p Gaming
          </div>
          <div className="text-sm">No data yet</div>
        </div>
      </div>
    </aside>
  );
}

