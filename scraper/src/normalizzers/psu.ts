import type { Specs } from '../types/product';

export function normalizePSU(title: string): Specs {
    const t = title.toUpperCase();

    const wattMatch = title.match(/(\d+)\s?W/i);
    const wattage = wattMatch ? parseInt(wattMatch[1], 10) : null;

    const efficiencyMatch = title.match(/80\+\s?(BRONZE|GOLD|PLATINUM|SILVER|TITANIUM)/i);
    const efficiency = efficiencyMatch ? efficiencyMatch[0].toUpperCase() : null;

    let form_factor: string | null = null;
    if (t.includes('SFX')) form_factor = 'SFX';
    if (t.includes('ATX')) form_factor = 'ATX';

    return {
        category: 'PSU',
        wattage,
        efficiency,
        form_factor,
    };
}

