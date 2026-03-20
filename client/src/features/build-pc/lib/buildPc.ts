import { PartRow } from "@/entities/part/model/types";
import { normalizePrice } from "@/shared/lib/utils/price";
import { getSocket, getCoolerSockets, getFormFactor } from "./compatibility";
import { getBudgetParts } from "./budget";

function pickBestUnderBudget(parts: PartRow[], budget: number) {
    const sorted = [...parts].sort((a, b) => normalizePrice(b.price) - normalizePrice(a.price));
    // If nothing fits sub-budget, still return something (cheapest overall) to avoid null builds.
    return sorted.find((p) => normalizePrice(p.price) <= budget) ?? sorted.at(-1) ?? null;
}

export function buildPc(rows: PartRow[], budget: number) {
    const b = getBudgetParts(budget);

    const cpuPoolAll = rows.filter((p) => p.category === "CPU");
    const cpuPoolKnown = cpuPoolAll.filter((p) => {
        const s = getSocket(p);
        return !!s && s !== "Unknown";
    });
    const cpu = pickBestUnderBudget(cpuPoolKnown.length ? cpuPoolKnown : cpuPoolAll, b.cpu);

    const moboPoolAll = rows.filter((p) => p.category === "MOTHERBOARD");
    const moboPoolKnown = moboPoolAll.filter((p) => {
        const s = getSocket(p);
        return !!s && s !== "Unknown";
    });
    const cpuSocket = getSocket(cpu);
    const moboCompatible =
        cpuSocket && cpuSocket !== "Unknown"
            ? moboPoolKnown.filter((m) => getSocket(m) === cpuSocket)
            : moboPoolKnown.length
                ? moboPoolKnown
                : moboPoolAll;

    const mobo = pickBestUnderBudget(moboCompatible.length ? moboCompatible : moboPoolAll, b.mobo);

    const gpu = pickBestUnderBudget(
        rows.filter((p) => p.category === "GPU"),
        b.gpu
    );

    const psu = pickBestUnderBudget(
        rows.filter((p) => p.category === "PSU"),
        b.psu
    );

    const cpuSocketForCooler = getSocket(cpu);
    const coolerPoolAll = rows.filter((p) => p.category === "CPU_COOLER");
    const coolerCompatible =
        cpuSocketForCooler && cpuSocketForCooler !== "Unknown"
            ? coolerPoolAll.filter((c) => {
                  const compatSockets = getCoolerSockets(c);
                  // If socket_compat is empty => unknown => allow.
                  return compatSockets.length === 0 || compatSockets.includes(cpuSocketForCooler);
              })
            : coolerPoolAll;
    // Data in parts specs can be slightly inconsistent; don't return null if we can't match by socket.
    const cooler = pickBestUnderBudget(coolerCompatible.length ? coolerCompatible : coolerPoolAll, b.cooler);

    const mbFormFactor = getFormFactor(mobo);
    const casePoolAll = rows.filter((p) => p.category === "CASE");
    const caseCompatible =
        mbFormFactor && mbFormFactor !== "Other"
            ? casePoolAll.filter((c) => {
                  const caseFf = getFormFactor(c);
                  if (!caseFf) return true; // unknown => allow
                  if (caseFf === "Other") return true;
                  return caseFf === mbFormFactor;
              })
            : casePoolAll;

    // If form_factor matching fails, keep auto-build usable.
    const pcCase = pickBestUnderBudget(
        caseCompatible.length ? caseCompatible : casePoolAll,
        b.case
    );

    return {
        CPU: cpu,
        MOTHERBOARD: mobo,
        GPU: gpu,
        PSU: psu,
        CPU_COOLER: cooler,
        CASE: pcCase,
    };
}