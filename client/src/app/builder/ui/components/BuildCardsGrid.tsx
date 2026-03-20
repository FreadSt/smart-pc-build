import { Button, Card } from "@/shared/ui";
import { Category, PartRow } from "@/entities/part/model/types";
import { CATEGORY_LABEL } from "@/entities/part/model/constants";
import { money, normalizePrice } from "@/shared/lib/utils/price";

type BuildState = Partial<Record<Category, PartRow | null>>;

type Props = {
    build: BuildState;
    partsByCategory: Record<Category, PartRow[]>;
    onChangeCategory: (cat: Category) => void;
};

const CARDS: { category: Category; allowAuto: boolean }[] = [
    { category: "CPU", allowAuto: true },
    { category: "MOTHERBOARD", allowAuto: true },
    { category: "GPU", allowAuto: true },
    { category: "PSU", allowAuto: true },
    { category: "CPU_COOLER", allowAuto: false },
    { category: "CASE", allowAuto: false },
    { category: "RAM", allowAuto: true },
    { category: "SSD", allowAuto: true },
];

export function BuildCardsGrid({ build, partsByCategory, onChangeCategory }: Props) {

    return (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {CARDS.map(({ category, allowAuto }) => {
                const part = build[category] ?? null;
                const canChange = partsByCategory[category].length > 0;
                console.log(part, 'part')
                return (
                    <Card key={category} className="space-y-2">
                        <div className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                            {CATEGORY_LABEL[category]}
                        </div>

                        {part ? (
                            <div className="space-y-1">
                                {part.image_url ? (
                                    // Supabase stores images as top-level `image_url`
                                    <img
                                        src={part.image_url}
                                        alt={part.name}
                                        className="h-16 w-full rounded-md object-cover"
                                        loading="lazy"
                                    />
                                ) : null}
                                <div className="text-sm font-medium">{part.name}</div>
                                <div className="text-sm text-text-secondary">
                                    {money(normalizePrice(part.price))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-text-secondary">
                                {category === "CPU_COOLER" ? "Select manually" : "Not selected"}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button variant="outline" disabled={!canChange} onClick={() => onChangeCategory(category)}>
                                Change
                            </Button>

                            {!allowAuto && category === "CPU_COOLER" ? null : part?.link ? (
                                <a
                                    className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-text-secondary hover:bg-background"
                                    href={part.link}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Open
                                </a>
                            ) : null}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

