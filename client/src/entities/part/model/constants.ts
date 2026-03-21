import { Platform } from "./types";
import {Category} from "@/shared/types/build-part";

export const CATEGORY_LABEL: Record<Category, string> = {
    CPU: "CPU",
    MOTHERBOARD: "Motherboard",
    GPU: "GPU",
    PSU: "Power supply",
    CPU_COOLER: "CPU cooler",
    CASE: "Case",
    RAM: "RAM",
    SSD: "SSD",
};

export const PLATFORM_LABEL: Record<Platform, string> = {
    any: "Any",
    intel: "Intel",
    amd: "AMD",
};

export const PLATFORM_SOCKETS = {
    intel: new Set(["LGA1700", "LGA1151"]),
    amd: new Set(["AM4", "AM5"]),
};