"use client";

import React, { useMemo, useState } from "react";
import { Header } from "@/widgets/header";
import { Button, Card, Modal } from "@/shared/ui";
import { getSupabaseClient } from "@/shared/lib/supabase/client/client";

type Category = "CPU" | "MOTHERBOARD" | "GPU" | "PSU" | "CPU_COOLER";

type PartRow = {
  slug: string;
  name: string;
  category: Category;
  price: number | string;
  link: string | null;
  specs: any;
  updated_at?: string;
};

type BuildState = Partial<Record<Category, PartRow | null>>;

const CATEGORY_LABEL: Record<Category, string> = {
  CPU: "CPU",
  MOTHERBOARD: "Motherboard",
  GPU: "GPU",
  PSU: "Power supply",
  CPU_COOLER: "CPU cooler",
};

function money(n: number) {
    const formatted = new Intl.NumberFormat("uk-UA", {
        maximumFractionDigits: 0,
    }).format(n);

    return `${formatted} грн`;
}

function normalizePrice(p: PartRow["price"]) {
  if (typeof p === "number") return p;
  const parsed = Number.parseFloat(p);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getSocket(part: PartRow | null | undefined): string | null {
  const socket = part?.specs?.socket;
  return typeof socket === "string" && socket.length ? socket : null;
}

async function fetchParts(): Promise<PartRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("parts").select("*");
  if (error) throw error;
  return (data ?? []) as PartRow[];
}

function pickBestUnderBudget(parts: PartRow[], budget: number): PartRow | null {
  const sorted = [...parts].sort((a, b) => normalizePrice(b.price) - normalizePrice(a.price));
  const within = sorted.find((p) => normalizePrice(p.price) <= budget);
  return within ?? sorted.at(-1) ?? null;
}

function pickCpuMoboPair(
  cpus: PartRow[],
  mobos: PartRow[],
  cpuBudget: number,
  moboBudget: number
) {
  // max sum within budgets, same socket
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

  // fallback: pick best CPU, then best mobo matching socket under moboBudget
  const cpu = pickBestUnderBudget(cpus, cpuBudget);
  const s = getSocket(cpu);
  const compatibleMobos = s ? mobos.filter((m) => getSocket(m) === s) : mobos;
  const mobo = pickBestUnderBudget(compatibleMobos, moboBudget);
  if (!cpu || !mobo) return null;

  return { cpu, mobo, sum: normalizePrice(cpu.price) + normalizePrice(mobo.price) };
}

export function BuilderPage() {
  const [budget, setBudget] = useState<number>(8000);
  const [loading, setLoading] = useState(false);
  const [parts, setParts] = useState<PartRow[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [build, setBuild] = useState<BuildState>({
    CPU: null,
    MOTHERBOARD: null,
    GPU: null,
    PSU: null,
    CPU_COOLER: null, // оставить пустым для ручного выбора
  });

  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  const partsByCategory = useMemo(() => {
    const map: Record<Category, PartRow[]> = {
      CPU: [],
      MOTHERBOARD: [],
      GPU: [],
      PSU: [],
      CPU_COOLER: [],
    };

    for (const p of parts) {
      if (p?.category && map[p.category]) map[p.category].push(p);
    }

    // дешевле сначала
    for (const k of Object.keys(map) as Category[]) {
      map[k].sort((a, b) => normalizePrice(a.price) - normalizePrice(b.price));
    }

    return map;
  }, [parts]);

  const totalPrice = useMemo(() => {
    const sum = (Object.keys(build) as Category[]).reduce((acc, cat) => {
      const part = build[cat];
      if (!part) return acc;
      return acc + normalizePrice(part.price);
    }, 0);
    return sum;
  }, [build]);

  const socketCpu = getSocket(build.CPU);
  const socketMobo = getSocket(build.MOTHERBOARD);

  const compatibleOptions = useMemo(() => {
    if (!activeCategory) return [];
    const list = partsByCategory[activeCategory] ?? [];

    if (activeCategory === "CPU") {
      if (!socketMobo || socketMobo === "Unknown") return list;
      return list.filter((p) => getSocket(p) === socketMobo);
    }

    if (activeCategory === "MOTHERBOARD") {
      if (!socketCpu || socketCpu === "Unknown") return list;
      return list.filter((p) => getSocket(p) === socketCpu);
    }

    return list;
  }, [activeCategory, partsByCategory, socketCpu, socketMobo]);

  async function onBuildPc() {
    setLoading(true);
    setDataError(null);
    try {
      const rows = await fetchParts();
      setParts(rows);

      // распределение бюджета (пока “ядро”), бюджет теперь в гривнах
      const cpuBudget = budget * 0.25;
      const moboBudget = budget * 0.18;
      const gpuBudget = budget * 0.42;
      const psuBudget = budget * 0.1;

      const allowedSockets = new Set(["AM4", "AM5", "LGA1700", "LGA1151"]);

      const cpuPool = rows
        .filter((p) => p.category === "CPU")
        .filter((p) => {
          const s = getSocket(p);
          return s && s !== "Unknown" && allowedSockets.has(s);
        });

      const moboPool = rows
        .filter((p) => p.category === "MOTHERBOARD")
        .filter((p) => {
          const s = getSocket(p);
          return s && s !== "Unknown" && allowedSockets.has(s);
        });

      const pair = pickCpuMoboPair(cpuPool, moboPool, cpuBudget, moboBudget);
      const cpu = pair?.cpu ?? null;
      const mobo = pair?.mobo ?? null;

      const gpu = pickBestUnderBudget(
        rows.filter((p) => p.category === "GPU"),
        gpuBudget
      );
      const psu = pickBestUnderBudget(
        rows.filter((p) => p.category === "PSU"),
        psuBudget
      );

      const nextBuild: BuildState = {
        CPU: cpu,
        MOTHERBOARD: mobo,
        GPU: gpu,
        PSU: psu,
        CPU_COOLER: null, // оставить пустым
      };

      // Доп.валидация: если сборка сильно превышает бюджет — деградируем по GPU, затем CPU, затем MB
      const priceOf = (p: PartRow | null | undefined) => (p ? normalizePrice(p.price) : 0);
      const total = () =>
        priceOf(nextBuild.CPU) + priceOf(nextBuild.MOTHERBOARD) + priceOf(nextBuild.GPU) + priceOf(nextBuild.PSU);

      if (total() > budget * 1.05) {
        // GPU вниз по цене
        if (nextBuild.GPU) {
          const gpuList = [...partsByCategory.GPU].sort(
            (a, b) => normalizePrice(a.price) - normalizePrice(b.price)
          );
          const current = normalizePrice(nextBuild.GPU.price);
          const cheaper = gpuList
            .filter((x) => normalizePrice(x.price) < current)
            .find((x) => total() - current + normalizePrice(x.price) <= budget);
          if (cheaper) nextBuild.GPU = cheaper;
        }
      }

      if (total() > budget * 1.05) {
        // CPU вниз, сохраняя сокет с материнкой если она выбрана
        const moboSocket = getSocket(nextBuild.MOTHERBOARD);
        const cpuList = [...partsByCategory.CPU]
          .filter((c) => {
            const s = getSocket(c);
            if (!s || s === "Unknown" || !allowedSockets.has(s)) return false;
            if (!moboSocket || moboSocket === "Unknown") return true;
            return s === moboSocket;
          })
          .sort((a, b) => normalizePrice(a.price) - normalizePrice(b.price));
        const current = nextBuild.CPU ? normalizePrice(nextBuild.CPU.price) : Infinity;
        const cheaper = cpuList
          .filter((x) => normalizePrice(x.price) < current)
          .find((x) => total() - (nextBuild.CPU ? normalizePrice(nextBuild.CPU.price) : 0) + normalizePrice(x.price) <= budget);
        if (cheaper) nextBuild.CPU = cheaper;
      }

      if (total() > budget * 1.05) {
        // Motherboard вниз, сохраняя сокет CPU
        const cpuSocket = getSocket(nextBuild.CPU);
        const mbList = [...partsByCategory.MOTHERBOARD]
          .filter((m) => {
            const s = getSocket(m);
            if (!s || s === "Unknown" || !allowedSockets.has(s)) return false;
            if (!cpuSocket || cpuSocket === "Unknown") return true;
            return s === cpuSocket;
          })
          .sort((a, b) => normalizePrice(a.price) - normalizePrice(b.price));
        const current = nextBuild.MOTHERBOARD ? normalizePrice(nextBuild.MOTHERBOARD.price) : Infinity;
        const cheaper = mbList
          .filter((x) => normalizePrice(x.price) < current)
          .find((x) => total() - (nextBuild.MOTHERBOARD ? normalizePrice(nextBuild.MOTHERBOARD.price) : 0) + normalizePrice(x.price) <= budget);
        if (cheaper) nextBuild.MOTHERBOARD = cheaper;
      }

      setBuild(nextBuild);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setDataError(msg);
    } finally {
      setLoading(false);
    }
  }

  function selectPart(category: Category, part: PartRow) {
    setBuild((prev) => {
      const next: BuildState = { ...prev, [category]: part };

      // защита от конфликтов CPU <-> Motherboard по сокету
      if (category === "CPU") {
        const s = getSocket(part);
        if (next.MOTHERBOARD && s && getSocket(next.MOTHERBOARD) !== s) next.MOTHERBOARD = null;
      }
      if (category === "MOTHERBOARD") {
        const s = getSocket(part);
        if (next.CPU && s && getSocket(next.CPU) !== s) next.CPU = null;
      }

      return next;
    });
    setActiveCategory(null);
  }

  const cards: { category: Category; allowAuto: boolean }[] = [
    { category: "CPU", allowAuto: true },
    { category: "MOTHERBOARD", allowAuto: true },
    { category: "GPU", allowAuto: true },
    { category: "PSU", allowAuto: true },
    // кулер не автогенерим, и список на замену можно добавить позже
    { category: "CPU_COOLER", allowAuto: false },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 bg-[var(--background)]">
        {/* Left column */}
        <aside className="w-72 border-r border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-secondary)]">
            Build settings
          </h2>

          <Card className="space-y-3">
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Budget
              </div>
              <input
                className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
            </div>

            <Button variant="primary" disabled={loading} onClick={onBuildPc}>
              {loading ? "Building..." : "Build PC"}
            </Button>

            {dataError ? (
              <div className="text-xs text-red-300">
                {dataError}
              </div>
            ) : null}

            <div className="text-xs text-[var(--text-secondary)]">
              {socketCpu && socketCpu !== "Unknown" && (
                <div>CPU socket: {socketCpu}</div>
              )}
              {socketMobo && socketMobo !== "Unknown" && (
                <div>MB socket: {socketMobo}</div>
              )}
            </div>
          </Card>
        </aside>

        {/* Middle column */}
        <section className="flex-1 space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
              Your build
            </h2>
            <div className="price text-sm">
              {money(totalPrice)} • estimated
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {cards.map(({ category, allowAuto }) => {
              const part = build[category] ?? null;
              const canChange =
                category !== "CPU_COOLER" && partsByCategory[category].length > 0;

              return (
                <Card key={category} className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                    {CATEGORY_LABEL[category]}
                  </div>

                  {part ? (
                    <div className="space-y-1">
                      <div className="text-sm font-medium">{part.name}</div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        {money(normalizePrice(part.price))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-[var(--text-secondary)]">
                      {category === "CPU_COOLER"
                        ? "Select manually"
                        : "Not selected"}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={!canChange}
                      onClick={() => setActiveCategory(category)}
                    >
                      Change
                    </Button>

                    {!allowAuto && category === "CPU_COOLER" ? null : (
                      part?.link ? (
                        <a
                          className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--background)]"
                          href={part.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open
                        </a>
                      ) : null
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Right column */}
        <aside className="w-80 border-l border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="mb-4 text-sm font-semibold text-[var(--text-secondary)]">
            Performance estimate
          </h2>
          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            <Card>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                Notes
              </div>
              <div className="text-sm">
                Performance scoring will be added later.
              </div>
            </Card>
          </div>
        </aside>
      </main>

      <Modal open={Boolean(activeCategory)} className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">
            Change {activeCategory ? CATEGORY_LABEL[activeCategory] : "part"}
          </h2>
          <Button variant="ghost" onClick={() => setActiveCategory(null)}>
            Close
          </Button>
        </div>

        {activeCategory && (activeCategory === "CPU" || activeCategory === "MOTHERBOARD") ? (
          <div className="text-xs text-[var(--text-secondary)]">
            Socket filter is active to avoid incompatible selections.
          </div>
        ) : null}

        <div className="space-y-2">
          {activeCategory && compatibleOptions.length === 0 ? (
            <div className="text-sm text-[var(--text-secondary)]">
              No compatible parts found.
            </div>
          ) : null}

          {activeCategory &&
            compatibleOptions.slice(0, 50).map((p) => (
              <button
                key={p.slug}
                className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-left hover:bg-[var(--card)]"
                onClick={() => selectPart(activeCategory, p)}
              >
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-sm text-[var(--text-secondary)]">
                  {money(normalizePrice(p.price))}
                </div>
              </button>
            ))}
        </div>
      </Modal>
    </div>
  );
}

