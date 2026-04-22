const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function apiFetch(endpoint: string, options?: RequestInit) {
    return fetch(`${BASE_URL}${endpoint}`, options);
}