// 'use client'
//
// import React, { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
// import { Button, Card } from "@/shared/ui";
// import { useBuildStore } from "@/features/build-pc/model/store";
// import type { Category, PartRow } from "@/entities/part/model/types";
// import type { SavedBuildRow } from "@/entities/saved-build/model/types";
// import { fetchSavedBuilds } from "@/entities/saved-build/api/savedBuilds";
// import { fetchParts } from "@/entities/part/api/fetchParts";
// import type { SavedBuildData } from "@/entities/saved-build/model/types";
// import { useRouter } from "next/navigation";
//
// function isCompleteBuild(buildData: SavedBuildData, required: Category[]) {
//     return required.every((cat) => typeof buildData[cat] === "string" && buildData[cat]!.length > 0);
// }
//
// function buildStateFromSavedData(saved: SavedBuildRow, partsBySlug: Map<string, PartRow>, required: Category[]) {
//     const result: Partial<Record<Category, PartRow | null>> = {};
//     for (const cat of required) {
//         const slug = saved.build_data[cat];
//         result[cat] = slug ? partsBySlug.get(slug) ?? null : null;
//     }
//     return result;
// }
//
// export function SavedBuildsList({
//     requiredCategories,
//     refreshKey,
//     limit = 10,
//     maxShown = 5,
// }: {
//     requiredCategories: Category[];
//     refreshKey: number;
//     limit?: number;
//     maxShown?: number;
// }) {
//     const router = useRouter();
//     const { parts, setParts, setBuild } = useBuildStore();
//     const [items, setItems] = useState<SavedBuildRow[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//
//     const partsBySlug = useMemo(() => {
//         return new Map((parts ?? []).map((p) => [p.slug, p]));
//     }, [parts]);
//
//     useEffect(() => {
//         let mounted = true;
//         window.setTimeout(() => {
//             if (!mounted) return;
//             setLoading(true);
//             setError(null);
//         }, 0);
//         fetchSavedBuilds(limit)
//             .then((rows) => {
//                 if (!mounted) return;
//                 setItems(rows.filter((r) => isCompleteBuild(r.build_data, requiredCategories)));
//             })
//             .catch((e) => {
//                 if (!mounted) return;
//                 const msg = e instanceof Error ? e.message : String(e);
//                 setError(msg);
//                 setItems([]);
//             })
//             .finally(() => {
//                 if (!mounted) return;
//                 setLoading(false);
//             });
//         return () => {
//             mounted = false;
//         };
//     }, [requiredCategories, refreshKey, limit]);
//
//     async function applyBuild(saved: SavedBuildRow) {
//         const rows = parts?.length ? parts : await fetchParts();
//         if (!parts?.length) setParts(rows);
//
//         const map = new Map(rows.map((p) => [p.slug, p]));
//         const buildState = buildStateFromSavedData(saved, map, requiredCategories);
//
//         setBuild(buildState, { budget: saved.budget, platform: saved.platform });
//         router.push("/builder");
//     }
//
//     return (
//         <Card className="space-y-3">
//             <div className="flex items-center justify-between gap-3">
//                 <div>
//                     <h3 className="text-sm font-semibold text-text-secondary">Saved builds</h3>
//                     <div className="text-xs text-text-secondary">Последние полные сборки</div>
//                 </div>
//             </div>
//
//             {loading ? (
//                 <div className="animate-pulse text-sm text-text-secondary">Загрузка...</div>
//             ) : error ? (
//                 <div className="text-sm text-warning">{error}</div>
//             ) : items.length === 0 ? (
//                 <div className="text-sm text-text-secondary">Пока нет сохранённых сборок.</div>
//             ) : (
//                 <div className="space-y-2">
//                     {items.slice(0, maxShown).map((saved) => {
//                         const cpuSlug = saved.build_data.CPU;
//                         const gpuSlug = saved.build_data.GPU;
//                         const cpuName = cpuSlug ? partsBySlug.get(cpuSlug)?.name : null;
//                         const gpuName = gpuSlug ? partsBySlug.get(gpuSlug)?.name : null;
//
//                         return (
//                             <div key={saved.id} className="flex items-center justify-between gap-3">
//                                 <div className="min-w-0">
//                                     <div className="truncate text-sm font-medium">
//                                         {cpuName ?? cpuSlug ?? "CPU"} + {gpuName ?? gpuSlug ?? "GPU"}
//                                     </div>
//                                     <div className="text-xs text-text-secondary">
//                                         Budget: {saved.budget} • {saved.platform}
//                                     </div>
//                                 </div>
//
//                                 <div className="flex shrink-0 gap-2">
//                                     <Link href={`/saved/${saved.id}`} className="inline-flex">
//                                         <Button variant="outline">Open</Button>
//                                     </Link>
//                                     <Button variant="primary" onClick={() => void applyBuild(saved)}>
//                                         Apply
//                                     </Button>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}
//         </Card>
//     );
// }
//


'use client'

import React, { useEffect, useMemo, useState } from "react";
import { Button, Card } from "@/shared/ui";
import { useBuildStore } from "@/features/build-pc/model/store";
import type { Category, PartRow } from "@/entities/part/model/types";
import { localBuildsApi, LocalSavedBuild } from "@/entities/saved-build/api/savedBuilds";

export function SavedBuildsList({
                                    requiredCategories,
                                    refreshKey,
                                    maxShown = 5,
                                }: {
    requiredCategories: Category[];
    refreshKey: number;
    maxShown?: number;
}) {
    const { parts, setBuild } = useBuildStore();

    // важно: флаг маунта, чтобы не ломать hydration
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // читаем localStorage только на клиенте
    const items = useMemo(() => {
        if (!mounted) return [];
        return localBuildsApi.getAll();
    }, [mounted, refreshKey]);

    const partsBySlug = useMemo(() => {
        return new Map((parts ?? []).map((p) => [p.slug, p]));
    }, [parts]);

    function applyBuild(saved: LocalSavedBuild) {
        if (!parts?.length) return; // защита

        const buildState: Partial<Record<Category, PartRow | null>> = {};

        for (const cat of requiredCategories) {
            const slug = saved.buildData[cat];
            buildState[cat] = slug ? partsBySlug.get(slug) ?? null : null;
        }

        setBuild(buildState, {
            budget: saved.budget,
            platform: saved.platform,
        });
    }

    // не рендерим на сервере
    if (!mounted || items.length === 0) return null;

    return (
        <Card className="space-y-3 w-full">
            <h3 className="text-sm font-semibold text-text-secondary">
                Saved builds (Local)
            </h3>

            <div className="space-y-2">
                {items.slice(0, maxShown).map((saved) => {
                    const cpuName = saved.buildData.CPU
                        ? partsBySlug.get(saved.buildData.CPU)?.name
                        : "CPU";

                    const gpuName = saved.buildData.GPU
                        ? partsBySlug.get(saved.buildData.GPU)?.name
                        : "GPU";

                    return (
                        <div
                            key={saved.id}
                            className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0"
                        >
                            <div className="min-w-0 flex-1"> {/* Добавь min-w-0 и flex-1 сюда */}
                                <div className="truncate text-sm font-medium">
                                    {cpuName} + {gpuName}
                                </div>
                                <div className="text-xs text-text-secondary">
                                    {saved.totalPrice} грн • {saved.platform}
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                disabled={!parts?.length}
                                onClick={() => applyBuild(saved)}
                            >
                                Apply
                            </Button>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}