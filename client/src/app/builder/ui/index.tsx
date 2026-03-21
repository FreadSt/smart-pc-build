"use client";

import React, { useMemo, useState } from "react";
import { Header } from "@/widgets/header";
import { BuilderSettingsPanel } from "./components/BuilderSettingsPanel";
import { BuildCardsGrid } from "./components/BuildCardsGrid";
import { PartPickerModal } from "./components/PartPickerModal";
import { useBuildStore } from "@/features/build-pc/model/store";
import { PartRow, Platform } from "@/entities/part/model/types";
import { PLATFORM_SOCKETS } from "@/entities/part/model/constants";
import {
    getCoolerSockets,
    getCpuDdrType,
    getCpuMaxMemorySpeedMhz,
    getFormFactor,
    getM2Slots,
    getMotherboardRamType,
    getRamDdrType,
    getRamSpeedMhz,
    getSsdFormFactor,
    getSocket,
} from "@/features/build-pc/lib/compatibility";
import { money, normalizePrice } from "@/shared/lib/utils/price";
import { AlertTriangle } from "lucide-react";
import { BuilderTipsCarousel } from "./components/BuilderTipsCarousel";
import { PerformanceEstimatePanel } from "./components/PerformanceEstimatePanel";
import { SavedBuildsList } from "./components/SavedBuildsList";
import {localBuildsApi, upsertSavedBuild} from "@/entities/saved-build/api/savedBuilds";
import { Button } from "@/shared/ui";
import { OnboardingModal } from "./components/OnboardingModal";
import {Category} from "@/shared/types/build-part";

const CATEGORIES: Category[] = ["CPU", "MOTHERBOARD", "GPU", "PSU", "CPU_COOLER", "CASE", "RAM", "SSD"];

type BuildState = Partial<Record<Category, PartRow | null>>;

export function BuilderPage({ savedBuildId }: { savedBuildId?: string | null }) {
    const {
        budget,
        platform,
        loading,
        parts,
        build,
        setBudget,
        setPlatform,
        generate,
        selectPart,
    } = useBuildStore();

    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
    const [dataError, setDataError] = useState<string | null>(null);
    const [savedRefreshKey, setSavedRefreshKey] = useState(0);
    const [savingBuild, setSavingBuild] = useState(false);

    const budgetTooLow = budget < 8000;

    const partsByCategory = useMemo(() => {
        const map: Record<Category, PartRow[]> = {
            CPU: [],
            MOTHERBOARD: [],
            GPU: [],
            PSU: [],
            CPU_COOLER: [],
            CASE: [],
            RAM: [],
            SSD: [],
        };

        for (const p of parts) {
            map[p.category]?.push(p);
        }

        for (const cat of CATEGORIES) {
            map[cat].sort((a, b) => normalizePrice(a.price) - normalizePrice(b.price)); // cheaper first
        }

        return map;
    }, [parts]);

    const totalPrice = useMemo(() => {
        return CATEGORIES.reduce((acc, cat) => {
            const part = (build as BuildState)[cat];
            return part ? acc + normalizePrice(part.price) : acc;
        }, 0);
    }, [build]);

    const priceByCategory = useMemo(() => {
        const map = {} as Record<Category, number>;
        for (const cat of CATEGORIES) {
            const part = (build as BuildState)[cat];
            map[cat] = part ? normalizePrice(part.price) : 0;
        }
        return map;
    }, [build]);

    const socketCpu = getSocket((build as BuildState).CPU);
    const socketMobo = getSocket((build as BuildState).MOTHERBOARD);

    const cpuSpecs = (build as BuildState).CPU?.specs as Record<string, unknown> | undefined;
    const gpuSpecs = (build as BuildState).GPU?.specs as Record<string, unknown> | undefined;

    const cpuModel = typeof cpuSpecs?.model === "string" ? cpuSpecs.model : null;
    const gpuModel = typeof gpuSpecs?.chipset === "string" ? gpuSpecs.chipset : null;

    const platformSockets = useMemo(() => {
        if (platform === "any") return null;
        return PLATFORM_SOCKETS[platform as Exclude<Platform, "any">];
    }, [platform]);

    const compatibleOptions = useMemo(() => {
        if (!activeCategory) return [];

        const list = partsByCategory[activeCategory] ?? [];

        if (activeCategory === "CPU") {
            const base =
                !socketMobo || socketMobo === "Unknown"
                    ? list
                    : list.filter((p) => getSocket(p) === socketMobo);
            if (!platformSockets) return base;

            return base.filter((p) => {
                const s = getSocket(p);
                return s ? platformSockets.has(s) : false;
            });
        }

        if (activeCategory === "MOTHERBOARD") {
            const base =
                !socketCpu || socketCpu === "Unknown"
                    ? list
                    : list.filter((p) => getSocket(p) === socketCpu);
            if (!platformSockets) return base;

            return base.filter((p) => {
                const s = getSocket(p);
                return s ? platformSockets.has(s) : false;
            });
        }

        if (activeCategory === "CPU_COOLER") {
            const cpuSocket = getSocket((build as BuildState).CPU);
            if (!cpuSocket || cpuSocket === "Unknown") return list;
            return list.filter((p) => {
                const sockets = getCoolerSockets(p);
                // If socket_compat is empty => unknown => treat as compatible.
                return sockets.length === 0 || sockets.includes(cpuSocket);
            });
        }

        if (activeCategory === "CASE") {
            const mbFf = getFormFactor((build as BuildState).MOTHERBOARD);
            if (!mbFf || mbFf === "Other") return list;

            return list.filter((p) => {
                const caseFf = getFormFactor(p);
                if (!caseFf) return true;
                if (caseFf === "Other") return true;
                return caseFf === mbFf;
            });
        }

        if (activeCategory === "RAM") {
            const moboRamType = getMotherboardRamType((build as BuildState).MOTHERBOARD);
            const cpuDdrType = getCpuDdrType((build as BuildState).CPU);
            const cpuMaxSpeed = getCpuMaxMemorySpeedMhz((build as BuildState).CPU);

            return list.filter((p) => {
                const ramDdr = getRamDdrType(p);
                if (moboRamType && moboRamType !== "Other" && ramDdr && ramDdr !== moboRamType) return false;
                if (cpuDdrType && cpuDdrType !== "Other" && ramDdr && ramDdr !== cpuDdrType) return false;

                const ramSpeed = getRamSpeedMhz(p);
                if (cpuMaxSpeed && ramSpeed && ramSpeed > cpuMaxSpeed) return false;
                return true;
            });
        }

        if (activeCategory === "SSD") {
            const m2Slots = getM2Slots((build as BuildState).MOTHERBOARD);
            if (m2Slots === 0) {
                return list.filter((p) => {
                    const ff = getSsdFormFactor(p);
                    return !ff || ff === "2.5";
                });
            }
            return list;
        }

        // GPU / PSU: no additional filtering.
        return list;
    }, [
        activeCategory,
        partsByCategory,
        socketCpu,
        socketMobo,
        platformSockets,
        build,
    ]);

    function getBudgetImpact(cat: Category, candidate: PartRow) {
        const candidatePrice = normalizePrice(candidate.price);
        const nextTotal = totalPrice - (priceByCategory[cat] ?? 0) + candidatePrice;
        const overBy = Math.max(0, nextTotal - budget);
        return { nextTotal, overBy, isOver: overBy > 0 };
    }

    async function onBuildPc() {
        setDataError(null);
        try {
            await generate();
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            setDataError(msg);
        }
    }

    const isBuildComplete = useMemo(() => {
        return CATEGORIES.every((cat) => Boolean((build as BuildState)[cat]));
    }, [build]);

    // async function onSaveBuild() {
    //     if (!isBuildComplete) return;
    //
    //     setSavingBuild(true);
    //     try {
    //         const buildData: Partial<Record<Category, string>> = {};
    //         for (const cat of CATEGORIES) {
    //             const part = (build as BuildState)[cat];
    //             if (part) buildData[cat] = part.slug;
    //         }
    //
    //         await upsertSavedBuild({
    //             id: savedBuildId ?? undefined,
    //             budget,
    //             platform,
    //             buildData: buildData,
    //             totalPrice,
    //         });
    //
    //         setSavedRefreshKey((k) => k + 1);
    //     } catch (e) {
    //         const msg = e instanceof Error ? e.message : String(e);
    //         setDataError(msg);
    //     } finally {
    //         setSavingBuild(false);
    //     }
    // }

// Внутри BuilderPage
    async function onSaveBuild() {
        if (!isBuildComplete) return;

        setSavingBuild(true);
        try {
            const buildData: Partial<Record<Category, string>> = {};
            for (const cat of CATEGORIES) {
                const part = (build as BuildState)[cat];
                if (part) buildData[cat] = part.slug;
            }

            // Сохраняем локально
            localBuildsApi.save({
                budget,
                platform: platform as Platform,
                buildData,
                totalPrice,
            });

            // Триггерим обновление списка
            setSavedRefreshKey((k) => k + 1);
        } catch (e) {
            setDataError("Ошибка при сохранении");
        } finally {
            setSavingBuild(false);
        }
    }

    function handleSelectPart(cat: Category, part: PartRow) {
        selectPart(cat, part);
        setActiveCategory(null);
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />

            <main className="flex flex-1 bg-background">
                <BuilderSettingsPanel
                    budget={budget}
                    budgetTooLow={budgetTooLow}
                    platform={platform}
                    loading={loading}
                    dataError={dataError}
                    socketCpu={socketCpu}
                    socketMobo={socketMobo}
                    setBudget={setBudget}
                    setPlatform={setPlatform}
                    onBuildPc={onBuildPc}
                />

                <section className="flex-1 space-y-4 p-4 min-w-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-text-secondary">Your build</h2>
                        <div className="price text-sm flex items-center gap-2">
                            <span className={totalPrice > budget ? "text-warning" : undefined}>
                                {money(totalPrice)} • estimated
                            </span>
                            {totalPrice > budget ? (
                                <span
                                    className="inline-flex items-center"
                                    title="Автосборка вышла за рамки бюджета. Попробуйте: сменить платформу, увеличить бюджет или выбрать комплектующие вручную."
                                >
                                    <AlertTriangle className="h-4 w-4 text-warning" />
                                </span>
                            ) : null}
                        </div>
                    </div>

                    <BuilderTipsCarousel />

                    <BuildCardsGrid
                        build={build as BuildState}
                        partsByCategory={partsByCategory}
                        onChangeCategory={setActiveCategory}
                    />

                    <div className="flex items-center justify-between gap-3">
                        <Button variant="primary" disabled={!isBuildComplete || savingBuild} onClick={() => void onSaveBuild()}>
                            {savingBuild ? "Saving..." : "Save build"}
                        </Button>
                    </div>

                    <SavedBuildsList requiredCategories={CATEGORIES} refreshKey={savedRefreshKey} />
                </section>

                <PerformanceEstimatePanel
                    cpuModel={typeof cpuModel === "string" ? cpuModel : null}
                    gpuModel={typeof gpuModel === "string" ? gpuModel : null}
                />
            </main>

            <PartPickerModal
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                compatibleOptions={compatibleOptions}
                getBudgetImpact={getBudgetImpact}
                onSelectPart={handleSelectPart}
            />

            {/*<OnboardingModal />*/}
        </div>
    );
}

