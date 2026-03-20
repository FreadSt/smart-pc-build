import { PartRow } from "@/entities/part/model/types";
import { getCoolerSockets, getFormFactor, getSocket } from "@/features/build-pc/lib/compatibility";
import { normalizePrice } from "@/shared/lib/utils/price";

export function pickBestUnderBudget(parts: PartRow[], budget: number): PartRow | null {
    const sorted = [...parts].sort((a, b) => normalizePrice(b.price) - normalizePrice(a.price));
    return sorted.find((p) => normalizePrice(p.price) <= budget) ?? sorted.at(-1) ?? null;
}

export function pickCpuMoboPair(
    cpus: PartRow[],
    mobos: PartRow[],
    cpuBudget: number,
    moboBudget: number
): { cpu: PartRow; mobo: PartRow; sum: number } | null {
    const cpuCandidates = cpus.filter((c) => normalizePrice(c.price) <= cpuBudget);
    const moboCandidates = mobos.filter((m) => normalizePrice(m.price) <= moboBudget);

    let best: { cpu: PartRow; mobo: PartRow; sum: number } | null = null;

    for (const cpu of cpuCandidates) {
        const s = getSocket(cpu);
        if (!s || s === "Unknown") continue;
        for (const mobo of moboCandidates) {
            if (getSocket(mobo) !== s) continue;
            const sum = normalizePrice(cpu.price) + normalizePrice(mobo.price);
            if (!best || sum > best.sum) best = { cpu, mobo, sum };
        }
    }

    if (best) return best;

    // Fallback: best CPU, then best matching mobo by socket.
    const cpu = pickBestUnderBudget(cpus, cpuBudget);
    const s = getSocket(cpu);
    const compatibleMobos = s ? mobos.filter((m) => getSocket(m) === s) : mobos;
    const mobo = pickBestUnderBudget(compatibleMobos, moboBudget);
    if (!cpu || !mobo) return null;

    return { cpu, mobo, sum: normalizePrice(cpu.price) + normalizePrice(mobo.price) };
}

export function pickCooler(
    coolers: PartRow[],
    cpuSocket: string | null,
    budget: number
): PartRow | null {
    if (!cpuSocket || cpuSocket === "Unknown") return pickBestUnderBudget(coolers, budget);
    const compatible = coolers.filter((c) => getCoolerSockets(c).includes(cpuSocket));
    return pickBestUnderBudget(compatible, budget);
}

export function pickCase(
    cases: PartRow[],
    mbFormFactor: string | null,
    budget: number
): PartRow | null {
    if (!mbFormFactor || mbFormFactor === "Other") return pickBestUnderBudget(cases, budget);

    const compatible = cases.filter((c) => {
        const caseFf = getFormFactor(c);
        if (!caseFf) return true;
        if (caseFf === "Other") return true;
        return caseFf === mbFormFactor;
    });
    return pickBestUnderBudget(compatible, budget);
}
