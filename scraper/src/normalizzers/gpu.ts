import type { Specs } from '../types/product';

export function normalizeGPU(title: string): Specs {
    const t = title.toUpperCase();

    const chipsetMatch = title.match(
        /(RTX\s?\d{3,4}\s?(TI)?|GTX\s?\d{3,4}\s?(TI)?|RX\s?\d{3,4}0?\s?XT?)/i,
    );
    const chipset = chipsetMatch ? chipsetMatch[0].toUpperCase().trim() : 'UNKNOWN';

    const vramMatch = title.match(/(\d+)\s?GB/i);
    const vram_gb = vramMatch ? parseInt(vramMatch[1], 10) : null;

    const lengthMatch = title.match(/(\d{2,3})\s?MM/i);
    const length_mm = lengthMatch ? parseInt(lengthMatch[1], 10) : null;

    return {
        category: 'GPU',
        chipset,
        vram_gb,
        length_mm,
    };
}

