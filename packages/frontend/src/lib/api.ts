import {
  ApiListResponse,
  CreatePassagePayload,
  Passage,
  VehicleTypeOption
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message);
  }

  return (await response.json()) as T;
}

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    if (typeof payload === "object" && payload !== null) {
      if ("error" in payload && typeof payload.error === "string") {
        return payload.error;
      }

      if ("errors" in payload) {
        return JSON.stringify(payload.errors);
      }
    }
  } catch (error) {
    console.error("Failed to parse error payload", error);
  }

  return `Request failed with status ${response.status}`;
}

export async function fetchPassages(): Promise<Passage[]> {
  const response = await fetch(`${API_BASE_URL}/api/passages`, {
    cache: "no-store"
  });

  const payload = await handleResponse<ApiListResponse<Passage[]>>(response);
  return payload.data;
}

export async function fetchVehicleTypes(): Promise<VehicleTypeOption[]> {
  const response = await fetch(`${API_BASE_URL}/api/meta/vehicle-types`, {
    cache: "force-cache"
  });

  const payload = await handleResponse<ApiListResponse<VehicleTypeOption[]>>(
    response
  );
  return payload.data;
}

export async function createPassage(payload: CreatePassagePayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/passages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  await handleResponse<ApiListResponse<Passage>>(response);
}

export async function deletePassage(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/passages/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message);
  }
}
