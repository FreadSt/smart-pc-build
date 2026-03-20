import { Card } from "@/shared/ui";

export function PerformanceEstimatePanel() {
    return (
        <aside className="w-80 border-l border-border bg-card p-4">
            <h2 className="mb-4 text-sm font-semibold text-text-secondary">Performance estimate</h2>
            <div className="space-y-3 text-sm text-text-secondary">
                <Card>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        Notes
                    </div>
                    <div className="text-sm">Performance scoring will be added later.</div>
                </Card>
            </div>
        </aside>
    );
}

