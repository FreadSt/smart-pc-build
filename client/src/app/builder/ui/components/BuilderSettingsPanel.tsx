import { Button, Card } from "@/shared/ui";
import { Platform } from "@/entities/part/model/types";
import { PLATFORM_LABEL } from "@/entities/part/model/constants";

type Props = {
    budget: number;
    budgetTooLow: boolean;
    platform: Platform;
    loading: boolean;
    dataError: string | null;
    socketCpu: string | null;
    socketMobo: string | null;
    setBudget: (n: number) => void;
    setPlatform: (p: Platform) => void;
    onBuildPc: () => Promise<void>;
};

export function BuilderSettingsPanel({
    budget,
    budgetTooLow,
    platform,
    loading,
    dataError,
    socketCpu,
    socketMobo,
    setBudget,
    setPlatform,
    onBuildPc,
}: Props) {
    return (
        <aside className="w-72 border-r border-border bg-card p-4">
            <h2 className="mb-4 text-sm font-semibold text-text-secondary">Build settings</h2>

            <Card className="space-y-3">
                <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        Platform
                    </div>
                    <select
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as Platform)}
                    >
                        {(Object.keys(PLATFORM_LABEL) as Platform[]).map((p) => (
                            <option key={p} value={p}>
                                {PLATFORM_LABEL[p]}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-secondary">
                        Budget
                    </div>
                    <input
                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                        type="number"
                        value={budget}
                        onChange={(e) => {
                            const v = e.target.value;
                            setBudget(v === "" ? 0 : Number(v));
                        }}
                    />
                    {budgetTooLow ? (
                        <div className="mt-1 text-xs text-warning">
                            Минимальный бюджет: 8000 грн
                        </div>
                    ) : null}
                </div>

                <Button variant="primary" disabled={loading} onClick={() => void onBuildPc()}>
                    {loading ? "Building..." : "Build PC"}
                </Button>

                {dataError ? <div className="text-xs text-red-300">{dataError}</div> : null}

                <div className="text-xs text-text-secondary">
                    {socketCpu && socketCpu !== "Unknown" ? <div>CPU socket: {socketCpu}</div> : null}
                    {socketMobo && socketMobo !== "Unknown" ? <div>MB socket: {socketMobo}</div> : null}
                </div>
            </Card>
        </aside>
    );
}

