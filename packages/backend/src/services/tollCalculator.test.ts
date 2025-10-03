import { describe, expect, it } from "vitest";
import { calculateCharges } from "./tollCalculator";
import { TollPassage } from "../types";

describe("calculateCharges", () => {
  it("returns zero for toll-free vehicle type", () => {
    const passages: TollPassage[] = [
      {
        id: "p1",
        vehicleId: "veh-1",
        vehicleType: "bus",
        timestamp: "2024-05-20T07:15:00+02:00"
      }
    ];

    const charges = calculateCharges(passages);
    const charge = charges.get("p1");

    expect(charge).toBeDefined();
    expect(charge?.chargedFee).toBe(0);
  });

  it("charges only the highest fee within an hour for the same vehicle", () => {
    const passages: TollPassage[] = [
      {
        id: "p1",
        vehicleId: "veh-1",
        vehicleType: "car",
        timestamp: "2024-05-20T07:05:00+02:00"
      },
      {
        id: "p2",
        vehicleId: "veh-1",
        vehicleType: "car",
        timestamp: "2024-05-20T07:45:00+02:00"
      },
      {
        id: "p3",
        vehicleId: "veh-1",
        vehicleType: "car",
        timestamp: "2024-05-20T08:10:00+02:00"
      }
    ];

    const charges = calculateCharges(passages);

    expect(charges.get("p1")?.chargedFee).toBe(18);
    expect(charges.get("p2")?.chargedFee).toBe(0);
    expect(charges.get("p3")?.chargedFee).toBe(13);
  });

  it("caps the daily total at 60 SEK", () => {
    const passages: TollPassage[] = [
      {
        id: "p1",
        vehicleId: "veh-1",
        vehicleType: "car",
        timestamp: "2024-05-20T06:05:00+02:00"
      },
      {
        id: "p2",
        vehicleId: "veh-1",
        vehicleType: "car",
        timestamp: "2024-05-20T07:05:00+02:00"
      },
      {
        id: "p3",
        vehicleId: "veh-1",
        vehicleType: "car",
        timestamp: "2024-05-20T08:35:00+02:00"
      },
      {
        id: "p4",
        vehicleId: "veh-1",
        vehicleType: "car",
        timestamp: "2024-05-20T15:35:00+02:00"
      },
      {
        id: "p5",
        vehicleId: "veh-1",
        vehicleType: "car",
        timestamp: "2024-05-20T17:05:00+02:00"
      }
    ];

    const charges = calculateCharges(passages);

    const total = Array.from(charges.values()).reduce(
      (sum, { chargedFee }) => sum + chargedFee,
      0
    );

    expect(total).toBe(60);
    expect(charges.get("p5")?.chargedFee).toBe(8);
  });

  it("skips tolls on weekends", () => {
    const passages: TollPassage[] = [
      {
        id: "p1",
        vehicleId: "veh-1",
        vehicleType: "car",
        timestamp: "2024-05-18T09:00:00+02:00" // Saturday
      }
    ];

    const charges = calculateCharges(passages);
    expect(charges.get("p1")?.chargedFee).toBe(0);
  });
});
