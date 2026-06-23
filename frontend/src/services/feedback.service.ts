import { getAuthToken } from "@/lib/auth-storage";
import type {
  AdminFeedbackResponse,
  CitizenFeedbackContextResponse,
  CitizenFeedbackListResponse,
  StoreFeedbackPayload,
  StoreFeedbackResponse,
} from "@/types/feedback.types";

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

export async function getCitizenFeedbackItems(): Promise<CitizenFeedbackListResponse> {
  const response = await fetch(`${API_BASE_URL}/citizen/feedback`, {
    method: "GET",
    headers: getJsonAuthHeaders(),
  });

  return parseResponse<CitizenFeedbackListResponse>(response);
}

export async function getCitizenFeedbackContext(
  complaintNo: string
): Promise<CitizenFeedbackContextResponse> {
  const response = await fetch(
    `${API_BASE_URL}/citizen/complaints/${encodeURIComponent(
      complaintNo
    )}/feedback-context`,
    {
      method: "GET",
      headers: getJsonAuthHeaders(),
    }
  );

  return parseResponse<CitizenFeedbackContextResponse>(response);
}

export async function submitCitizenFeedback(
  complaintNo: string,
  payload: StoreFeedbackPayload
): Promise<StoreFeedbackResponse> {
  const response = await fetch(
    `${API_BASE_URL}/citizen/complaints/${encodeURIComponent(
      complaintNo
    )}/feedback`,
    {
      method: "POST",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return parseResponse<StoreFeedbackResponse>(response);
}

export async function getAdminFeedback(): Promise<AdminFeedbackResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/feedback`, {
    method: "GET",
    headers: getJsonAuthHeaders(),
  });

  return parseResponse<AdminFeedbackResponse>(response);
}