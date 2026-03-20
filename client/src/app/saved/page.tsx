'use client'

import type { Category } from "@/entities/part/model/types";
import dynamic from 'next/dynamic';

const REQUIRED_CATEGORIES: Category[] = ["CPU", "MOTHERBOARD", "GPU", "PSU", "CPU_COOLER", "CASE", "RAM", "SSD"];

const SavedBuildsList = dynamic(
    () => import('@/app/builder/ui/components/SavedBuildsList').then(mod => mod.SavedBuildsList),
    { ssr: false }
);
export default function SavedPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-start px-6 py-8">
            <h1 className="mb-4 text-2xl font-semibold">Saved builds</h1>
            <div className="w-full max-w-3xl">
                <SavedBuildsList requiredCategories={REQUIRED_CATEGORIES} refreshKey={0} maxShown={30} />
            </div>
        </main>
    );
}

