import { getAuthToken } from "@/lib/auth-storage";
import type {
  ComplaintListResponse,
  ComplaintSingleResponse,
  OfficerListResponse,
} from "@/types/complaint.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data as T;
}

function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();

  if (!token) {
    throw new Error("You are not logged in.");
  }

  return {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function getJsonAuthHeaders(): HeadersInit {
  return {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };
}

export async function getCitizenComplaints(): Promise<ComplaintListResponse> {
  const response = await fetch(`${API_BASE_URL}/citizen/complaints`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseResponse<ComplaintListResponse>(response);
}

export async function getCitizenComplaint(
  complaintNo: string
): Promise<ComplaintSingleResponse> {
  const response = await fetch(
    `${API_BASE_URL}/citizen/complaints/${complaintNo}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return parseResponse<ComplaintSingleResponse>(response);
}

export async function createCitizenComplaint(
  formData: FormData
): Promise<ComplaintSingleResponse> {
  const response = await fetch(`${API_BASE_URL}/citizen/complaints`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  return parseResponse<ComplaintSingleResponse>(response);
}

export async function getDepartmentComplaints(): Promise<ComplaintListResponse> {
  const response = await fetch(`${API_BASE_URL}/department/complaints`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseResponse<ComplaintListResponse>(response);
}

export async function getDepartmentOfficers(): Promise<OfficerListResponse> {
  const response = await fetch(`${API_BASE_URL}/department/officers`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseResponse<OfficerListResponse>(response);
}

export async function assignComplaintToOfficer({
  complaintId,
  officerId,
  note,
}: {
  complaintId: number;
  officerId: number;
  note?: string;
}): Promise<ComplaintSingleResponse> {
  const response = await fetch(
    `${API_BASE_URL}/department/complaints/${complaintId}/assign`,
    {
      method: "PUT",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({
        officer_id: officerId,
        note,
      }),
    }
  );

  return parseResponse<ComplaintSingleResponse>(response);
}

export async function getOfficerAssignedComplaints(): Promise<ComplaintListResponse> {
  const response = await fetch(`${API_BASE_URL}/officer/assigned-complaints`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return parseResponse<ComplaintListResponse>(response);
}

export async function updateOfficerComplaintStatus({
  complaintId,
  status,
  note,
}: {
  complaintId: number;
  status: "in_progress" | "resolved";
  note?: string;
}): Promise<ComplaintSingleResponse> {
  const response = await fetch(
    `${API_BASE_URL}/officer/assigned-complaints/${complaintId}/status`,
    {
      method: "PUT",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({
        status,
        note,
      }),
    }
  );

  return parseResponse<ComplaintSingleResponse>(response);
}