"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Modal, Button } from "@/shared/ui";

type Page = {
    title: string;
    description: string;
    accent: string;
    illustration: React.ReactNode;
};

function Illustration({ accent, label }: { accent: string; label: string }) {
    return (
        <svg viewBox="0 0 420 220" className="h-48 w-full" role="img" aria-label={label}>
            <defs>
                <linearGradient id="spb-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.4" />
                </linearGradient>
            </defs>
            <rect x="0" y="0" width="420" height="220" rx="18" fill="url(#spb-grad)" />
            <circle cx="340" cy="70" r="42" fill="rgba(255,255,255,0.18)" />
            <circle cx="315" cy="130" r="58" fill="rgba(255,255,255,0.12)" />
            <rect x="42" y="58" width="170" height="16" rx="8" fill="rgba(255,255,255,0.55)" />
            <rect x="42" y="86" width="120" height="10" rx="5" fill="rgba(255,255,255,0.35)" />
            <text x="42" y="172" fill="rgba(255,255,255,0.92)" fontSize="20" fontWeight="700">
                {label}
            </text>
        </svg>
    );
}

export function OnboardingModal() {
    const [open, setOpen] = useState(false);
    const [idx, setIdx] = useState(0);

    const pages: Page[] = useMemo(
        () => [
            {
                title: "Собирай ПК быстрее",
                description: "Выбирай CPU/GPU и бюджет — мы подберем совместимые комплектующие.",
                accent: "#2563EB",
                illustration: <Illustration accent="#2563EB" label="Fast Build" />,
            },
            {
                title: "Проверка совместимости",
                description: "Сокеты CPU и поддержка кулера, form-factor корпуса — без лишних ошибок.",
                accent: "#7C3AED",
                illustration: <Illustration accent="#7C3AED" label="Compatibility" />,
            },
            {
                title: "Перфоманс оценка",
                description: "После подбора CPU+GPU показываем score и сравнение с ближайшими конкурентами.",
                accent: "#10B981",
                illustration: <Illustration accent="#10B981" label="Performance" />,
            },
            {
                title: "Сохраняй удачные сборки",
                description: "Сохраняй готовые варианты, редактируй и применяй обратно в билдер.",
                accent: "#F59E0B",
                illustration: <Illustration accent="#F59E0B" label="Saved Builds" />,
            },
        ],
        []
    );

    useEffect(() => {
        const doneKey = "spb_onboarding_done_v1";
        if (typeof window === "undefined") return;

        const done = window.localStorage.getItem(doneKey);
        if (!done) {
            // Schedule outside effect body to avoid cascading renders.
            window.setTimeout(() => setOpen(true), 0);
        }
    }, []);

    function skip() {
        const doneKey = "spb_onboarding_done_v1";
        if (typeof window !== "undefined") {
            window.localStorage.setItem(doneKey, "1");
        }
        setOpen(false);
    }

    function next() {
        setIdx((v) => Math.min(v + 1, pages.length - 1));
    }

    function prev() {
        setIdx((v) => Math.max(v - 1, 0));
    }

    return (
        <Modal open={open} className="w-[80vw] max-w-3xl max-h-[80vh] p-6 flex flex-col">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-sm font-semibold text-text-secondary">Onboarding</div>
                    <div className="mt-1 text-xs text-text-secondary">
                        Шаг {idx + 1} / {pages.length}
                    </div>
                </div>
                <Button variant="ghost" onClick={() => skip()}>
                    Пропустить
                </Button>
            </div>

            <div className="mt-4 flex-1 overflow-hidden">
                <div className="h-full w-full">
                    <div
                        className="flex h-full w-[400%] transition-transform duration-300"
                        style={{ transform: `translateX(-${idx * 25}%)` }}
                    >
                        {pages.map((p, i) => (
                            <div key={i} className="w-full shrink-0 flex flex-col gap-4">
                                {p.illustration}
                                <div className="text-lg font-semibold">{p.title}</div>
                                <div className="text-sm text-text-secondary">{p.description}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={prev} disabled={idx === 0} className="px-2 py-2">
                        Назад
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    {pages.map((_, i) => (
                        <span
                            key={i}
                            className={[
                                "h-1.5 w-1.5 rounded-full transition-colors",
                                i === idx ? "bg-primary" : "bg-border",
                            ].join(" ")}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    {idx < pages.length - 1 ? (
                        <Button variant="primary" onClick={next}>
                            Далее
                        </Button>
                    ) : (
                        <Button variant="primary" onClick={() => skip()}>
                            Готово
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
}

