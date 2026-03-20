export function normalizePrice(p: number | string) {
    if (typeof p === "number") return p;
    const parsed = Number.parseFloat(p);
    return Number.isFinite(parsed) ? parsed : 0;
}

export function money(n: number) {
    return `${new Intl.NumberFormat("uk-UA", {
        maximumFractionDigits: 0,
    }).format(n)} грн`;
}