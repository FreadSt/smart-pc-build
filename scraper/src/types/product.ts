export type Category = 'CPU' | 'MOTHERBOARD' | 'GPU' | 'PSU' | 'CPU_COOLER';

export type CpuSpecs = {
    socket: string;
    model: string;
    tdp: number | null;
    is_unlocked: boolean;
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
    | ({ category: 'CPU_COOLER' } & CpuCoolerSpecs);

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