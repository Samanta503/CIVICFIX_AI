import { getAuthToken } from "@/lib/auth-storage";
import type {
  AiComplaintListResponse,
  AiPredictComplaintResponse,
  AiPredictTextPayload,
  AiPredictTextResponse,
} from "@/types/ai.types";

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

export async function getAiComplaintItems(): Promise<AiComplaintListResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/complaints`, {
    method: "GET",
    headers: getJsonAuthHeaders(),
  });

  return parseResponse<AiComplaintListResponse>(response);
}

export async function predictComplaintText(
  payload: AiPredictTextPayload
): Promise<AiPredictTextResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/predict`, {
    method: "POST",
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse<AiPredictTextResponse>(response);
}

export async function runAiPredictionForComplaint(
  complaintId: number
): Promise<AiPredictComplaintResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/complaints/${complaintId}/predict`, {
    method: "POST",
    headers: getJsonAuthHeaders(),
    body: JSON.stringify({}),
  });

  return parseResponse<AiPredictComplaintResponse>(response);
}