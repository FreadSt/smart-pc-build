"use client";

import React, { useEffect, useState } from "react";
import { BuilderPage } from "@/app/builder/ui";
import { useParams } from "next/navigation";
import { fetchParts } from "@/entities/part/api/fetchParts";
import { getSavedBuildById } from "@/entities/saved-build/api/savedBuilds";
import { useBuildStore } from "@/features/build-pc/model/store";
import type { Category, Platform, PartRow } from "@/entities/part/model/types";

type BuildState = Partial<Record<Category, PartRow | null>>;

const REQUIRED_CATEGORIES: Category[] = ["CPU", "MOTHERBOARD", "GPU", "PSU", "CPU_COOLER", "CASE", "RAM", "SSD"];

export default function SavedBuildEditPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id;

    const { setParts, setBuild, setBudget, setPlatform } = useBuildStore();

    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let mounted = true;
        async function run() {
            if (!id) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            setLoading(true);
            setNotFound(false);

            try {
                const saved = await getSavedBuildById(id);
                if (!saved) {
                    if (!mounted) return;
                    setNotFound(true);
                    return;
                }

                const parts = await fetchParts();

                const partsBySlug = new Map(parts.map((p) => [p.slug, p]));

                const buildState: BuildState = {};
                for (const cat of REQUIRED_CATEGORIES) {
                    const slug = saved.build_data[cat];
                    buildState[cat] = slug ? partsBySlug.get(slug) ?? null : null;
                }

                if (!mounted) return;
                setParts(parts);
                setBudget(saved.budget);
                setPlatform(saved.platform as Platform);
                setBuild(buildState, { budget: saved.budget, platform: saved.platform as Platform });
            } finally {
                if (mounted) setLoading(false);
            }
        }

        void run();
        return () => {
            mounted = false;
        };
    }, [id, setBuild, setBudget, setParts, setPlatform]);

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <div className="animate-pulse text-sm text-text-secondary">Loading saved build...</div>
            </main>
        );
    }

    if (notFound) {
        return (
            <main className="flex min-h-screen items-center justify-center">
                <div className="text-sm text-warning">Saved build not found.</div>
            </main>
        );
    }

    return <BuilderPage savedBuildId={id ?? null} />;
}

