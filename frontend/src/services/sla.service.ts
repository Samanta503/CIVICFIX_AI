import { getAuthToken } from "@/lib/auth-storage";
import type {
  SlaAlertFilters,
  SlaAlertListResponse,
  SlaEscalationResponse,
  SlaRunCheckResponse,
} from "@/types/sla.types";

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

function buildQuery(filters?: SlaAlertFilters): string {
  if (!filters) return "";

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });

  const query = params.toString();

  return query ? `?${query}` : "";
}

export async function getAdminSlaAlerts(
  filters?: SlaAlertFilters
): Promise<SlaAlertListResponse> {
  const response = await fetch(
    `${API_BASE_URL}/admin/sla-alerts${buildQuery(filters)}`,
    {
      method: "GET",
      headers: getJsonAuthHeaders(),
    }
  );

  return parseResponse<SlaAlertListResponse>(response);
}

export async function runAdminSlaCheck(): Promise<SlaRunCheckResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/sla-alerts/run-check`, {
    method: "POST",
    headers: getJsonAuthHeaders(),
    body: JSON.stringify({}),
  });

  return parseResponse<SlaRunCheckResponse>(response);
}

export async function escalateAdminComplaint({
  complaintId,
  reason,
  note,
}: {
  complaintId: number;
  reason?: string;
  note?: string;
}): Promise<SlaEscalationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/admin/sla-alerts/complaints/${complaintId}/escalate`,
    {
      method: "POST",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({
        reason: reason || "manual_admin_escalation",
        note,
      }),
    }
  );

  return parseResponse<SlaEscalationResponse>(response);
}

export async function resolveAdminEscalation({
  escalationId,
  note,
}: {
  escalationId: number;
  note?: string;
}): Promise<SlaEscalationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/admin/sla-alerts/escalations/${escalationId}/resolve`,
    {
      method: "PUT",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({
        note,
      }),
    }
  );

  return parseResponse<SlaEscalationResponse>(response);
}

export async function getDepartmentSlaAlerts(
  filters?: SlaAlertFilters
): Promise<SlaAlertListResponse> {
  const response = await fetch(
    `${API_BASE_URL}/department/sla-alerts${buildQuery(filters)}`,
    {
      method: "GET",
      headers: getJsonAuthHeaders(),
    }
  );

  return parseResponse<SlaAlertListResponse>(response);
}

export async function escalateDepartmentComplaint({
  complaintId,
  reason,
  note,
}: {
  complaintId: number;
  reason?: string;
  note?: string;
}): Promise<SlaEscalationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/department/sla-alerts/complaints/${complaintId}/escalate`,
    {
      method: "POST",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({
        reason: reason || "manual_department_escalation",
        note,
      }),
    }
  );

  return parseResponse<SlaEscalationResponse>(response);
}

export async function resolveDepartmentEscalation({
  escalationId,
  note,
}: {
  escalationId: number;
  note?: string;
}): Promise<SlaEscalationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/department/sla-alerts/escalations/${escalationId}/resolve`,
    {
      method: "PUT",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({
        note,
      }),
    }
  );

  return parseResponse<SlaEscalationResponse>(response);
}