import type { PublicComplaintTrackingResponse } from "@/types/public-tracking.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data as T;
}

export async function trackComplaintByNumber(
  complaintNo: string
): Promise<PublicComplaintTrackingResponse> {
  const response = await fetch(`${API_BASE_URL}/public/track-complaint`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      complaint_no: complaintNo,
    }),
  });

  return parseResponse<PublicComplaintTrackingResponse>(response);
}

export async function getPublicComplaintDetails(
  complaintNo: string
): Promise<PublicComplaintTrackingResponse> {
  const response = await fetch(
    `${API_BASE_URL}/public/track-complaint/${encodeURIComponent(complaintNo)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return parseResponse<PublicComplaintTrackingResponse>(response);
}