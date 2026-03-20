export type Category =
  | 'CPU'
  | 'MOTHERBOARD'
  | 'GPU'
  | 'PSU'
  | 'CPU_COOLER'
  | 'CASE'
  | 'RAM'
  | 'SSD';

export type CpuSpecs = {
    socket: string;
    model: string;
    tdp: number | null;
    is_unlocked: boolean;
    ddr_type?: 'DDR4' | 'DDR5' | 'Other';
    max_memory_speed_mhz?: number | null;
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
    m2_slots?: number | null;
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

export type RamSpecs = {
    ddr_type: 'DDR4' | 'DDR5' | 'Other';
    speed_mhz: number | null;
    capacity_gb: number | null;
    // Desktop DIMM vs laptop SO-DIMM
    form_factor: 'DIMM' | 'SO-DIMM' | 'Other';
};

export type SsdSpecs = {
    form_factor: 'M.2' | '2.5' | 'Other';
    interface: string | null;
};

export type Specs =
    | ({ category: 'CPU' } & CpuSpecs)
    | ({ category: 'MOTHERBOARD' } & MotherboardSpecs)
    | ({ category: 'GPU' } & GpuSpecs)
    | ({ category: 'PSU' } & PsuSpecs)
    | ({ category: 'CPU_COOLER' } & CpuCoolerSpecs)
    | ({ category: 'CASE' } & CaseSpecs)
    | ({ category: 'RAM' } & RamSpecs)
    | ({ category: 'SSD' } & SsdSpecs);

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