export function BuilderSidebar() {
  return (
    <aside className="w-72 border-r border-[var(--border)] bg-[var(--card)] p-4">
      <h2 className="mb-4 text-sm font-semibold text-[var(--text-secondary)]">
        Build settings
      </h2>
      <div className="space-y-3 text-sm text-[var(--text-secondary)]">
        <div className="card">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Budget
          </div>
          <div className="text-sm">Set your budget and region</div>
        </div>
        <div className="card">
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
            Preferences
          </div>
          <div className="text-sm">
            Gaming / Workstation / Balanced, noise level, form-factor
          </div>
        </div>
      </div>
    </aside>
  );
}

