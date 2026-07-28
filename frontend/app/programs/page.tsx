"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/app/lib/api";

const CATEGORIES = ["문화예술", "콘텐츠", "공예", "소셜임팩트", "기술/IT", "기타"];
const STAGES = ["아이디어", "예비창업", "초기창업"];

interface Program {
  id: number;
  name: string;
  organization: string;
  support_type: string;
  support_amount: string;
  eligibility: string;
  target_stage: string;
  region: string;
  deadline: string;
  apply_url: string;
  match_reason: string;
}

export default function ProgramsPage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ item_keyword: "", category: "", startup_stage: "", region: "" });
  const [results, setResults] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      setForm({
        item_keyword: parsed.item_keyword || "",
        category: parsed.category || "",
        startup_stage: parsed.startup_stage || "",
        region: parsed.region || "",
      });
    }
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(false);
    try {
      const res = await api.programs.recommend(form) as any;
      setResults(res.programs);
      setSearched(true);
    } catch {
      alert("추천 조회 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Ambient blurred color blobs — glass cards need something to refract */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 12% 6%, color-mix(in srgb, var(--color-primary) 20%, transparent) 0%, transparent 42%)," +
            "radial-gradient(circle at 92% 12%, color-mix(in srgb, var(--color-accent) 18%, transparent) 0%, transparent 40%)," +
            "radial-gradient(circle at 22% 96%, color-mix(in srgb, var(--color-secondary) 18%, transparent) 0%, transparent 46%)",
        }}
      />

      <div className="relative z-10">
        <header className="glass border-b border-border px-6 py-4" style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="font-bold text-text">AI 창업 로드맵 코치</Link>
            <Link href="/dashboard" className="text-sm text-muted hover:text-text">← 대시보드</Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-text mb-2">창업지원사업 추천</h1>
          <p className="text-muted mb-8">아이템 정보를 입력하면 맞춤 지원사업을 추천해드립니다</p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="glass rounded-lg border border-border p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-muted mb-1">창업 아이템</label>
                <input
                  required value={form.item_keyword}
                  onChange={(e) => setForm({ ...form, item_keyword: e.target.value })}
                  className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="예: 공예 작가를 위한 온라인 판매 플랫폼"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">분야</label>
                <select
                  required value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">선택</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">창업 단계</label>
                <select
                  required value={form.startup_stage}
                  onChange={(e) => setForm({ ...form, startup_stage: e.target.value })}
                  className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">선택</option>
                  {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">지역 (선택)</label>
                <input
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  className="w-full border border-border rounded-md px-4 py-2.5 text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="서울 (비워두면 전국)"
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="mt-4 w-full bg-text text-background font-semibold py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "AI가 분석 중..." : "맞춤 지원사업 추천받기"}
            </button>
          </form>

          {/* Results */}
          {searched && (
            <div>
              <p className="text-sm text-muted mb-4">{results.length}개 지원사업이 추천되었습니다</p>
              <div className="flex flex-col gap-4">
                {results.map((p, i) => (
                  <div key={p.id} className="glass rounded-lg border border-border p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <span className="text-xs font-bold text-primary bg-[color-mix(in_srgb,var(--color-primary)_12%,var(--color-surface))] px-2 py-0.5 rounded-full mr-2">
                          #{i + 1}
                        </span>
                        <span className="font-bold text-text text-lg">{p.name}</span>
                      </div>
                      <span className="text-xs text-muted shrink-0">{p.deadline} 마감</span>
                    </div>
                    <p className="text-sm text-muted mb-1">{p.organization}</p>
                    <div className="flex flex-wrap gap-2 my-3">
                      <span className="text-xs bg-[color-mix(in_srgb,var(--color-success)_14%,var(--color-surface))] text-success border border-[color-mix(in_srgb,var(--color-success)_35%,transparent)] px-2 py-1 rounded-full">
                        {p.support_type} {p.support_amount}
                      </span>
                      <span className="text-xs bg-background text-muted border border-border px-2 py-1 rounded-full">
                        {p.region}
                      </span>
                    </div>
                    <div className="bg-[color-mix(in_srgb,var(--color-primary)_12%,var(--color-surface))] rounded-md p-4 mb-4">
                      <p className="text-sm text-primary font-medium mb-1">AI 추천 이유</p>
                      <p className="text-sm text-primary">{p.match_reason}</p>
                    </div>
                    <p className="text-sm text-muted mb-4">{p.eligibility}</p>
                    {p.apply_url && (
                      <a
                        href={p.apply_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
                      >
                        신청하러 가기 →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
