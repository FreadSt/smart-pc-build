import {Category} from "@/shared/types/build-part";

export const CARDS: { category: Category; allowAuto: boolean }[] = [
    { category: "CPU", allowAuto: true },
    { category: "MOTHERBOARD", allowAuto: true },
    { category: "GPU", allowAuto: true },
    { category: "PSU", allowAuto: true },
    { category: "CPU_COOLER", allowAuto: false },
    { category: "CASE", allowAuto: false },
    { category: "RAM", allowAuto: true },
    { category: "SSD", allowAuto: true },
];
