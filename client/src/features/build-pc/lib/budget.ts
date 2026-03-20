export function getBudgetParts(budget: number) {
    return {
        cpu: budget * 0.25,
        mobo: budget * 0.18,
        gpu: budget * 0.33,
        psu: budget * 0.1,
        cooler: budget * 0.03,
        case: budget * 0.02,
        ram: budget * 0.07,
        ssd: budget * 0.02,
    };
}