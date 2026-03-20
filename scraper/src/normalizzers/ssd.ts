import type { Specs } from '../types/product';

export function normalizeSSD(title: string): Specs {
    const t = title.toUpperCase();

    const interface_ =
        t.includes('NVME') ? 'NVMe' : t.includes('SATA') ? 'SATA' : t.includes('PCIE') ? 'PCIe' : null;

    let form_factor: 'M.2' | '2.5' | 'Other' = 'Other';
    if (t.includes('M.2') || t.includes('NVME')) {
        form_factor = 'M.2';
    } else if (t.includes('2.5') || t.includes('2,5')) {
        form_factor = '2.5';
    }

    return {
        category: 'SSD',
        form_factor,
        interface: interface_,
    };
}

