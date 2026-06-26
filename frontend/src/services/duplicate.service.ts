import { getAuthToken } from "@/lib/auth-storage";
import type {
  DuplicateBulkScanResponse,
  DuplicateListResponse,
  DuplicateScanResponse,
  DuplicateStatus,
  DuplicateUpdateStatusResponse,
} from "@/types/duplicate.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data as T;
}

function getJsonAuthHeaders(): HeadersInit {
  const token = getAuthToken();

  if (!token) {
    throw new Error("You are not logged in.");
  }

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getDuplicateSuggestions(
  status?: DuplicateStatus | "all"
): Promise<DuplicateListResponse> {
  const query = status && status !== "all" ? `?status=${status}` : "";

  const response = await fetch(`${API_BASE_URL}/ai/duplicates${query}`, {
    method: "GET",
    headers: getJsonAuthHeaders(),
  });

  return parseResponse<DuplicateListResponse>(response);
}

export async function runDuplicateScanForComplaint(
  complaintId: number
): Promise<DuplicateScanResponse> {
  const response = await fetch(
    `${API_BASE_URL}/ai/complaints/${complaintId}/duplicates/scan`,
    {
      method: "POST",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({}),
    }
  );

  return parseResponse<DuplicateScanResponse>(response);
}

export async function runBulkDuplicateScan(): Promise<DuplicateBulkScanResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/duplicates/run-bulk-scan`, {
    method: "POST",
    headers: getJsonAuthHeaders(),
    body: JSON.stringify({}),
  });

  return parseResponse<DuplicateBulkScanResponse>(response);
}

export async function updateDuplicateSuggestionStatus(
  suggestionId: number,
  payload: {
    status: DuplicateStatus;
    review_note?: string;
  }
): Promise<DuplicateUpdateStatusResponse> {
  const response = await fetch(
    `${API_BASE_URL}/ai/duplicates/${suggestionId}/status`,
    {
      method: "PUT",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return parseResponse<DuplicateUpdateStatusResponse>(response);
}