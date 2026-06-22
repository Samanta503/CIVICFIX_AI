import { getAuthToken } from "@/lib/auth-storage";
import type {
  LatestNotificationResponse,
  NotificationListResponse,
  NotificationUnreadCountResponse,
  SendAdminNotificationPayload,
} from "@/types/notification.types";

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

export async function getMyNotifications(
  status?: "unread"
): Promise<NotificationListResponse> {
  const query = status ? `?status=${status}` : "";

  const response = await fetch(`${API_BASE_URL}/notifications${query}`, {
    method: "GET",
    headers: getJsonAuthHeaders(),
  });

  return parseResponse<NotificationListResponse>(response);
}

export async function getLatestNotifications(
  limit = 5
): Promise<LatestNotificationResponse> {
  const response = await fetch(
    `${API_BASE_URL}/notifications/latest?limit=${limit}`,
    {
      method: "GET",
      headers: getJsonAuthHeaders(),
    }
  );

  return parseResponse<LatestNotificationResponse>(response);
}

export async function getNotificationUnreadCount(): Promise<NotificationUnreadCountResponse> {
  const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
    method: "GET",
    headers: getJsonAuthHeaders(),
  });

  return parseResponse<NotificationUnreadCountResponse>(response);
}

export async function markNotificationAsRead(
  notificationId: number
): Promise<unknown> {
  const response = await fetch(
    `${API_BASE_URL}/notifications/${notificationId}/read`,
    {
      method: "PUT",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify({}),
    }
  );

  return parseResponse(response);
}

export async function markAllNotificationsAsRead(): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
    method: "PUT",
    headers: getJsonAuthHeaders(),
    body: JSON.stringify({}),
  });

  return parseResponse(response);
}

export async function getAdminNotifications(): Promise<NotificationListResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/notifications`, {
    method: "GET",
    headers: getJsonAuthHeaders(),
  });

  return parseResponse<NotificationListResponse>(response);
}

export async function sendAdminNotification(
  payload: SendAdminNotificationPayload
): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}/admin/notifications/send`, {
    method: "POST",
    headers: getJsonAuthHeaders(),
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}