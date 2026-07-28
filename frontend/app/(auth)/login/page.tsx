"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.auth.login(form.email, form.password) as any;
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("user", JSON.stringify(res.user));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient blurred color blobs — glass card needs something to refract */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 15% 15%, color-mix(in srgb, var(--color-primary) 18%, transparent) 0%, transparent 45%)," +
            "radial-gradient(circle at 88% 80%, color-mix(in srgb, var(--color-accent) 16%, transparent) 0%, transparent 45%)," +
            "radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--color-secondary) 14%, transparent) 0%, transparent 50%)",
        }}
      />

      <div className="glass relative z-10 rounded-lg p-10 w-full max-w-md">
        <h1 className="text-2xl font-bold text-text mb-2">로그인</h1>
        <p className="text-muted text-sm mb-8">AI 창업 로드맵 코치에 오신 것을 환영합니다</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">이메일</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="hello@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">비밀번호</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-text text-background font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
