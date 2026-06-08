"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/app/lib/api";
import DraftFormEditor from "./DraftFormEditor";

/* ------------------------------------------------------------------ */
/* Metadata                                                             */
/* ------------------------------------------------------------------ */

interface TaskDef {
  key: string;
  label: string;
}

interface StepDef {
  step: number;
  label: string;
  heading: string;
  tasks: TaskDef[];
}

const STEP_META: StepDef[] = [
  {
    step: 1,
    label: "문제 발견과 솔루션",
    heading: "문제의 뿌리를 찾고\n솔루션을 설계하세요",
    tasks: [
      { key: "target", label: "목표 고객 정의" },
      { key: "problem", label: "핵심 문제 파악" },
      { key: "solution", label: "솔루션 작성" },
    ],
  },
  {
    step: 2,
    label: "고객과 시장 리서치",
    heading: "잠재 고객과\n시장을 파악하세요",
    tasks: [
      { key: "customer_profile", label: "고객 프로파일 작성" },
      { key: "research_platforms", label: "리서치 플랫폼 선정" },
      { key: "ai_research_prompt", label: "시장 리서치 프롬프트 생성" },
    ],
  },
  {
    step: 3,
    label: "고객 인터뷰 설계",
    heading: "가설을 세우고\n인터뷰를 설계하세요",
    tasks: [
      { key: "hypotheses", label: "가설 9개 수립" },
      { key: "interview_questions", label: "인터뷰 질문지 작성" },
      { key: "persona", label: "페르소나 정의" },
    ],
  },
  {
    step: 4,
    label: "MVP 테스트",
    heading: "가설을 검증할 MVP를\n설계하고 실행하세요",
    tasks: [
      { key: "hypothesis", label: "핵심 가설 수립" },
      { key: "recommended_tools", label: "MVP 툴 선택" },
      { key: "test_plan", label: "테스트 계획 수립" },
    ],
  },
  {
    step: 5,
    label: "시장 및 경쟁사 분석",
    heading: "시장 규모와\n경쟁 현황을 분석하세요",
    tasks: [
      { key: "market_size", label: "시장 규모 산정 (TAM·SAM·SOM)" },
      { key: "competitors", label: "경쟁사 분석" },
      { key: "swot", label: "SWOT 분석" },
    ],
  },
  {
    step: 6,
    label: "비즈니스 모델",
    heading: "수익 구조와\n비즈니스 모델을 완성하세요",
    tasks: [
      { key: "customer_segments", label: "고객 세그먼트 정의" },
      { key: "revenue_streams", label: "수익 구조 설계" },
      { key: "key_activities", label: "핵심 활동 정의" },
    ],
  },
  {
    step: 7,
    label: "피치덱 완성",
    heading: "10개 섹션으로\n피치덱을 완성하세요",
    tasks: [
      { key: "sections", label: "피치덱 10개 섹션 작성" },
      { key: "qa_list", label: "예상 Q&A 작성" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function getDday(deadline?: string | null): { label: string; urgent: boolean } {
  if (!deadline) return { label: "", urgent: false };
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return { label: "마감", urgent: false };
  if (days === 0) return { label: "D-Day", urgent: true };
  return { label: `D-${days}`, urgent: days <= 14 };
}

function isTaskDone(key: string, content: Record<string, unknown> | null): boolean {
  if (!content) return false;
  const val = content[key];
  if (val === null || val === undefined) return false;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "object") return Object.keys(val as object).length > 0;
  return String(val).trim().length > 0;
}

function getTaskSuffix(key: string, content: Record<string, unknown> | null): string {
  if (!content) return "";
  const val = content[key];
  if (!val) return "";
  if (key === "recommended_tools" && Array.isArray(val) && val.length > 0) {
    const first = val[0] as { tool?: string };
    return first.tool ? ` — ${first.tool}` : "";
  }
  if (key === "persona" && typeof val === "object" && val !== null) {
    const p = val as { name?: string };
    return p.name ? ` — ${p.name}` : "";
  }
  if (key === "hypothesis" && typeof val === "string") {
    return val.length > 18 ? ` — ${val.slice(0, 18)}…` : ` — ${val}`;
  }
  return "";
}

/* ------------------------------------------------------------------ */
/* Icons (inline SVG to avoid icon-library dependency)                  */
/* ------------------------------------------------------------------ */

function CheckIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-4 h-4 text-[#2D6A4F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function RoadmapStepPage() {
  const { step: stepParam } = useParams();
  const step = parseInt(stepParam as string);
  const router = useRouter();
  const meta = STEP_META[step - 1];

  const [user, setUser] = useState<Record<string, string> | null>(null);
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [programs, setPrograms] = useState<Record<string, unknown>[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const raw = localStorage.getItem("user");
    if (!token) { router.push("/login"); return; }

    const parsedUser: Record<string, string> = raw ? JSON.parse(raw) : {};
    setUser(parsedUser);

    (api.roadmap.getStep(step) as Promise<{ content: Record<string, unknown> | null; is_completed: boolean }>)
      .then((data) => {
        setIsCompleted(data.is_completed);
        if (data.content) {
          setContent(data.content);
        }
      })
      .catch(() => {});

    if (parsedUser.item_keyword) {
      setLoadingPrograms(true);
      (api.programs.recommend({
        item_keyword: parsedUser.item_keyword,
        category: parsedUser.category || "전 분야",
        startup_stage: parsedUser.startup_stage || "예비창업",
        region: parsedUser.region || "전국",
        has_team: parsedUser.has_team || "solo",
      }) as Promise<{ programs: Record<string, unknown>[] }>)
        .then((res) => setPrograms(res.programs || []))
        .catch(() => {})
        .finally(() => setLoadingPrograms(false));
    }
  }, [step, router]);

  async function handleGenerate() {
    if (!user?.item_keyword) return;
    setGenerating(true);
    try {
      const res = await (api.ai.generateDraft(step, user.item_keyword, content ?? undefined) as Promise<{ draft: Record<string, unknown> }>);
      setContent(res.draft);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const saveContent = content;
      if (!saveContent) throw new Error("내용을 먼저 생성해주세요");
      await api.roadmap.saveStep(step, saveContent);
      if (step < 7) router.push(`/roadmap/${step + 1}`);
      else router.push("/dashboard");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  }

  if (!meta) {
    return <div className="p-10 text-center text-gray-400">존재하지 않는 단계입니다</div>;
  }

  const doneTasks = meta.tasks.filter((t) => isTaskDone(t.key, content));
  const hasContent = content !== null;

  const userStage = user?.startup_stage || "예비창업";
  const userRegion = user?.region || "서울";
  const userTeam = user?.has_team === "team" ? "팀창업" : "1인팀";

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      {/* ── Top Nav ── */}
      <header className="border-b border-stone-200/70 px-6 py-4 bg-[#F5F0E8]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="font-bold text-gray-800 text-sm">AI 창업 로드맵 코치</span>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            ← 대시보드
          </Link>
        </div>
      </header>

      {/* ── Progress Bar ── */}
      <div className="max-w-6xl mx-auto px-6 pt-5 pb-4">
        <p className="text-sm font-semibold text-gray-600 mb-2.5">
          창업 로드맵 &middot;{" "}
          <span className="text-[#2D6A4F]">STEP {step} / 7</span>
        </p>
        <div className="flex gap-1.5">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className={`h-[5px] flex-1 rounded-full transition-colors ${
                i + 1 <= step ? "bg-[#2D6A4F]" : "bg-stone-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <main className="max-w-6xl mx-auto px-6 pb-14">
        <div className="grid grid-cols-5 gap-5 items-start">

          {/* ─── Left Panel ─── */}
          <div className="col-span-2 space-y-3">

            {/* Step Title + Checklist */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
              <p className="text-xs font-bold tracking-wider uppercase text-[#2D6A4F] mb-2">
                STEP {step} · {meta.label}
              </p>
              <h1 className="text-[1.6rem] font-bold text-gray-900 leading-snug whitespace-pre-line mb-5">
                {meta.heading}
              </h1>

              {/* Checklist */}
              <div className="space-y-2 mb-5">
                {meta.tasks.map((task, idx) => {
                  const done = isTaskDone(task.key, content);
                  const isActive = !done && idx === doneTasks.length;
                  const suffix = getTaskSuffix(task.key, content);
                  return (
                    <div
                      key={task.key}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                        done
                          ? "bg-[#E8F5EE] text-[#2D6A4F]"
                          : isActive
                          ? "bg-white border border-stone-200 text-gray-500"
                          : "bg-stone-50 text-stone-400"
                      }`}
                    >
                      {done ? (
                        <CheckIcon />
                      ) : isActive ? (
                        <PencilIcon />
                      ) : (
                        <div className="w-4 h-4 flex-shrink-0 rounded-full border-2 border-stone-300" />
                      )}
                      <span>
                        {task.label}
                        {done && suffix && <span className="font-semibold">{suffix}</span>}
                        {isActive && !hasContent && <span className="text-stone-400"> 입력 중...</span>}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* AI Generate */}
              <button
                onClick={handleGenerate}
                disabled={generating || !user?.item_keyword}
                className="w-full py-3 bg-[#2D6A4F] text-white font-semibold rounded-xl hover:bg-[#245A42] transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
              >
                {generating ? <><SpinnerIcon /> AI 초안 생성 중...</> : "✨ AI 초안 자동 생성"}
              </button>

              {!user?.item_keyword && (
                <p className="text-xs text-amber-600 mt-2 text-center">
                  프로필에서 아이템 키워드를 먼저 설정해주세요
                </p>
              )}

            </div>

            {/* Draft Form Editor */}
            {hasContent && (
              <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  생성된 초안 내용
                </p>
                <DraftFormEditor
                  step={step}
                  content={content}
                  onChange={(updated) => setContent(updated)}
                />
              </div>
            )}

            {/* User Item Status */}
            <div className="bg-white rounded-2xl px-5 py-4 border border-stone-200 shadow-sm">
              <p className="text-xs text-stone-400 mb-1">내 아이템 현황</p>
              <p className="font-bold text-gray-900 text-[0.95rem] leading-tight">
                {user?.item_keyword || "아이템 미설정"}
              </p>
              <p className="text-xs text-stone-500 mt-0.5">
                {userStage} · {userRegion} · {userTeam}
              </p>
            </div>

            {/* Save / Next Button */}
            {hasContent && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-[#2D6A4F] text-white font-bold rounded-2xl hover:bg-[#245A42] transition-colors disabled:opacity-50 text-[0.95rem] shadow-sm"
              >
                {saving
                  ? "저장 중..."
                  : isCompleted
                  ? step < 7 ? "다음 단계로 →" : "사업계획서 보기"
                  : step < 7 ? "저장하고 다음 단계 →" : "완성! 사업계획서 보기"}
              </button>
            )}

            {step > 1 && (
              <Link
                href={`/roadmap/${step - 1}`}
                className="block w-full py-3 text-center border border-stone-200 text-stone-500 font-medium rounded-2xl hover:border-stone-300 transition-colors text-sm"
              >
                ← 이전 단계
              </Link>
            )}
          </div>

          {/* ─── Right Panel ─── */}
          <div className="col-span-3 space-y-3">
            <div className="flex items-center gap-2 px-1 py-1">
              <StarIcon />
              <span className="font-semibold text-gray-800 text-sm">지금 이 단계에서 신청 가능</span>
            </div>

            {loadingPrograms ? (
              <>
                {[0, 1].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm animate-pulse">
                    <div className="flex justify-between mb-2">
                      <div className="h-4 bg-stone-200 rounded w-40" />
                      <div className="h-4 bg-stone-200 rounded w-12" />
                    </div>
                    <div className="h-3 bg-stone-100 rounded w-56 mb-4" />
                    <div className="h-14 bg-stone-100 rounded-xl mb-3" />
                    <div className="h-9 bg-stone-100 rounded-xl" />
                  </div>
                ))}
              </>
            ) : programs.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 border border-stone-200 shadow-sm text-center">
                <p className="text-stone-400 text-sm">
                  {user?.item_keyword
                    ? "현재 추천할 지원사업이 없습니다"
                    : "프로필에 아이템 키워드를 입력하면 지원사업을 추천해드립니다"}
                </p>
              </div>
            ) : (
              (programs as Array<{
                id: number;
                name: string;
                organization?: string;
                support_amount?: string;
                deadline?: string;
                match_reason?: string;
                apply_url?: string;
              }>).slice(0, 4).map((program, idx) => {
                const dday = getDday(program.deadline);
                const isHighlighted = idx === 0;
                return (
                  <div
                    key={program.id}
                    className={`bg-white rounded-2xl p-5 shadow-sm transition-all border ${
                      isHighlighted ? "border-[#2D6A4F] border-2" : "border-stone-200"
                    }`}
                  >
                    {/* Program Header */}
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-900 text-[0.95rem] leading-tight">
                        {program.name}
                      </h3>
                      {dday.label && (
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg ml-3 flex-shrink-0 ${
                            dday.label === "마감"
                              ? "bg-stone-100 text-stone-500"
                              : dday.urgent
                              ? "bg-red-100 text-red-600"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {dday.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mb-3">
                      {program.organization}
                      {program.support_amount && ` · ${program.support_amount}`}
                    </p>

                    {/* Match Reason */}
                    {program.match_reason && (
                      <div
                        className={`rounded-xl p-3.5 mb-3 ${
                          isHighlighted ? "bg-[#E8F5EE]" : "bg-stone-50"
                        }`}
                      >
                        <p
                          className={`text-xs font-semibold mb-1 ${
                            isHighlighted ? "text-[#2D6A4F]" : "text-amber-700"
                          }`}
                        >
                          왜 지금 추천하나요?
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {program.match_reason}
                        </p>
                      </div>
                    )}

                    {/* Apply Button */}
                    <a
                      href={program.apply_url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-gray-700 hover:border-stone-400 hover:text-gray-900 transition-colors"
                    >
                      신청 조건 확인 ↗
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
