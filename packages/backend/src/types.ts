export type VehicleType =
  | "car"
  | "motorcycle"
  | "emergency"
  | "tractor"
  | "diplomat"
  | "military"
  | "foreign"
  | "bus";

export const VEHICLE_TYPES: VehicleType[] = [
  "car",
  "motorcycle",
  "emergency",
  "tractor",
  "diplomat",
  "military",
  "foreign",
  "bus",
];

export const TOLL_FREE_VEHICLE_TYPES: VehicleType[] = [
  "emergency",
  "tractor",
  "diplomat",
  "military",
  "bus",
];

export interface TollPassage {
  id: string;
  vehicleId: string;
  vehicleType: VehicleType;
  timestamp: string;
}

export interface PassageCharge {
  passageId: string;
  baseFee: number;
  chargedFee: number;
  dailyTotal: number;
}

export interface PassageResponse extends TollPassage {
  baseFee: number;
  chargedFee: number;
  dailyTotal: number;
}
