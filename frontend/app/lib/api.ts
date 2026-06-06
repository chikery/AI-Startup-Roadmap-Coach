const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "오류가 발생했습니다" }));
    throw new Error(err.detail || "오류가 발생했습니다");
  }
  return res.json();
}

export const api = {
  auth: {
    register: (email: string, password: string, name: string) =>
      request("/auth/register", { method: "POST", body: JSON.stringify({ email, password, name }) }),
    login: (email: string, password: string) =>
      request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  },
  programs: {
    recommend: (body: object) =>
      request("/programs/recommend", { method: "POST", body: JSON.stringify(body) }),
  },
  roadmap: {
    getProgress: () =>
      request(`/roadmap/progress?token=${getToken()}`),
    getStep: (step: number) =>
      request(`/roadmap/${step}?token=${getToken()}`),
    saveStep: (step: number, content: object) =>
      request(`/roadmap/${step}/save?token=${getToken()}`, { method: "POST", body: JSON.stringify({ content }) }),
  },
  ai: {
    generateDraft: (step: number, item_keyword: string, context?: object) =>
      request("/ai/generate", { method: "POST", body: JSON.stringify({ step, item_keyword, context }) }),
  },
};
