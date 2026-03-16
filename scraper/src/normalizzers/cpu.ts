export function normalizeCPU(title: string) {
    const t = title.toUpperCase();

    // 1. Ищем сокет
    let socket = 'Unknown';
    if (t.includes('1700') || t.includes('S1700')) socket = 'LGA1700';
    if (t.includes('AM5')) socket = 'AM5';
    if (t.includes('AM4')) socket = 'AM4';

    // 2. Ищем поколение/модель (Regex)
    const modelMatch = title.match(/(i[3579]-\d{5}[KF]?|Ryzen [3579] \d{4}[X]?)/i);
    const model = modelMatch ? modelMatch[0] : 'Generic CPU';

    // 3. Доп. параметры (TDP, Ядра - если есть в названии)
    const tdpMatch = title.match(/(\d+)W/);

    return {
        socket,
        model,
        tdp: tdpMatch ? parseInt(tdpMatch[1]) : null,
        is_unlocked: t.includes('K') || t.includes('X'),
    };
}