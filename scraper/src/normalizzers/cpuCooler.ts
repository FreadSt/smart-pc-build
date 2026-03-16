import type { Specs } from '../types/product';

export function normalizeCpuCooler(title: string): Specs {
    const t = title.toUpperCase();

    let type: 'air' | 'aio' | 'other' = 'other';
    if (t.includes('AIO') || t.includes('LIQUID') || t.includes('WATER')) type = 'aio';
    if (t.includes('TOWER') || t.includes('AIR')) type = 'air';

    const tdpMatch = title.match(/(\d+)\s?W/i);
    const tdp_supported = tdpMatch ? parseInt(tdpMatch[1], 10) : null;

    const sockets: string[] = [];
    if (t.includes('LGA1700') || t.includes('1700')) sockets.push('LGA1700');
    if (t.includes('AM5')) sockets.push('AM5');
    if (t.includes('AM4')) sockets.push('AM4');

    return {
        category: 'CPU_COOLER',
        type,
        tdp_supported,
        socket_compat: sockets,
    };
}

