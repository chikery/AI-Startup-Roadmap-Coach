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
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/login/";
      throw new Error("세션이 만료되었습니다. 다시 로그인해 주세요.");
    }
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
    updateProfile: (body: object, token?: string) =>
      request(`/auth/profile?token=${token || getToken()}`, { method: "PATCH", body: JSON.stringify(body) }),
    // 조용한 백그라운드 갱신 전용 — request()를 안 쓴다: 실패(만료된 토큰)해도
    // 여기서 로그인 페이지로 리다이렉트하면 안 되고, 그냥 아무 일도 없었던 것처럼
    // 넘어가야 한다. 실제로 만료된 토큰으로 뭔가 시도할 때만 기존 401 흐름이 뜬다.
    refresh: async (token: string): Promise<{ access_token: string } | null> => {
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh?token=${token}`, { method: "POST" });
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
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
    score: (step: number, content: object) =>
      request("/ai/score", { method: "POST", body: JSON.stringify({ step, content }) }),
    compare: (step: number, before: object, after: object) =>
      request("/ai/compare", { method: "POST", body: JSON.stringify({ step, before, after }) }),
  },
  hub: {
    // 인증 불필요한 공개 조회 — request()의 401 리다이렉트 로직을 타지 않도록 직접 fetch.
    // 실패하면 그냥 throw만 하고, 호출부(dashboard)가 기존 목업으로 폴백한다.
    getItems: async (sourceType: string): Promise<{ items: { title: string; source: string; date: string; url: string; steps: number[] }[] }> => {
      const res = await fetch(`${BASE_URL}/hub/items?source_type=${sourceType}`);
      if (!res.ok) throw new Error("허브 데이터를 불러오지 못했습니다");
      return res.json();
    },
  },
};
