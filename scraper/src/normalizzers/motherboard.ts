import type { Specs } from '../types/product';

export function normalizeMotherboard(title: string): Specs {
    const t = title.toUpperCase();

    // Сокет приводим к тем же строкам, что и у CPU, чтобы обеспечить совместимость
    let socket = 'Unknown';
    if (t.includes('LGA1700') || t.includes('1700')) socket = 'LGA1700';
    if (t.includes('AM5')) socket = 'AM5';
    if (t.includes('AM4')) socket = 'AM4';

    let form_factor: 'ATX' | 'mATX' | 'ITX' | 'Other' = 'Other';
    if (t.includes('MICRO ATX') || t.includes('M-ATX') || t.includes('MATX')) form_factor = 'mATX';
    if (t.includes('MINI ITX') || t.includes('MITX') || t.includes('MINI-ITX')) form_factor = 'ITX';
    if (t.includes('ATX') && form_factor === 'Other') form_factor = 'ATX';

    const chipsetMatch = title.match(/(A[5-9]\d{2}|B[4-7]\d{2}|X[3-9]\d{2}|Z[4-9]\d{2}|H[5-9]\d{2})/i);
    const chipset = chipsetMatch ? chipsetMatch[0].toUpperCase() : 'UNKNOWN';

    let ram_type: 'DDR4' | 'DDR5' | 'Other' = 'Other';
    if (t.includes('DDR5')) ram_type = 'DDR5';
    else if (t.includes('DDR4')) ram_type = 'DDR4';

    return {
        category: 'MOTHERBOARD',
        socket,
        form_factor,
        chipset,
        ram_type,
    };
}

