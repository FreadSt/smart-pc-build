'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { BuildReview, getPerformanceReview } from "@/shared/lib/supabase/client/client";

export function PerformanceEstimatePanel({ cpuModel, gpuModel }: { cpuModel: string | null; gpuModel: string | null }) {
    const [review, setReview] = useState<BuildReview | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requestKey = useMemo(() => `${cpuModel ?? ""}::${gpuModel ?? ""}`, [cpuModel, gpuModel]);
    const prevKeyRef = useRef<string>("");

    useEffect(() => {
        if (!cpuModel || !gpuModel) {
            window.setTimeout(() => {
                setReview(null);
                setLoading(false);
                setError(null);
            }, 0);
            return;
        }

        // Avoid re-fetching when nothing actually changed.
        if (prevKeyRef.current === requestKey) return;
        prevKeyRef.current = requestKey;

        window.setTimeout(() => {
            setLoading(true);
            setError(null);
        }, 0);

        getPerformanceReview(cpuModel, gpuModel)
            .then((r) => setReview(r))
            .catch((e) => setError(e instanceof Error ? e.message : String(e)))
            .finally(() => setLoading(false));
    }, [cpuModel, gpuModel, requestKey]);

    if (!cpuModel || !gpuModel) {
        return (
            <aside className="w-80 border-l border-border bg-card p-4">
                <h2 className="mb-4 text-sm font-semibold text-text-secondary">Performance estimate</h2>
                <div className="space-y-2 text-sm text-text-secondary">
                    <div className="animate-pulse rounded-md bg-background p-3">Выберите CPU и GPU для расчета</div>
                </div>
            </aside>
        );
    }

    if (error) {
        return (
            <aside className="w-80 border-l border-border bg-card p-4">
                <h2 className="mb-4 text-sm font-semibold text-text-secondary">Performance estimate</h2>
                <div className="flex items-start gap-2 text-sm text-warning">
                    <AlertTriangle className="h-4 w-4 mt-0.5" />
                    <div>{error}</div>
                </div>
            </aside>
        );
    }

    if (loading || !review) {
        return (
            <aside className="w-80 border-l border-border bg-card p-4">
                <h2 className="mb-4 text-sm font-semibold text-text-secondary">Performance estimate</h2>
                <div className="animate-pulse rounded-xl bg-background p-4 text-sm text-text-secondary">
                    Расчет производительности...
                </div>
            </aside>
        );
    }
    return (
        <aside className="w-80 border-l border-border bg-card p-4">
            <h2 className="mb-4 text-sm font-semibold text-text-secondary">Performance estimate</h2>

            <div className="space-y-4">
                <div className="rounded-xl border border-border bg-background p-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-text-secondary">Score</div>
                        <div className="rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white transition-transform">
                            {review.totalScore}
                        </div>
                    </div>
                    <div className="mt-2 text-base font-semibold">{review.verdict}</div>
                </div>

                <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">Tags</div>
                    <div className="flex flex-wrap gap-2">
                        {review.tags.map((tag) => (
                            <span
                                key={tag}
                                className="rounded-full border border-border bg-background px-3 py-1 text-xs text-text-secondary"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        Ближайшие конкуренты
                    </div>
                    <div className="space-y-2 text-sm">
                        {review.competitors.length === 0 ? (
                            <div className="rounded-md border border-border bg-background p-2 text-text-secondary">
                                Недостаточно данных для сравнения.
                            </div>
                        ) : (
                            review.competitors.map((comp) => (
                                <div key={comp.name} className="flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-text-secondary">{comp.name}</div>
                                        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-background">
                                            <div
                                                className={[
                                                    "h-full rounded-full transition-all",
                                                    comp.diff >= 0 ? "bg-success" : "bg-warning",
                                                ].join(" ")}
                                                style={{
                                                    width: `${Math.min(100, Math.abs(comp.diff))}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className={comp.diff >= 0 ? "text-success" : "text-warning"}>
                                        {comp.diff >= 0 ? `+${comp.diff}%` : `${comp.diff}%`}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </aside>
    );
}