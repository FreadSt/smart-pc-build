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

    return {
        category: 'CPU',
        socket,
        model,
        tdp: tdpMatch ? parseInt(tdpMatch[1]) : null,
        is_unlocked: t.includes('K') || t.includes('X'),
    }
}