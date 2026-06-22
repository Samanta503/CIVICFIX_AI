export type StoredAuthUser = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string | null;
  role?: {
    id?: number;
    name?: string;
    slug?: string;
  } | null;
};

export const AUTH_CHANGED_EVENT = "civicfix-auth-changed";

const TOKEN_KEYS = [
  "civicfix_auth_token",
  "civicfix_token",
  "auth_token",
  "authToken",
  "token",
];

const USER_KEYS = [
  "civicfix_auth_user",
  "civicfix_user",
  "auth_user",
  "user",
];

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  for (const key of TOKEN_KEYS) {
    const value = window.localStorage.getItem(key);
    if (value) return value;
  }

  return null;
}

export function getAuthUser(): StoredAuthUser | null {
  if (typeof window === "undefined") return null;

  for (const key of USER_KEYS) {
    const value = window.localStorage.getItem(key);

    if (value) {
      try {
        return JSON.parse(value) as StoredAuthUser;
      } catch {
        return null;
      }
    }
  }

  return null;
}

export function setAuthData(token: string, user: StoredAuthUser) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem("civicfix_auth_token", token);
  window.localStorage.setItem("auth_token", token);
  window.localStorage.setItem("token", token);

  window.localStorage.setItem("civicfix_auth_user", JSON.stringify(user));
  window.localStorage.setItem("auth_user", JSON.stringify(user));
  window.localStorage.setItem("user", JSON.stringify(user));

  notifyAuthChanged();
}

export function saveAuthData(token: string, user: StoredAuthUser) {
  setAuthData(token, user);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem("civicfix_auth_token", token);
  window.localStorage.setItem("auth_token", token);
  window.localStorage.setItem("token", token);

  notifyAuthChanged();
}

export function setAuthUser(user: StoredAuthUser) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem("civicfix_auth_user", JSON.stringify(user));
  window.localStorage.setItem("auth_user", JSON.stringify(user));
  window.localStorage.setItem("user", JSON.stringify(user));

  notifyAuthChanged();
}

export function clearAuthData() {
  if (typeof window === "undefined") return;

  TOKEN_KEYS.forEach((key) => window.localStorage.removeItem(key));
  USER_KEYS.forEach((key) => window.localStorage.removeItem(key));

  notifyAuthChanged();
}

export function logoutUser() {
  clearAuthData();
}