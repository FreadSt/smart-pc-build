import type { PcComponent } from "../model";

interface ComponentCardProps {
  component: PcComponent;
}

export function ComponentCard({ component }: ComponentCardProps) {
  return (
    <div className="card space-y-1">
      <div className="text-sm font-medium">{component.name}</div>
      <div className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
        {component.type}
      </div>
      <div className="price text-sm">${component.price}</div>
    </div>
  );
}

