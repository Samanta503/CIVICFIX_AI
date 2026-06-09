import { getAuthToken } from "@/lib/auth-storage";
import type {
  AuthResponse,
  DashboardResponse,
  LoginPayload,
  LogoutResponse,
  MeResponse,
  RegisterPayload,
} from "@/types/auth.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data as T;
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe(): Promise<MeResponse> {
  return request<MeResponse>("/auth/me", {
    method: "GET",
  });
}

export function logout(): Promise<LogoutResponse> {
  return request<LogoutResponse>("/auth/logout", {
    method: "POST",
  });
}

export function getCitizenDashboard(): Promise<DashboardResponse> {
  return request<DashboardResponse>("/citizen/dashboard", {
    method: "GET",
  });
}

export function getOfficerDashboard(): Promise<DashboardResponse> {
  return request<DashboardResponse>("/officer/dashboard", {
    method: "GET",
  });
}

export function getDepartmentDashboard(): Promise<DashboardResponse> {
  return request<DashboardResponse>("/department/dashboard", {
    method: "GET",
  });
}

export function getAdminDashboard(): Promise<DashboardResponse> {
  return request<DashboardResponse>("/admin/dashboard", {
    method: "GET",
  });
}