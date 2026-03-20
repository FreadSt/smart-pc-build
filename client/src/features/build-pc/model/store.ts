import { create } from "zustand";
import { PartRow, Category, Platform } from "@/entities/part/model/types";
import { buildPc } from "../lib/buildPc";
import { fetchParts } from "@/entities/part/api/fetchParts";
import { PLATFORM_SOCKETS } from "@/entities/part/model/constants";
import { getCoolerSockets, getFormFactor, getSocket } from "../lib/compatibility";

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
};

export const useBuildStore = create<Store>((set, get) => ({
    budget: 8000,
    platform: "any",
    parts: [],
    build: {},
    loading: false,

    setBudget: (budget) => set({ budget }),
    setPlatform: (platform) => set({ platform }),

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
            }

            return { build: next };
        });
    },
}));