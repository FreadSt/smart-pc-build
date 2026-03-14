import type { BuildSummary } from "../model";

interface BuildItemProps {
  build: BuildSummary;
}

export function BuildItem({ build }: BuildItemProps) {
  return (
    <div className="card flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">Build #{build.id}</div>
        <div className="text-xs text-[var(--text-secondary)]">
          Saved build summary
        </div>
      </div>
      <div className="price text-sm">${build.totalPrice}</div>
    </div>
  );
}

