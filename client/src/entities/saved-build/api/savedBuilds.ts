import { getSupabaseClient } from "@/shared/lib/supabase/client/client";
import type { Category, Platform } from "@/entities/part/model/types";
import type { SavedBuildData, SavedBuildRow } from "@/entities/saved-build/model/types";

type UpsertSavedBuildPayload = {
    id?: string;
    budget: number;
    platform: Platform;
    buildData: SavedBuildData;
    totalPrice?: number | null;
};

function isMissingSavedBuildsTable(error: unknown): boolean {
    if (!error || typeof error !== "object") return false;
    const e = error as { code?: string; message?: string };
    return e.code === "PGRST205" || (e.message ?? "").includes("Could not find the table");
}

export async function fetchSavedBuilds(limit = 10): Promise<SavedBuildRow[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("saved_builds")
        .select("id, created_at, updated_at, budget, platform, total_price, build_data")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        if (isMissingSavedBuildsTable(error)) return [];
        throw error;
    }
    return (data ?? []) as SavedBuildRow[];
}

export async function getSavedBuildById(id: string): Promise<SavedBuildRow | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from("saved_builds")
        .select("id, created_at, updated_at, budget, platform, total_price, build_data")
        .eq("id", id)
        .single();

    if (error) {
        if (isMissingSavedBuildsTable(error)) return null;
        return null;
    }
    return data as SavedBuildRow;
}

export async function upsertSavedBuild(payload: UpsertSavedBuildPayload): Promise<SavedBuildRow> {
    const supabase = getSupabaseClient();

    if (!payload.id) {
        const { data, error } = await supabase
            .from("saved_builds")
            .insert({
                budget: payload.budget,
                platform: payload.platform,
                build_data: payload.buildData,
                total_price: payload.totalPrice ?? null,
                updated_at: new Date().toISOString(),
            })
            .select("id, created_at, updated_at, budget, platform, total_price, build_data")
            .single();

        if (error) {
            if (isMissingSavedBuildsTable(error)) {
                throw new Error("Сохранение сборок временно недоступно: таблица `saved_builds` отсутствует.");
            }
            throw error;
        }
        return data as SavedBuildRow;
    }

    const { data, error } = await supabase
        .from("saved_builds")
        .upsert(
            {
                id: payload.id,
                budget: payload.budget,
                platform: payload.platform,
                build_data: payload.buildData,
                total_price: payload.totalPrice ?? null,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
        )
        .select("id, created_at, updated_at, budget, platform, total_price, build_data")
        .single();

    if (error) {
        if (isMissingSavedBuildsTable(error)) {
            throw new Error("Сохранение сборок временно недоступно: таблица `saved_builds` отсутствует.");
        }
        throw error;
    }
    return data as SavedBuildRow;
}

export function buildDataFromBuildState(build: Partial<Record<Category, { slug?: string } | null>>): SavedBuildData {
    const result: SavedBuildData = {};
    for (const [category, part] of Object.entries(build)) {
        if (!part || !("slug" in part)) continue;
        const slug = (part as { slug?: string | undefined }).slug;
        if (typeof slug === "string" && slug.length) {
            result[category as Category] = slug;
        }
    }
    return result;
}

