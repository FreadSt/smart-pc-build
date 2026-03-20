import type { Specs } from '../types/product';

function parseFirstIntFromMatch(match: RegExpMatchArray | null): number | null {
    if (!match || !match[1]) return null;
    const n = parseInt(match[1], 10);
    return Number.isFinite(n) ? n : null;
}

export function normalizeRAM(title: string): Specs {
    const t = title.toUpperCase();

    let ddr_type: 'DDR4' | 'DDR5' | 'Other' = 'Other';
    if (t.includes('DDR5')) ddr_type = 'DDR5';
    else if (t.includes('DDR4')) ddr_type = 'DDR4';

    const speedMatch =
        title.match(/(\d{3,4})\s*(?:MHZ|MH\/S|M\/S|MHz)/i) ||
        title.match(/(\d{3,4})\s*\/\s*MB\/S/i);
    const speed_mhz = parseFirstIntFromMatch(speedMatch);

    const capacityMatch = title.match(/(\d+)\s*GB/i) || title.match(/(\d+)\s*ГБ/i);
    const capacity_gb = parseFirstIntFromMatch(capacityMatch);

    // Desktop vs laptop.
    let form_factor: 'DIMM' | 'SO-DIMM' | 'Other' = 'Other';
    const isLaptop =
        t.includes('SO-DIMM') ||
        t.includes('SODIMM') ||
        t.includes('SO DIMM') ||
        t.includes('NOTEBOOK') ||
        t.includes('НОУТБУК') ||
        t.includes('ЛАПТОП');
    if (isLaptop) form_factor = 'SO-DIMM';
    else if (t.includes('DIMM') || t.includes('UDIMM') || !isLaptop) form_factor = 'DIMM';

    return {
        category: 'RAM',
        ddr_type,
        speed_mhz,
        capacity_gb,
        form_factor,
    };
}

