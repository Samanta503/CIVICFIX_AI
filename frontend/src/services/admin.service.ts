import { getAuthToken } from "@/lib/auth-storage";
import type {
  AdminCategoriesResponse,
  AdminCategoryPayload,
  AdminDashboardResponse,
  AdminDepartmentPayload,
  AdminDepartmentsResponse,
  AdminMetaResponse,
  AdminUserPayload,
  AdminUsersResponse,
} from "@/types/admin.types";

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

export async function getAdminDashboard(): Promise<AdminDashboardResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    method: "GET",
    headers: getJsonAuthHeaders(),
  });

  return parseResponse<AdminDashboardResponse>(response);
}

export async function getAdminMeta(): Promise<AdminMetaResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/meta`, {
    method: "GET",
    headers: getJsonAuthHeaders(),
  });

  return parseResponse<AdminMetaResponse>(response);
}

export async function getAdminUsers(): Promise<AdminUsersResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: "GET",
    headers: getJsonAuthHeaders(),
  });

  return parseResponse<AdminUsersResponse>(response);
}

export async function createAdminUser(
  payload: AdminUserPayload
): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: "POST",
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function updateAdminUser(
  userId: number,
  payload: AdminUserPayload
): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: "PUT",
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function getAdminDepartments(): Promise<AdminDepartmentsResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/departments`, {
    method: "GET",
    headers: getJsonAuthHeaders(),
  });

  return parseResponse<AdminDepartmentsResponse>(response);
}

export async function createAdminDepartment(
  payload: AdminDepartmentPayload
): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/admin/departments`, {
    method: "POST",
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function updateAdminDepartment(
  departmentId: number,
  payload: AdminDepartmentPayload
): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/admin/departments/${departmentId}`, {
    method: "PUT",
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function getAdminCategories(): Promise<AdminCategoriesResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/categories`, {
    method: "GET",
    headers: getJsonAuthHeaders(),
  });

  return parseResponse<AdminCategoriesResponse>(response);
}

export async function createAdminCategory(
  payload: AdminCategoryPayload
): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/admin/categories`, {
    method: "POST",
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function updateAdminCategory(
  categoryId: number,
  payload: AdminCategoryPayload
): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}`, {
    method: "PUT",
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}