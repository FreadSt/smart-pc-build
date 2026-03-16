export type ComponentId = string;

export interface PcComponent {
  id: ComponentId;
  type: "cpu" | "gpu" | "ram" | "storage" | "psu" | "case" | "cooler" | "motherboard" | "other";
  name: string;
  price: number;
}

