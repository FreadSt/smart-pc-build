import type { Specs } from '../types/product';

function clampPositiveInt(n: number | null | undefined, fallback: number) {
    if (!n || !Number.isFinite(n) || n <= 0) return fallback;
    return Math.round(n);
}

export function normalizeCase(title: string): Specs {
    const t = title.toUpperCase();

    let form_factor: 'ATX' | 'mATX' | 'ITX' | 'Other' = 'Other';
    if (
        t.includes('MICRO ATX') ||
        t.includes('MICRO-ATX') ||
        t.includes('M-ATX') ||
        t.includes('MATX')
    ) {
        form_factor = 'mATX';
    }
    if (
        t.includes('MINI ITX') ||
        t.includes('MINI-ITX') ||
        t.includes('MITX') ||
        t.includes('ITX')
    ) {
        form_factor = 'ITX';
    }
    if (
        (t.includes('ATX') || t.includes('E-ATX')) &&
        form_factor === 'Other'
    ) {
        form_factor = 'ATX';
    }

    // Best-effort parsing from title. If absent, keep reasonable defaults.
    const coolerHeightMatch = title.match(
        /(MAX\s*)?(CPU\s*)?COOLER\s*(HEIGHT)?\s*[:\-]?\s*(\d{2,3})\s*MM/i,
    );
    const max_cooler_height = clampPositiveInt(
        coolerHeightMatch ? parseInt(coolerHeightMatch[4], 10) : null,
        160,
    );

    const gpuLenMatch = title.match(
        /(MAX\s*)?(VGA|GPU)\s*(LENGTH)?\s*[:\-]?\s*(\d{2,3})\s*MM/i,
    );
    const max_gpu_length = clampPositiveInt(
        gpuLenMatch ? parseInt(gpuLenMatch[4], 10) : null,
        320,
    );

    // "model" for cases isn't critical for now; store normalized title snippet.
    const model = title.trim() || 'Generic Case';

    return {
        category: 'CASE',
        form_factor,
        model,
        max_cooler_height,
        max_gpu_length,
    };
}

