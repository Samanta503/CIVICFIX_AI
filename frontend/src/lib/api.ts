const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api";

type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    token?: string;
    headers?: Record<string, string>;
};

export async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { method = "GET", body, token, headers = {} } = options;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.message || "Something went wrong");
    }

    return data as T;
}