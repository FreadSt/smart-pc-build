"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/shared/ui";
import { Button } from "@/shared/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TIPS: string[] = [
    "Начните с выбора платформы и бюджета: автосборка подберет совместимые комплектующие.",
    "Если автосборка выходит за бюджет, попробуйте сменить платформу или увеличить бюджет.",
    "В списке `Change` можно выбрать детали вручную — так вы управляете совместимостью точнее.",
    "Кулеры и корпуса зависят от сокета CPU и form-factor материнской платы.",
];

export function BuilderTipsCarousel() {
    const [idx, setIdx] = useState(0);

    useEffect(() => {
        const t = window.setInterval(() => {
            setIdx((v) => (v + 1) % TIPS.length);
        }, 6000);
        return () => window.clearInterval(t);
    }, []);

    const prev = () => setIdx((v) => (v - 1 + TIPS.length) % TIPS.length);
    const next = () => setIdx((v) => (v + 1) % TIPS.length);

    return (
        <Card className="p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="text-sm text-text-secondary">{TIPS[idx]}</div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" className="px-2 py-2" onClick={prev} aria-label="Previous tip">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="px-2 py-2" onClick={next} aria-label="Next tip">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
                {TIPS.map((_, i) => (
                    <span
                        key={i}
                        className={[
                            "h-1.5 w-1.5 rounded-full",
                            i === idx ? "bg-primary" : "bg-border",
                        ].join(" ")}
                    />
                ))}
            </div>
        </Card>
    );
}

