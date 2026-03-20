export type Category =
    | "CPU"
    | "MOTHERBOARD"
    | "GPU"
    | "PSU"
    | "CPU_COOLER"
    | "CASE";

export type Platform = "intel" | "amd" | "any";

export type PartRow = {
    slug: string;
    name: string;
    category: Category;
    price: number | string;
    link: string | null;
    image_url?: string | null;
    specs: Record<string, unknown>;
    updated_at?: string;
};