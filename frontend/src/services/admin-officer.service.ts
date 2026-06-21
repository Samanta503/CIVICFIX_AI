import { getAuthToken } from "@/lib/auth-storage";
import type { AdminOfficerListResponse } from "@/types/admin-officer.types";

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

export type AdminOfficerFilters = {
  department_id?: string;
  zone_id?: string;
};

function buildQuery(filters?: AdminOfficerFilters): string {
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

export async function getAdminOfficers(
  filters?: AdminOfficerFilters
): Promise<AdminOfficerListResponse> {
  const response = await fetch(
    `${API_BASE_URL}/admin/officers${buildQuery(filters)}`,
    {
      method: "GET",
      headers: getJsonAuthHeaders(),
    }
  );

  return parseResponse<AdminOfficerListResponse>(response);
}