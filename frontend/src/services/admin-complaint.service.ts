import { getAuthToken } from "@/lib/auth-storage";
import type {
  AdminComplaintFilters,
  AdminComplaintListResponse,
  AdminComplaintSingleResponse,
  AdminComplaintUpdatePayload,
} from "@/types/admin-complaint.types";

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

function buildQuery(filters?: AdminComplaintFilters): string {
  if (!filters) return "";

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export async function getAdminComplaints(
  filters?: AdminComplaintFilters
): Promise<AdminComplaintListResponse> {
  const response = await fetch(
    `${API_BASE_URL}/admin/complaints${buildQuery(filters)}`,
    {
      method: "GET",
      headers: getJsonAuthHeaders(),
    }
  );

  return parseResponse<AdminComplaintListResponse>(response);
}

export async function getAdminComplaint(
  complaintId: number
): Promise<AdminComplaintSingleResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}`, {
    method: "GET",
    headers: getJsonAuthHeaders(),
  });

  return parseResponse<AdminComplaintSingleResponse>(response);
}

export async function updateAdminComplaint(
  complaintId: number,
  payload: AdminComplaintUpdatePayload
): Promise<AdminComplaintSingleResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/complaints/${complaintId}`, {
    method: "PUT",
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse<AdminComplaintSingleResponse>(response);
}