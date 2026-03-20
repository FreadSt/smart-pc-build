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