"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { api } from "@/app/lib/api";
import { useToast } from "@/app/components/ui/Toast";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Accordion from "@/app/components/ui/Accordion";
import { Input } from "@/app/components/ui/Input";
import ThemeSwitcher from "@/app/components/ui/ThemeSwitcher";

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

function daysUntil(dateStr: string): number | null {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  const left = daysUntil(deadline);
  if (left === null) return <Badge variant="default">{deadline}</Badge>;
  if (left < 0) return <Badge variant="default">마감</Badge>;
  return <Badge variant={left <= 7 ? "error" : left <= 14 ? "warning" : "default"}>D-{left} · {deadline}</Badge>;
}

export default function ProgramsPage() {
  const toast = useToast();
  const [form, setForm] = useState({ item_keyword: "", category: "", startup_stage: "", region: "" });
  const [results, setResults] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const runSearch = useCallback(async (body: typeof form) => {
    setLoading(true);
    setSearched(false);
    try {
      const res = (await api.programs.recommend(body)) as { programs: Program[] };
      setResults(res.programs);
      setSearched(true);
    } catch {
      toast.show("추천 조회 중 오류가 발생했습니다", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) return;
    const parsed = JSON.parse(u);
    const next = {
      item_keyword: parsed.item_keyword || "",
      category: parsed.category || "",
      startup_stage: parsed.startup_stage || "",
      region: parsed.region || "",
    };
    setForm(next);
    // Task-driven: if we already know enough about this user, show "지금 자격 되는 사업"
    // immediately instead of making them re-fill and submit a form every visit.
    if (next.item_keyword && next.category && next.startup_stage) {
      setHasProfile(true);
      runSearch(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    await runSearch(form);
  }

  const eligibleCount = results.filter((p) => {
    const left = daysUntil(p.deadline);
    return left === null || left >= 0;
  }).length;

  return (
    <div className="relative min-h-screen bg-background">
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
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="font-[800] text-text no-underline">StepUp</Link>
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <Link href="/dashboard" className="text-[13px] text-muted no-underline hover:text-text">← 대시보드</Link>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-5 py-8 sm:px-6 sm:py-10">
          {/* Task-driven headline: lead with the eligibility count, not the form */}
          {searched ? (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant={eligibleCount > 0 ? "success" : "default"}>지금 자격 {eligibleCount}건</Badge>
              </div>
              <h1 className="text-[22px] sm:text-h3 font-[800] text-text m-0">신청 가능한 지원사업이에요</h1>
              <p className="text-[14px] text-muted mt-1.5">아이템·단계 기준으로 AI가 분석한 결과예요. 조건을 바꾸고 싶다면 아래 "검색 조건 수정"을 열어보세요.</p>
            </div>
          ) : (
            <div className="mb-6">
              <h1 className="text-[22px] sm:text-h3 font-[800] text-text m-0">창업지원사업 추천</h1>
              <p className="text-[14px] text-muted mt-1.5">아이템 정보를 입력하면 지금 자격 되는 지원사업을 찾아드려요.</p>
            </div>
          )}

          {/* Search form: primary CTA for new/incomplete profiles, collapsed accordion for returning users */}
          {hasProfile ? (
            <Card padding="md" className="mb-6">
              <Accordion summary={<span className="flex items-center gap-2"><Search size={15} /> 검색 조건 수정</span>}>
                <SearchForm form={form} setForm={setForm} onSubmit={handleSearch} loading={loading} />
              </Accordion>
            </Card>
          ) : (
            <Card padding="md" className="mb-6">
              <SearchForm form={form} setForm={setForm} onSubmit={handleSearch} loading={loading} />
            </Card>
          )}

          {loading && (
            <div className="text-center py-10 text-[13.5px] text-muted">AI가 지원사업을 분석하고 있어요...</div>
          )}

          {!loading && searched && (
            <div className="flex flex-col gap-4">
              {results.map((p, i) => (
                <Card key={p.id} padding="md">
                  <div className="flex items-start justify-between gap-4 mb-2.5 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="default">#{i + 1}</Badge>
                      <span className="font-[800] text-text text-[16px]">{p.name}</span>
                    </div>
                    <DeadlineBadge deadline={p.deadline} />
                  </div>
                  <p className="text-[13.5px] text-muted mb-2.5">{p.organization}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="success">{p.support_type} {p.support_amount}</Badge>
                    <Badge variant="default" className="text-muted bg-background border border-border">{p.region}</Badge>
                  </div>
                  <div className="rounded-md p-3.5 mb-3.5" style={{ background: "var(--color-primary-subtle)" }}>
                    <p className="text-[12px] font-[600] text-primary m-0 mb-1">왜 지금 추천되었나요</p>
                    <p className="text-[13.5px] text-primary m-0 leading-relaxed">{p.match_reason}</p>
                  </div>
                  <p className="text-[13px] text-muted mb-4 leading-relaxed">{p.eligibility}</p>
                  {p.apply_url && (
                    <a href={p.apply_url} target="_blank" rel="noopener noreferrer" className="no-underline">
                      <Button variant="primary" size="sm">
                        신청 조건 확인하기 <ChevronRight size={15} />
                      </Button>
                    </a>
                  )}
                </Card>
              ))}
              {results.length === 0 && (
                <div className="text-center py-10 text-[13.5px] text-muted">조건에 맞는 지원사업을 찾지 못했어요. 조건을 조정해보세요.</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function SearchForm({
  form, setForm, onSubmit, loading,
}: {
  form: { item_keyword: string; category: string; startup_stage: string; region: string };
  setForm: (f: { item_keyword: string; category: string; startup_stage: string; region: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}) {
  return (
    <form onSubmit={onSubmit}>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="창업 아이템"
            required
            value={form.item_keyword}
            onChange={(e) => setForm({ ...form, item_keyword: e.target.value })}
            placeholder="예: 공예 작가를 위한 온라인 판매 플랫폼"
          />
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-[600] text-text">분야</span>
          <select
            required value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-[14px] text-text outline-none focus:border-primary"
          >
            <option value="">선택</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-[600] text-text">창업 단계</span>
          <select
            required value={form.startup_stage}
            onChange={(e) => setForm({ ...form, startup_stage: e.target.value })}
            className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-[14px] text-text outline-none focus:border-primary"
          >
            <option value="">선택</option>
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <Input
          label="지역 (선택)"
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
          placeholder="서울 (비워두면 전국)"
        />
      </div>
      <Button type="submit" variant="primary" size="md" disabled={loading} className="mt-4 w-full rounded-full">
        {loading ? "AI가 분석 중..." : "맞춤 지원사업 추천받기"}
      </Button>
    </form>
  );
}
