"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import { useToast } from "@/app/components/ui/Toast";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import Accordion from "@/app/components/ui/Accordion";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import ThemeSwitcher from "@/app/components/ui/ThemeSwitcher";
import BottomNav from "@/app/components/ui/BottomNav";
import Drawer from "@/app/components/ui/Drawer";
import PoweredBySolar from "@/app/components/ui/PoweredBySolar";
import NotificationList from "@/app/components/ui/NotificationList";
import { NOTIFICATIONS } from "@/app/lib/notifications-data";
import { SUPPORT_PROGRAMS, SupportProgram, isExpired, matchesRegion } from "@/app/lib/support-programs";

const CATEGORIES = ["문화예술", "콘텐츠", "공예", "소셜임팩트", "기술/IT", "기타"];
const STAGES = ["아이디어", "예비창업", "초기창업"];
// 로드맵 7단계 이름 그대로 — SUPPORT_PROGRAMS의 steps: number[]와 직접 매칭된다.
const STEP_NAMES = ["아이디어 스파크", "예술적 비전", "시장 적합성", "재무 지도", "투자 유치", "팀 빌딩", "런칭 데이"];

interface Program extends SupportProgram {
  score: number;
  match_reason: string;
}

function daysUntil(dateStr: string): number | null {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
}

// 예전엔 백엔드 LangChain+FAISS RAG(OpenAI 임베딩)로 추천했는데, Render 배포 환경에서
// FAISS 인덱스가 컨테이너 재배포마다 사라져 매 요청마다 재빌드를 시도하다 500을
// 던지고 있었다 — 게다가 그 RAG가 참조하던 sample_programs.json은 지금 실제로
// 유지·검증하고 있는 SUPPORT_PROGRAMS(19곳 확인 후 27개로 확장)와 아예 다른,
// 오래된 샘플 데이터였다. AI 매칭 대신 이미 검증해둔 SUPPORT_PROGRAMS를
// STEP(정확 일치, steps 배열 포함 여부)·관심분야(정확 일치)·지역(느슨한 부분일치)
// 기준으로 직접 필터링한다 — 네트워크 호출이 없어 즉시 응답하고, 결과가 전부 실제
// 존재하고 검증된 공고다. 조건에 안 맞는 공고도 계속 목록에 남겨두고(결과 0건
// 금지) 점수로만 정렬 — 카드 쪽에서 매칭된 것만 테두리로 강조한다.
function recommendFromSupportPrograms(form: { category: string; region: string; step: string }): Program[] {
  const stepNum = form.step ? Number(form.step) : null;
  return SUPPORT_PROGRAMS
    .filter((p) => !isExpired(p.deadline))
    .map((p) => {
      const categoryMatch = !!form.category && p.category === form.category;
      const regionMatch = !!form.region.trim() && p.region !== "전국" && matchesRegion(p.region, form.region);
      const stepMatch = stepNum !== null && p.steps.includes(stepNum);
      const reasons: string[] = [];
      if (stepMatch) reasons.push(`STEP ${stepNum}(${STEP_NAMES[stepNum - 1]})와 관련 있어요`);
      if (categoryMatch) reasons.push(`관심분야(${form.category})와 일치해요`);
      if (regionMatch) reasons.push(`${form.region} 지역 조건과 맞아요`);
      const score = (categoryMatch ? 1 : 0) + (regionMatch ? 1 : 0) + (stepMatch ? 1 : 0);
      return { ...p, score, match_reason: reasons.join(" · ") };
    })
    .sort((a, b) => b.score - a.score || (new Date(a.deadline).getTime() - new Date(b.deadline).getTime()));
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  const left = daysUntil(deadline);
  if (left === null) return <Badge variant="default">{deadline}</Badge>;
  if (left < 0) return <Badge variant="default">마감</Badge>;
  return <Badge variant={left <= 7 ? "error" : left <= 14 ? "warning" : "default"}>D-{left} · {deadline}</Badge>;
}

export default function ProgramsPage() {
  const toast = useToast();
  const [form, setForm] = useState({ item_keyword: "", category: "", startup_stage: "", region: "", step: "" });
  const [results, setResults] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  const runSearch = useCallback(async (body: typeof form) => {
    setLoading(true);
    setSearched(false);
    try {
      setResults(recommendFromSupportPrograms(body));
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
      step: "",
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

  const matchedCount = results.filter((p) => p.score > 0).length;
  const hasCriteria = !!(form.category || form.region.trim() || form.step);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
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
        {/* HEADER — desktop unchanged; mobile trimmed to logo + a single "더보기" drawer trigger
            (theme only — 대시보드 이동은 이제 BottomNav가 담당) */}
        <header className="glass border-b border-border px-6 py-4" style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/dashboard" className="font-[800] text-text no-underline">StepUp</Link>
            <div className="flex items-center gap-3">
              <PoweredBySolar className="hidden md:inline-flex" />
              <ThemeSwitcher className="hidden md:inline-flex" />
              <Link href="/dashboard" className="hidden text-[13px] text-muted no-underline hover:text-text md:inline">← 대시보드</Link>

              <Drawer
                title="메뉴"
                trigger={(open) => (
                  <button
                    onClick={open}
                    aria-label="메뉴 더보기"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-none bg-transparent text-muted md:hidden"
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="19" cy="12" r="1.8" fill="currentColor"/></svg>
                  </button>
                )}
              >
                <div className="flex flex-col gap-4">
                  <div className="border-b border-border pb-4">
                    <div className="mb-2 text-[13px] font-semibold text-muted">알림</div>
                    <NotificationList items={NOTIFICATIONS} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-muted">테마</span>
                    <ThemeSwitcher />
                  </div>
                  <div className="flex justify-center border-t border-border pt-4">
                    <PoweredBySolar />
                  </div>
                </div>
              </Drawer>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-5 pt-8 pb-24 sm:px-6 sm:py-10">
          {/* Task-driven headline: lead with the eligibility count, not the form */}
          {searched ? (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1.5">
                {hasCriteria ? (
                  <Badge variant={matchedCount > 0 ? "success" : "default"}>조건에 맞는 지원사업 {matchedCount}건</Badge>
                ) : (
                  <Badge variant="default">지금 신청 가능한 지원사업 {results.length}건</Badge>
                )}
              </div>
              <h1 className="text-[22px] sm:text-h3 font-[800] text-text m-0">신청 가능한 지원사업이에요</h1>
              <p className="text-[14px] text-muted mt-1.5">STEP·관심분야·지역 조건에 맞는 공고는 테두리로 표시돼요. 조건을 바꾸고 싶다면 아래 "검색 조건 수정"을 열어보세요.</p>
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
            <div className="text-center py-10 text-[13.5px] text-muted">지원사업을 찾고 있어요...</div>
          )}

          {!loading && searched && (
            <div className="flex flex-col gap-4">
              {results.map((p, i) => {
                const matched = hasCriteria && p.score > 0;
                return (
                  <Card
                    key={p.name}
                    padding="md"
                    className={matched ? "border-2 border-primary" : undefined}
                  >
                    <div className="flex items-start justify-between gap-4 mb-2.5 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="default">#{i + 1}</Badge>
                        <span className="font-[800] text-text text-[16px]">{p.name}</span>
                        {matched && <Badge variant="success">맞춤</Badge>}
                      </div>
                      <DeadlineBadge deadline={p.deadline} />
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="success">{p.maxSupport}</Badge>
                      <Badge variant="default" className="text-muted bg-background border border-border">{p.category}</Badge>
                      <Badge variant="default" className="text-muted bg-background border border-border">{p.region}</Badge>
                    </div>
                    {matched && (
                      <div className="rounded-md p-3.5 mb-3.5" style={{ background: "var(--color-primary-subtle)" }}>
                        <p className="text-[12px] font-[600] text-primary m-0 mb-1">왜 지금 추천되었나요</p>
                        <p className="text-[13.5px] text-primary m-0 leading-relaxed">{p.match_reason}</p>
                      </div>
                    )}
                    <p className="text-[13px] text-muted mb-4 leading-relaxed">{p.description}</p>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="no-underline">
                        <Button variant="primary" size="sm">
                          신청 조건 확인하기 <ChevronRight size={15} />
                        </Button>
                      </a>
                    )}
                  </Card>
                );
              })}
              {results.length === 0 && (
                <div className="text-center py-10 text-[13.5px] text-muted">지금 신청 가능한 지원사업이 없어요.</div>
              )}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </div>
  );
}

function SearchForm({
  form, setForm, onSubmit, loading,
}: {
  form: { item_keyword: string; category: string; startup_stage: string; region: string; step: string };
  setForm: (f: { item_keyword: string; category: string; startup_stage: string; region: string; step: string }) => void;
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
        <Select
          label="로드맵 STEP (선택)"
          value={form.step}
          onChange={(e) => setForm({ ...form, step: e.target.value })}
        >
          <option value="">선택 안 함</option>
          {STEP_NAMES.map((name, idx) => <option key={idx} value={idx + 1}>STEP {idx + 1} · {name}</option>)}
        </Select>
        <Select
          label="분야"
          required
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">선택</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select
          label="창업 단계"
          required
          value={form.startup_stage}
          onChange={(e) => setForm({ ...form, startup_stage: e.target.value })}
        >
          <option value="">선택</option>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Input
          label="지역 (선택)"
          value={form.region}
          onChange={(e) => setForm({ ...form, region: e.target.value })}
          placeholder="서울 (비워두면 전국)"
        />
      </div>
      <Button type="submit" variant="secondary" size="md" disabled={loading} className="mt-4 w-full rounded-full">
        {loading ? "AI가 분석 중..." : "맞춤 지원사업 추천받기"}
      </Button>
    </form>
  );
}
