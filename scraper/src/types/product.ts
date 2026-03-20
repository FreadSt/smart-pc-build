export type Category = 'CPU' | 'MOTHERBOARD' | 'GPU' | 'PSU' | 'CPU_COOLER' | 'CASE';

export type CpuSpecs = {
    socket: string;
    model: string;
    tdp: number | null;
    is_unlocked: boolean;
};

export type CaseSpecs = {
    form_factor: 'ATX' | 'mATX' | 'ITX' | 'Other';
    model: string;
    max_cooler_height: number;
    max_gpu_length: number;
};

export type MotherboardSpecs = {
    socket: string;
    form_factor: 'ATX' | 'mATX' | 'ITX' | 'Other';
    chipset: string;
    ram_type: 'DDR4' | 'DDR5' | 'Other';
};

export type GpuSpecs = {
    chipset: string;
    vram_gb: number | null;
    length_mm: number | null;
};

export type PsuSpecs = {
    wattage: number | null;
    efficiency: string | null;
    form_factor: string | null;
};

export type CpuCoolerSpecs = {
    type: 'air' | 'aio' | 'other';
    tdp_supported: number | null;
    socket_compat: string[];
};

export type Specs =
    | ({ category: 'CPU' } & CpuSpecs)
    | ({ category: 'MOTHERBOARD' } & MotherboardSpecs)
    | ({ category: 'GPU' } & GpuSpecs)
    | ({ category: 'PSU' } & PsuSpecs)
    | ({ category: 'CPU_COOLER' } & CpuCoolerSpecs)
    | ({ category: 'CASE' } & CaseSpecs)

export type RawProduct = {
    title: string;
    price: number;
    link: string;
    img: string;
};

export type Product = {
    slug: string;
    name: string;
    price: number;
    image_url: string;
    link: string;
    specs: Specs;
};