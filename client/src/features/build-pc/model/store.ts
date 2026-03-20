import { create } from "zustand";
import { PartRow, Category, Platform } from "@/entities/part/model/types";
import { buildPc } from "../lib/buildPc";
import { fetchParts } from "@/entities/part/api/fetchParts";
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
} from "../lib/compatibility";

type BuildState = Partial<Record<Category, PartRow | null>>;

type Store = {
    budget: number;
    platform: Platform;
    parts: PartRow[];
    build: BuildState;
    loading: boolean;

    setBudget: (n: number) => void;
    setPlatform: (p: Platform) => void;
    generate: () => Promise<void>;
    selectPart: (cat: Category, part: PartRow) => void;

    setParts: (parts: PartRow[]) => void;
    setBuild: (build: BuildState, meta?: { budget?: number; platform?: Platform }) => void;
};

export const useBuildStore = create<Store>((set, get) => ({
    budget: 8000,
    platform: "any",
    parts: [],
    build: {},
    loading: false,

    setBudget: (budget) => set({ budget }),
    setPlatform: (platform) => set({ platform }),

    setParts: (parts) => set({ parts }),

    setBuild: (build, meta) => {
        set((state) => ({
            ...state,
            build,
            ...(meta?.budget !== undefined ? { budget: meta.budget } : null),
            ...(meta?.platform !== undefined ? { platform: meta.platform } : null),
        }));
    },

    generate: async () => {
        set({ loading: true });

        const current = get();
        const platform = current.platform;
        const budget = current.budget;

        try {
            const rows = await fetchParts();

            const allowedSockets =
                platform === "any"
                    ? new Set([...PLATFORM_SOCKETS.intel, ...PLATFORM_SOCKETS.amd])
                    : PLATFORM_SOCKETS[platform as Exclude<Platform, "any">];

            // Only constrain CPU/Mobo pools for auto-build.
            const rowsForBuild = rows.filter((p) => {
                if (p.category !== "CPU" && p.category !== "MOTHERBOARD") return true;
                const s = getSocket(p);
                // Keep parts with unknown socket too, otherwise auto-build can return null for MB/CPU.
                if (!s || s === "Unknown") return true;
                return allowedSockets.has(s);
            });

            const build = buildPc(rowsForBuild, budget);
            set({ parts: rows, build });
        } finally {
            set({ loading: false });
        }
    },

    selectPart: (cat, part) => {
        set((state) => {
            const next: BuildState = { ...state.build, [cat]: part };

            // CPU <-> Motherboard socket conflicts.
            if (cat === "CPU") {
                const s = getSocket(part);
                if (next.MOTHERBOARD && s && getSocket(next.MOTHERBOARD) !== s) next.MOTHERBOARD = null;

                // CPU cooler compatibility.
                if (next.CPU_COOLER && s) {
                    const compatSockets = getCoolerSockets(next.CPU_COOLER);
                    // If socket_compat is empty => unknown => treat as compatible.
                    if (compatSockets.length && !compatSockets.includes(s)) next.CPU_COOLER = null;
                }

                // RAM compatibility: DDR type + max memory speed.
                if (next.RAM) {
                    const moboRamType = getMotherboardRamType(next.MOTHERBOARD);
                    const cpuDdrType = getCpuDdrType(next.CPU);
                    const cpuMaxSpeed = getCpuMaxMemorySpeedMhz(next.CPU);
                    const ramDdr = getRamDdrType(next.RAM);
                    const ramSpeed = getRamSpeedMhz(next.RAM);

                    const ddrMismatch =
                        (cpuDdrType && cpuDdrType !== "Other" && ramDdr && ramDdr !== cpuDdrType) ||
                        (moboRamType && moboRamType !== "Other" && ramDdr && ramDdr !== moboRamType);

                    const speedMismatch = cpuMaxSpeed && ramSpeed ? ramSpeed > cpuMaxSpeed : false;
                    if (ddrMismatch || speedMismatch) next.RAM = null;
                }
            }

            if (cat === "MOTHERBOARD") {
                const s = getSocket(part);
                if (next.CPU && s && getSocket(next.CPU) !== s) next.CPU = null;

                // Case compatibility with motherboard form factor.
                const ff = getFormFactor(part);
                if (next.CASE && ff) {
                    const caseFf = getFormFactor(next.CASE);
                    if (caseFf && caseFf !== ff && caseFf !== "Other") next.CASE = null;
                }

                // RAM compatibility: motherboard DDR type and CPU max speed.
                if (next.RAM) {
                    const moboRamType = getMotherboardRamType(next.MOTHERBOARD);
                    const cpuDdrType = getCpuDdrType(next.CPU);
                    const cpuMaxSpeed = getCpuMaxMemorySpeedMhz(next.CPU);
                    const ramDdr = getRamDdrType(next.RAM);
                    const ramSpeed = getRamSpeedMhz(next.RAM);

                    const ddrMismatch =
                        (moboRamType && moboRamType !== "Other" && ramDdr && ramDdr !== moboRamType) ||
                        (cpuDdrType && cpuDdrType !== "Other" && ramDdr && ramDdr !== cpuDdrType);
                    const speedMismatch = cpuMaxSpeed && ramSpeed ? ramSpeed > cpuMaxSpeed : false;
                    if (ddrMismatch || speedMismatch) next.RAM = null;
                }

                // SSD compatibility: if no M.2 slots, only 2.5" SSDs.
                if (next.SSD) {
                    const m2Slots = getM2Slots(next.MOTHERBOARD);
                    const ssdFf = getSsdFormFactor(next.SSD);
                    if (m2Slots === 0 && ssdFf && ssdFf !== "2.5") next.SSD = null;
                }
            }

            if (cat === "RAM") {
                // If user chooses incompatible RAM, drop it (or let modal filtering do most of the work).
                if (next.MOTHERBOARD) {
                    const moboRamType = getMotherboardRamType(next.MOTHERBOARD);
                    const cpuDdrType = getCpuDdrType(next.CPU);
                    const ramDdr = getRamDdrType(next.RAM);
                    const cpuMaxSpeed = getCpuMaxMemorySpeedMhz(next.CPU);
                    const ramSpeed = getRamSpeedMhz(next.RAM);

                    const ddrMismatch =
                        (moboRamType && moboRamType !== "Other" && ramDdr && ramDdr !== moboRamType) ||
                        (cpuDdrType && cpuDdrType !== "Other" && ramDdr && ramDdr !== cpuDdrType);
                    const speedMismatch = cpuMaxSpeed && ramSpeed ? ramSpeed > cpuMaxSpeed : false;
                    if (ddrMismatch || speedMismatch) next.RAM = null;
                }
            }

            if (cat === "SSD") {
                if (next.MOTHERBOARD) {
                    const m2Slots = getM2Slots(next.MOTHERBOARD);
                    const ssdFf = getSsdFormFactor(next.SSD);
                    if (m2Slots === 0 && ssdFf && ssdFf !== "2.5") next.SSD = null;
                }
            }

            return { build: next };
        });
    },
}));