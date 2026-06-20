import type {
  PublicComplaintListResponse,
  PublicComplaintSingleResponse,
  PublicComplaintStatsResponse,
} from "@/types/public-complaint.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data as T;
}

export type PublicComplaintFilters = {
  search?: string;
  status?: string;
  priority?: string;
  category_id?: string;
  department_id?: string;
  zone_id?: string;
};

function buildQuery(filters?: PublicComplaintFilters): string {
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

export async function getPublicComplaints(
  filters?: PublicComplaintFilters
): Promise<PublicComplaintListResponse> {
  const response = await fetch(
    `${API_BASE_URL}/public/complaints${buildQuery(filters)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  return parseResponse<PublicComplaintListResponse>(response);
}

export async function getPublicComplaint(
  complaintNo: string
): Promise<PublicComplaintSingleResponse> {
  const response = await fetch(`${API_BASE_URL}/public/complaints/${complaintNo}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return parseResponse<PublicComplaintSingleResponse>(response);
}

export async function getPublicComplaintStats(): Promise<PublicComplaintStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/public/complaint-stats`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return parseResponse<PublicComplaintStatsResponse>(response);
}