export type UserRole = "CUSTOMER" | "SUPPLIER" | "TECH";

export const roleLabels: Record<UserRole, string> = {
    CUSTOMER: "Khách hàng",
    SUPPLIER: "Chủ trạm",
    TECH: "Đội kỹ thuật",
};

// Thêm vào cuối file
export enum PriceName {
  CHARGING = "CHARGING",
  PENALTY = "PENALTY",
}

export interface PriceResponse {
  id: number;
  chargingPoleId: number;
  chargingPoleName: string;
  name: PriceName;
  price: number;
  effectiveFrom: string; // yyyy-MM-dd
  effectiveTo?: string;  // yyyy-MM-dd (optional)
  startTime: string;     // HH:mm:ss
  endTime: string;       // HH:mm:ss
  active: boolean;
}

export interface CreatePriceRequest {
  chargingPoleId: number;
  name: PriceName;
  price: number;
  effectiveFrom: string;
  effectiveTo?: string;
  startTime: string;
  endTime: string;
}

export interface UpdatePriceRequest {
  name?: PriceName;
  price?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  startTime?: string;
  endTime?: string;
}