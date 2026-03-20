import type { Specs } from '../types/product';

export function normalizeCPU(title: string): Specs {

    const t = title.toUpperCase()

    let socket = 'Unknown'

    if (t.includes('LGA1700') || t.includes('1700'))
        socket = 'LGA1700'

    if (t.includes('AM5'))
        socket = 'AM5'

    if (t.includes('AM4'))
        socket = 'AM4'

    const modelMatch = title.match(
        /(i[3579]-\d{4,5}[KF]?|Ryzen [3579] \d{4}[X3D]?)/i
    )

    const model = modelMatch
        ? modelMatch[0]
        : 'Generic CPU'

    const tdpMatch = title.match(/(\d+)W/)

    let ddr_type: 'DDR4' | 'DDR5' | 'Other' = 'Other';
    if (t.includes('DDR5')) ddr_type = 'DDR5';
    else if (t.includes('DDR4')) ddr_type = 'DDR4';

    // Best-effort parsing of max memory speed from title.
    // Example matches: "DDR4-3200", "DDR5 5600"
    const ddr4Speed = title.match(/DDR4[-\s]?(\d{3,4})/i);
    const ddr5Speed = title.match(/DDR5[-\s]?(\d{3,4})/i);
    const max_memory_speed_mhz = ddr5Speed
        ? parseInt(ddr5Speed[1], 10)
        : ddr4Speed
            ? parseInt(ddr4Speed[1], 10)
            : null;

    return {
        category: 'CPU',
        socket,
        model,
        tdp: tdpMatch ? parseInt(tdpMatch[1]) : null,
        is_unlocked: t.includes('K') || t.includes('X'),
        ddr_type,
        max_memory_speed_mhz,
    }
}