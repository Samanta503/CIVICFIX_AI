import { getAuthToken } from "@/lib/auth-storage";
import type { AiMonitoringResponse } from "@/types/ai-monitoring.types";

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

export async function getAiMonitoring(): Promise<AiMonitoringResponse> {
  const response = await fetch(`${API_BASE_URL}/ai/monitoring`, {
    method: "GET",
    headers: getJsonAuthHeaders(),
  });

  return parseResponse<AiMonitoringResponse>(response);
}