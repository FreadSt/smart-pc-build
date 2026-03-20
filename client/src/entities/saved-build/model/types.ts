import type { Category, Platform } from "@/entities/part/model/types";

export type SavedBuildData = Partial<Record<Category, string>>;

export type SavedBuildRow = {
    id: string;
    created_at: string;
    updated_at?: string | null;
    budget: number;
    platform: Platform;
    total_price?: number | null;
    build_data: SavedBuildData;
};

