import { Button, Modal } from "@/shared/ui";
import { PartRow } from "@/entities/part/model/types";
import { CATEGORY_LABEL } from "@/entities/part/model/constants";
import { money, normalizePrice } from "@/shared/lib/utils/price";
import {Category} from "@/shared/types/build-part";

type BudgetImpact = {
    nextTotal: number;
    overBy: number;
    isOver: boolean;
};

type Props = {
    activeCategory: Category | null;
    setActiveCategory: (cat: Category | null) => void;
    compatibleOptions: PartRow[];
    getBudgetImpact: (cat: Category, candidate: PartRow) => BudgetImpact;
    onSelectPart: (cat: Category, part: PartRow) => void;
};

export function PartPickerModal({
    activeCategory,
    setActiveCategory,
    compatibleOptions,
    getBudgetImpact,
    onSelectPart,
}: Props) {
    return (
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
                <div className="text-xs text-text-secondary">Socket filter is active to avoid incompatible selections.</div>
            ) : null}

            <div className="space-y-2">
                {activeCategory && compatibleOptions.length === 0 ? (
                    <div className="text-sm text-text-secondary">No compatible parts found.</div>
                ) : null}

                {activeCategory &&
                    compatibleOptions.map((p) => {
                        const { isOver, overBy } = getBudgetImpact(activeCategory, p);
                        const tooltip = isOver ? `Out of budget by ${money(overBy)}` : "Within budget";

                        return (
                            <button
                                key={p.slug}
                                title={tooltip}
                                className={[
                                    "w-full rounded-md border bg-background p-3 text-left hover:bg-card",
                                    isOver ? "border-warning/50 opacity-90" : "border-border",
                                ].join(" ")}
                                onClick={() => onSelectPart(activeCategory, p)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        {p.image_url ? (
                                            <img
                                                src={p.image_url}
                                                alt={p.name}
                                                className="h-10 w-10 flex-none rounded-md object-cover"
                                                loading="lazy"
                                            />
                                        ) : null}
                                        <div className="text-sm font-medium">{p.name}</div>
                                    </div>
                                    {isOver ? (
                                        <span className="inline-flex shrink-0 rounded-full bg-warning/20 px-2 py-1 text-[11px] font-semibold text-warning">
                                            Over budget
                                        </span>
                                    ) : null}
                                </div>
                                <div className="text-sm text-text-secondary">
                                    {money(normalizePrice(p.price))}
                                    {isOver ? <span className="ml-2 text-warning">(+{money(overBy)})</span> : null}
                                </div>
                            </button>
                        );
                    })}
            </div>
        </Modal>
    );
}

