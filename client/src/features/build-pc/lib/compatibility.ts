import { PartRow } from "@/entities/part/model/types";

function normalizeToken(value: string): string {
    return value.trim().toUpperCase();
}

function normalizeSocket(value: string): string {
    const v = normalizeToken(value)
        // Some sources can contain Cyrillic 'А' instead of Latin 'A'
        .replaceAll("АМ4", "AM4")
        .replaceAll("АМ5", "AM5");

    if (v.includes("LGA1700") || v.includes("1700")) return "LGA1700";
    if (v.includes("LGA1151") || v.includes("1151")) return "LGA1151";
    if (v.includes("AM5")) return "AM5";
    if (v.includes("AM4")) return "AM4";
    return v;
}

export function getSocket(part?: PartRow | null): string | null {
    const s = part?.specs?.socket;
    return typeof s === "string" && s.trim().length ? normalizeSocket(s) : null;
}

export function getCoolerSockets(part?: PartRow | null): string[] {
    const raw = part?.specs?.socket_compat;

    if (Array.isArray(raw)) {
        return raw
            .filter((s): s is string => typeof s === "string")
            .map((s) => normalizeSocket(s))
            .filter(Boolean);
    }

    if (typeof raw === "string") {
        const parts = raw
            .split(/[,;|/]+/g)
            .map((s) => s.trim())
            .filter(Boolean);
        return parts.map((s) => normalizeSocket(s));
    }

    return [];
}

export function getFormFactor(part?: PartRow | null) {
    const ff = part?.specs?.form_factor;
    if (typeof ff !== "string" || !ff.trim().length) return null;

    const norm = ff.trim();
    const upper = norm.toUpperCase();

    if (upper === "MATX") return "mATX";
    if (upper === "ATX") return "ATX";
    if (upper === "ITX") return "ITX";
    if (upper === "OTHER" || upper === "OTHERS") return "Other";
    return norm;
}

export function getCpuDdrType(part?: PartRow | null): "DDR4" | "DDR5" | "Other" | null {
    const v = part?.specs?.ddr_type;
    if (typeof v !== "string") return null;
    const upper = v.trim().toUpperCase();
    if (upper.includes("DDR5")) return "DDR5";
    if (upper.includes("DDR4")) return "DDR4";
    if (upper === "OTHER" || upper.length === 0) return "Other";
    return "Other";
}

export function getCpuMaxMemorySpeedMhz(part?: PartRow | null): number | null {
    const v = part?.specs?.max_memory_speed_mhz;
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
    if (typeof v === "string") {
        const n = parseInt(v, 10);
        return Number.isFinite(n) && n > 0 ? n : null;
    }
    return null;
}

export function getRamDdrType(part?: PartRow | null): "DDR4" | "DDR5" | "Other" | null {
    const v = part?.specs?.ddr_type;
    if (typeof v !== "string") return null;
    const upper = v.trim().toUpperCase();
    if (upper.includes("DDR5")) return "DDR5";
    if (upper.includes("DDR4")) return "DDR4";
    return "Other";
}

export function getMotherboardRamType(part?: PartRow | null): "DDR4" | "DDR5" | "Other" | null {
    const v = part?.specs?.ram_type;
    if (typeof v !== "string") return null;
    const upper = v.trim().toUpperCase();
    if (upper.includes("DDR5")) return "DDR5";
    if (upper.includes("DDR4")) return "DDR4";
    return "Other";
}

export function getRamSpeedMhz(part?: PartRow | null): number | null {
    const v = part?.specs?.speed_mhz;
    if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
    if (typeof v === "string") {
        const n = parseInt(v, 10);
        return Number.isFinite(n) && n > 0 ? n : null;
    }
    return null;
}

export function getM2Slots(part?: PartRow | null): number | null {
    const v = part?.specs?.m2_slots;
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) return v;
    if (typeof v === "string") {
        const n = parseInt(v, 10);
        return Number.isFinite(n) && n >= 0 ? n : null;
    }
    return null;
}

export function getSsdFormFactor(part?: PartRow | null): "M.2" | "2.5" | "Other" | null {
    const v = part?.specs?.form_factor;
    if (typeof v !== "string") return null;
    const upper = v.trim().toUpperCase();
    if (upper.includes("M.2") || upper.includes("M2") || upper.includes("NVME")) return "M.2";
    if (upper.includes("2.5") || upper.includes("2,5")) return "2.5";
    return "Other";
}