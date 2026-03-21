import type { Platform } from "@/entities/part/model/types";
import {Category} from "@/shared/types/build-part";

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

