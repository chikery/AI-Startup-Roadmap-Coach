"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/app/lib/api";
import { getProgramsForStep, isExpired, daysLeft } from "@/app/lib/support-programs";

/* ------------------------------------------------------------------ */
/* Step Metadata                                                         */
/* ------------------------------------------------------------------ */

interface FrameworkRow {
  key: string;
  label: string;
  placeholder: string;
}

interface StepMeta {
  step: number;
  name: string;
  heading: string;
  description: string;
  whyText: string[];
  tags: string[];
  coachQuote: string;
  frameworkTitle: string;
  frameworkDesc: string;
  rows: FrameworkRow[];
  feedbackQuote: string;
}

const STEP_META: StepMeta[] = [
  {
    step: 1,
    name: "아이디어 스파크",
    heading: "1단계: 문제 발견과 솔루션",
    description: "당신의 아이디어를 구체적인 비즈니스 기회로 정의합니다.",
    whyText: [
      "위대한 창업은 단순히 '멋진 해결책'을 떠올리는 것이 아니라 '해결할 가치가 있는 명확한 문제'를 발견하는 것에서 시작됩니다. 스타트업 실패 원인의 90% 이상은 시장이 원하지 않는 제품을 만들기 때문입니다.",
      "이 단계에서는 주관적인 '의견'을 객관적인 '데이터'와 철저히 구분합니다. 해결하려는 문제가 정말 존재하는지, 그것이 누구의 고통인지 명확히 정의해 사업의 뿌리를 단단히 내립니다.",
    ],
    tags: ["대상 고객 정의", "핵심 고통 (Pain Point)"],
    coachQuote: "당신의 가설을 숫자로 의심하라. '고객이 분명 있을 것이다'라는 착각 대신 '고객은 왜 돈을 주고 이 일을 해결하려 하는가?'에 집중하세요.",
    frameworkTitle: "TPCS 프레임워크",
    frameworkDesc: "입력된 키워드를 기반으로 TPCS 프레임워크 구조를 제안합니다.",
    rows: [
      { key: "target", label: "Target (고객)", placeholder: "이 문제를 겪는 구체적인 페르소나를 입력하세요" },
      { key: "problem", label: "Problem (문제)", placeholder: "가장 고통스러운 한 가지 문제를 서술하세요" },
      { key: "cause", label: "Cause (원인)", placeholder: "문제의 근본 원인은 무엇인가요?" },
      { key: "solution", label: "Solution (해결책)", placeholder: "어떻게 혁신적으로 해결하나요?" },
    ],
    feedbackQuote: "Target과 Problem의 연결이 명확하네요. Solution에 전환 목표를 수치로 더하면 훨씬 설득력 있어요.",
  },
  {
    step: 2,
    name: "예술적 비전",
    heading: "2단계: 독창성과 차별화 정립",
    description: "당신만의 예술적 강점을 시장의 언어로 번역합니다.",
    whyText: [
      "기술과 자본은 모방할 수 있어도, 예술가 고유의 관점과 미감은 복제하기 어렵습니다. 이 단계는 당신의 독창성을 '왜 당신이어야 하는가'라는 설득력으로 바꾸는 과정입니다.",
      "막연한 '느낌'을 심사위원과 고객이 이해하는 명확한 차별점으로 정의합니다. 예술성과 사업성이 만나는 접점을 찾습니다.",
    ],
    tags: ["핵심 차별점", "브랜드 톤앤매너"],
    coachQuote: "'예쁘다'가 아니라 '왜 지금 이것이 필요한가'를 말하세요. 미학적 가치를 고객의 언어로 번역할 때 비로소 시장이 반응합니다.",
    frameworkTitle: "비전 캔버스",
    frameworkDesc: "입력된 키워드를 기반으로 비전 캔버스 구조를 제안합니다.",
    rows: [
      { key: "core_value", label: "핵심 가치 (Core Value)", placeholder: "당신의 작업이 추구하는 단 하나의 가치는?" },
      { key: "originality", label: "독창성 (Originality)", placeholder: "경쟁자가 따라오기 어려운 강점은?" },
      { key: "aesthetic", label: "미학 방향 (Aesthetic)", placeholder: "브랜드 톤앤매너를 한마디로?" },
      { key: "relevance", label: "시장적 의미 (Relevance)", placeholder: "이 비전이 지금 시장에서 갖는 의미는?" },
    ],
    feedbackQuote: "독창성이 잘 드러나요. 미학 방향이 어떤 고객 행동으로 이어지는지 한 줄 덧붙이면 더 좋아요.",
  },
  {
    step: 3,
    name: "시장 적합성",
    heading: "3단계: 시장·고객 검증",
    description: "가설을 데이터로 바꿔 시장의 크기와 진입 지점을 증명합니다.",
    whyText: [
      "투자자와 심사위원이 가장 먼저 묻는 것은 '시장이 얼마나 큰가'입니다. 막연한 '시장이 있다'는 주장 대신, TAM·SAM·SOM 데이터로 근거를 갖춰야 합니다.",
      "경쟁사 분석을 통해 공백 시장을 찾고, 자신의 포지션을 명확히 합니다. 이 단계를 잘 마치면 지원사업 서류의 절반이 완성됩니다.",
    ],
    tags: ["시장 규모 (TAM·SAM·SOM)", "경쟁사 포지셔닝"],
    coachQuote: "숫자 없는 시장 분석은 설득력이 없어요. '약 몇 조 원 시장'도 좋지만, 왜 그 수치를 믿을 수 있는지 근거를 꼭 넣으세요.",
    frameworkTitle: "시장 분석",
    frameworkDesc: "입력된 키워드를 기반으로 시장 분석 구조를 제안합니다.",
    rows: [
      { key: "tam", label: "TAM (전체 시장)", placeholder: "전체 잠재 시장 규모와 근거를 입력하세요" },
      { key: "sam", label: "SAM (유효 시장)", placeholder: "실제 타겟 가능한 시장 범위는?" },
      { key: "som", label: "SOM (점유 목표)", placeholder: "3년 내 현실적으로 점유 가능한 비율은?" },
      { key: "competitive_edge", label: "경쟁 우위", placeholder: "경쟁사 대비 핵심 차별점은 무엇인가요?" },
    ],
    feedbackQuote: "TAM 수치가 구체적이에요. SOM을 달성하기 위한 GTM 전략을 다음 단계에서 연결해 보세요.",
  },
  {
    step: 4,
    name: "재무 지도",
    heading: "4단계: 비즈니스 모델과 수익 구조",
    description: "어떻게 돈을 벌고 언제 흑자로 전환하는지 설계합니다.",
    whyText: [
      "아무리 좋은 아이디어도 수익 구조가 없으면 사업이 아닙니다. 이 단계에서는 어떤 방식으로 수익을 만들고, 비용 구조를 어떻게 설계할지 명확히 합니다.",
      "단위 경제학(Unit Economics)을 통해 한 명의 고객으로부터 얼마를 벌 수 있는지, 그리고 그게 지속 가능한지 검증합니다.",
    ],
    tags: ["수익 모델", "단위 경제학 (LTV/CAC)"],
    coachQuote: "'구독형'이든 '거래수수료형'이든 명확해야 해요. 수익 모델이 흐릿하면 심사위원의 신뢰를 잃습니다. 한 가지를 깊게 파세요.",
    frameworkTitle: "수익 모델",
    frameworkDesc: "입력된 키워드를 기반으로 수익 모델 구조를 제안합니다.",
    rows: [
      { key: "revenue", label: "수익원 (Revenue Stream)", placeholder: "주요 수익은 어디서 어떻게 발생하나요?" },
      { key: "pricing", label: "가격 전략 (Pricing)", placeholder: "가격은 얼마이며 그 근거는 무엇인가요?" },
      { key: "cost", label: "비용 구조 (Cost Structure)", placeholder: "주요 비용 항목과 규모를 입력하세요" },
      { key: "unit_economics", label: "단위 경제 (Unit Economics)", placeholder: "LTV, CAC, 마진 등 핵심 지표를 입력하세요" },
    ],
    feedbackQuote: "수익 구조가 명확해졌어요. 단위 경제의 손익분기점 도달 시점을 숫자로 표현하면 투자자 설득력이 높아집니다.",
  },
  {
    step: 5,
    name: "투자 유치",
    heading: "5단계: 자금 계획과 지원사업",
    description: "필요한 자금을 정의하고 지금 받을 수 있는 지원을 연결합니다.",
    whyText: [
      "창업 실패의 주원인 중 하나는 자금 고갈입니다. 언제, 얼마가 필요한지 미리 계획해야 위기에 대응할 수 있습니다.",
      "정부 지원사업은 무상에 가까운 자금이지만 경쟁이 치열합니다. 이 단계에서 당신의 아이템에 맞는 지원사업을 정확히 파악하고 전략적으로 신청 준비를 합니다.",
    ],
    tags: ["자금 조달 계획", "정부지원사업 매칭"],
    coachQuote: "지원사업 신청서는 이 로드맵의 각 단계가 그대로 답변이 됩니다. 지금까지 작성한 내용을 잘 정리해 두세요.",
    frameworkTitle: "자금 계획",
    frameworkDesc: "입력된 키워드를 기반으로 자금 계획 구조를 제안합니다.",
    rows: [
      { key: "funding_need", label: "소요 자금", placeholder: "총 소요 자금과 항목별 내역을 입력하세요" },
      { key: "funding_strategy", label: "조달 전략", placeholder: "자금을 어떻게 조달할 계획인가요?" },
      { key: "milestone", label: "마일스톤", placeholder: "자금 소진 전까지 달성할 핵심 지표는?" },
      { key: "matched_grants", label: "추천 지원사업", placeholder: "신청 예정인 지원사업명과 일정을 입력하세요" },
    ],
    feedbackQuote: "조달 전략이 다각화되어 있어요. 지원사업 신청 일정과 마일스톤이 잘 연결되면 더욱 설득력 있는 계획서가 됩니다.",
  },
  {
    step: 6,
    name: "팀 빌딩",
    heading: "6단계: 팀 구성과 실행 체계",
    description: "비전을 실행할 사람과 역할, 일하는 방식을 설계합니다.",
    whyText: [
      "투자자들은 종종 '아이디어보다 팀을 보고 투자한다'고 말합니다. 탁월한 실행은 명확한 역할 분담과 보완적인 팀 구성에서 나옵니다.",
      "지금 혼자라도 괜찮습니다. 어떤 역할이 필요하고 어떻게 충원할지 계획만 있어도 심사위원에게 신뢰를 줄 수 있습니다.",
    ],
    tags: ["핵심 역할 정의", "팀 보완 계획"],
    coachQuote: "팀을 보여주세요. '나 혼자'도 좋지만 '내가 무엇을 잘하고 무엇을 채워야 하는지' 아는 창업자가 훨씬 강합니다.",
    frameworkTitle: "팀 설계",
    frameworkDesc: "입력된 키워드를 기반으로 팀 설계 구조를 제안합니다.",
    rows: [
      { key: "roles", label: "핵심 역할", placeholder: "사업에 필요한 핵심 역할과 담당자를 입력하세요" },
      { key: "current_team", label: "현재 팀", placeholder: "현재 팀원과 각자의 역량을 설명하세요" },
      { key: "gaps", label: "보완 영역", placeholder: "어떤 역할을 추가로 채워야 하나요?" },
      { key: "collaboration", label: "협업 방식", placeholder: "어떻게 일하고 의사결정을 내리나요?" },
    ],
    feedbackQuote: "역할 분담이 명확해요. 보완 영역에 구체적인 채용 시점과 방법을 추가하면 실행 가능성이 높아 보입니다.",
  },
  {
    step: 7,
    name: "런칭 데이",
    heading: "7단계: 피치덱과 런칭 준비",
    description: "6단계의 결과를 하나의 발표자료와 출시 계획으로 통합합니다.",
    whyText: [
      "이제 모든 재료가 갖춰졌습니다. 이 단계에서는 앞선 6단계의 내용을 투자자·심사위원이 보고 싶어 하는 스토리로 재구성합니다.",
      "피치덱은 단순한 요약이 아닙니다. 문제→솔루션→시장→팀→계획의 흐름이 설득력 있게 연결되어야 합니다. AI가 초안을 드리니 다듬기만 하세요.",
    ],
    tags: ["피치덱 10슬라이드", "런칭 GTM 전략"],
    coachQuote: "마지막입니다. 심사위원 앞에서 3분 안에 설명할 수 있어야 합니다. 복잡한 내용을 단순하게 만드는 것이 진짜 실력입니다.",
    frameworkTitle: "런칭 준비",
    frameworkDesc: "6단계의 내용을 기반으로 피치덱과 런칭 계획을 자동 구성합니다.",
    rows: [
      { key: "pitch_deck", label: "피치덱 핵심 슬라이드", placeholder: "10개 슬라이드의 핵심 메시지를 정리하세요" },
      { key: "qa", label: "예상 Q&A", placeholder: "심사위원이 물을 예상 질문과 답변을 입력하세요" },
      { key: "gtm", label: "출시 계획 (GTM)", placeholder: "어떤 채널로 첫 고객을 획득할 계획인가요?" },
      { key: "kpi", label: "핵심 지표 (KPI)", placeholder: "3개월·6개월·1년 목표 지표를 설정하세요" },
    ],
    feedbackQuote: "완성도가 높아요! Q&A에 재무 지표 관련 질문을 추가하고, KPI를 더 구체적인 숫자로 채우면 완벽한 피치덱이 됩니다.",
  },
];

/* ------------------------------------------------------------------ */
/* Sidebar Icons                                                         */
/* ------------------------------------------------------------------ */

function StepIcon({ step, color = "currentColor" }: { step: number; color?: string }) {
  const props = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none" };
  if (step === 1) return <svg {...props}><path d="M12 4l1.6 4L18 9.5l-4 1.6L12 15l-1.6-4L6 9.5l4-1.6L12 4z" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/></svg>;
  if (step === 2) return <svg {...props}><circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.7"/><circle cx="8.5" cy="9.5" r="1" fill={color}/><circle cx="12" cy="8" r="1" fill={color}/><circle cx="15.5" cy="9.5" r="1" fill={color}/></svg>;
  if (step === 3) return <svg {...props}><circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.7"/><path d="M21 21l-4-4" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></svg>;
  if (step === 4) return <svg {...props}><rect x="2" y="6" width="20" height="13" rx="2.5" stroke={color} strokeWidth="1.7"/><circle cx="12" cy="12.5" r="2.5" stroke={color} strokeWidth="1.7"/></svg>;
  if (step === 5) return <svg {...props}><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/><path d="M8 12l2.5 2.5L16 9" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (step === 6) return <svg {...props}><circle cx="9" cy="8" r="3" stroke={color} strokeWidth="1.7"/><circle cx="17" cy="9" r="2.3" stroke={color} strokeWidth="1.7"/><path d="M3 19c0-3 2.7-5 6-5s6 2 6 5M15.5 19c0-2 1-3.4 3-3.7" stroke={color} strokeWidth="1.7" strokeLinecap="round"/></svg>;
  return <svg {...props}><path d="M5 19c-1.5 1.5-2 4-2 4s2.5-.5 4-2M14.5 4.5C17 2 21 2 21 2s0 4-2.5 6.5L12 15l-3-3 5.5-7.5z" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function formatValue(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) {
    return raw.map((item) =>
      typeof item === "string" ? `- ${item}` : formatValue(item)
    ).join("\n");
  }
  if (typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>)
      .map(([k, v]) => {
        if (typeof v === "string") return `■ ${k}\n- ${v}`;
        if (Array.isArray(v)) return `■ ${k}\n${v.map((i) => `- ${typeof i === "string" ? i : JSON.stringify(i)}`).join("\n")}`;
        if (typeof v === "object" && v !== null) {
          const sub = Object.entries(v as Record<string, unknown>)
            .map(([sk, sv]) => `- ${sk}: ${sv}`)
            .join("\n");
          return `■ ${k}\n${sub}`;
        }
        return `■ ${k}\n- ${v}`;
      })
      .join("\n\n");
  }
  return String(raw);
}

/* ------------------------------------------------------------------ */
/* Page Component                                                        */
/* ------------------------------------------------------------------ */

export default function RoadmapStepPage() {
  const { step: stepParam } = useParams();
  const step = parseInt(stepParam as string);
  const router = useRouter();
  const meta = STEP_META[step - 1];

  const [user, setUser] = useState<Record<string, string> | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState<{ step: number; is_completed: boolean }[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftGenerated, setDraftGenerated] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [methodologyRef, setMethodologyRef] = useState<string | null>(null);
  const [fetchingFeedback, setFetchingFeedback] = useState(false);
  const [score, setScore] = useState<{
    score: number; grade: string; strengths: string[];
    missing_items: string[]; improvement_hint: string; methodology_ref: string;
  } | null>(null);
  const [fetchingScore, setFetchingScore] = useState(false);
  const [compareResult, setCompareResult] = useState<{
    improvements: string[]; remaining_issues: string[];
    overall_progress: string; progress_delta: number;
  } | null>(null);
  const [prevContent, setPrevContent] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const raw = localStorage.getItem("user");
    const parsedUser: Record<string, string> = raw ? JSON.parse(raw) : {};
    setUser(parsedUser);
    setIsLoggedIn(!!token);

    if (token) {
      (api.roadmap.getStep(step) as Promise<{ content: Record<string, unknown> | null; is_completed: boolean }>)
        .then((data) => {
          setIsCompleted(data.is_completed);
          if (data.content) {
            setContent(data.content);
            setDraftGenerated(true);
            fetchFeedback(step, data.content);
            fetchScore(step, data.content);
          }
        })
        .catch(() => {});

      (api.roadmap.getProgress() as Promise<{ step: number; is_completed: boolean }[]>)
        .then((data) => setProgress(data))
        .catch(() => {});
    }
  }, [step]);

  async function fetchFeedback(stepNum: number, stepContent: Record<string, unknown>) {
    setFetchingFeedback(true);
    setFeedback(null);
    setMethodologyRef(null);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${BASE_URL}/ai/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: stepNum, content: stepContent }),
      });
      if (!res.ok) throw new Error("피드백 오류");
      const data = await res.json();
      setFeedback(data.feedback);
      setMethodologyRef(data.methodology_ref || null);
    } catch {
      setFeedback(null);
    } finally {
      setFetchingFeedback(false);
    }
  }

  async function fetchScore(stepNum: number, stepContent: Record<string, unknown>) {
    setFetchingScore(true);
    setScore(null);
    try {
      const result = await (api.ai.score(stepNum, stepContent) as Promise<{
        score: number; grade: string; strengths: string[];
        missing_items: string[]; improvement_hint: string; methodology_ref: string;
      }>);
      setScore(result);
    } catch {
      setScore(null);
    } finally {
      setFetchingScore(false);
    }
  }

  async function handleGenerate() {
    if (!user?.item_keyword) return;
    setGenerating(true);
    const previousContent = content;
    try {
      const res = await (api.ai.generateDraft(step, user.item_keyword, content ?? undefined) as Promise<{ draft: Record<string, unknown> }>);
      setContent(res.draft);
      setDraftGenerated(true);
      setCompareResult(null);
      fetchFeedback(step, res.draft);
      fetchScore(step, res.draft);
      if (previousContent && Object.keys(previousContent).length > 0) {
        setPrevContent(previousContent);
        (api.ai.compare(step, previousContent, res.draft) as Promise<{
          improvements: string[]; remaining_issues: string[];
          overall_progress: string; progress_delta: number;
        }>).then(setCompareResult).catch(() => {});
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(navigate = true) {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    setSaving(true);
    try {
      if (!content) throw new Error("내용을 먼저 생성해주세요");
      await api.roadmap.saveStep(step, content);
      if (navigate) {
        if (step < 7) router.push(`/roadmap/${step + 1}`);
        else router.push("/business-plan");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "저장에 실패했습니다");
    } finally {
      setSaving(false);
    }
  }

  if (!meta) {
    return <div style={{ padding: 40, textAlign: "center", color: "#9198A6" }}>존재하지 않는 단계입니다</div>;
  }

  const completedCount = progress.filter((p) => p.is_completed).length;
  const hasContent = content !== null;
  const hasAnyField = meta.rows.some((r) => {
    const v = content?.[r.key];
    if (v === null || v === undefined) return false;
    if (typeof v === "string") return !!v.trim();
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object") return Object.keys(v).length > 0;
    return !!v;
  });

  const prevLink = step === 1 ? "/dashboard" : `/roadmap/${step - 1}`;
  const saveButtonLabel = saving
    ? "저장 중..."
    : !isLoggedIn
    ? "로그인하고 저장하기 →"
    : step === 7
    ? "완성! 사업계획서 보기"
    : "저장 후 다음 단계";

  return (
    <div style={{ fontFamily: "'Pretendard', sans-serif", background: "#F5F6F8", color: "#1F2436", minHeight: "100vh" }}>

      {/* ── TOP NAV ── */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E8EAEE" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", height: 64, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Link href="/" style={{ fontFamily: "var(--font-bricolage, 'Bricolage Grotesque', sans-serif)", fontWeight: 800, fontSize: 21, color: "#2F3E72", letterSpacing: "-0.01em", textDecoration: "none" }}>StepUp</Link>
            <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#5A5BD6", textDecoration: "none", padding: "5px 12px", borderRadius: 8, background: "#ECECFB", transition: "background 0.15s" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="#5A5BD6"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="#5A5BD6"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="#5A5BD6"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="#5A5BD6"/></svg>
              대시보드
            </Link>
            <span style={{ fontSize: 13, color: "#9198A6", paddingLeft: 18, borderLeft: "1px solid #E8EAEE" }}>{step}단계: {meta.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#ECECFB", color: "#5A5BD6", fontWeight: 700, fontSize: 13, padding: "6px 12px", borderRadius: 100 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 14h3v6H4zM10.5 9h3v11h-3zM17 4h3v16h-3z" fill="#5A5BD6"/></svg>
              {step}/7
            </span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" stroke="#9198A6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.2" stroke="#9198A6" strokeWidth="1.8"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3" stroke="#9198A6" strokeWidth="1.8" strokeLinecap="round"/></svg>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#8E9BD6,#5A5BD6)", display: "inline-block" }}></span>
            {isLoggedIn && (
              <button
                onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("user"); window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/dashboard/"; }}
                style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "#9198A6", background: "none", border: "1px solid #E8EAEE", padding: "5px 12px", borderRadius: 8, cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#E53E3E"; e.currentTarget.style.borderColor = "#E53E3E"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#9198A6"; e.currentTarget.style.borderColor = "#E8EAEE"; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                로그아웃
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── BODY GRID ── */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "26px 28px", display: "grid", gridTemplateColumns: "212px 1fr", gap: 30, alignItems: "start" }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ position: "sticky", top: 26 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#5A5BD6" }}>창업 여정</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "9px 0 8px" }}>
            <span style={{ fontSize: 12.5, color: "#9198A6", fontWeight: 600 }}>진행률</span>
            <span style={{ fontSize: 12.5, color: "#9198A6", fontWeight: 700 }}>{completedCount}/7</span>
          </div>
          <div style={{ height: 7, background: "#EEF0F3", borderRadius: 100, overflow: "hidden", marginBottom: 24 }}>
            <div style={{ width: `${(completedCount / 7) * 100}%`, height: "100%", background: "#15A06B", borderRadius: 100, transition: "width 0.5s" }}></div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {STEP_META.map((s) => {
              const isActive = s.step === step;
              const isDone = progress.find((p) => p.step === s.step)?.is_completed;
              return (
                <Link
                  key={s.step}
                  href={`/roadmap/${s.step}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "10px 11px",
                    borderRadius: 10,
                    fontSize: 13.5,
                    fontWeight: isActive ? 700 : 600,
                    color: isActive ? "#5A5BD6" : "#6B7280",
                    background: isActive ? "#ECECFB" : "transparent",
                    textDecoration: "none",
                  }}
                >
                  {isDone && !isActive ? (
                    <span style={{ width: 17, height: 17, borderRadius: "50%", background: "#D8EFE3", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#15A06B" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                  ) : (
                    <span style={{ flexShrink: 0, color: isActive ? "#5A5BD6" : "#9198A6" }}>
                      <StepIcon step={s.step} color={isActive ? "#5A5BD6" : "#9198A6"} />
                    </span>
                  )}
                  {s.name}
                </Link>
              );
            })}
          </div>

          <div style={{ borderTop: "1px solid #E4E7ED", margin: "22px 0 16px" }}></div>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
            style={{ width: "100%", cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#5A5BD6", color: "#fff", border: "none", padding: 12, borderRadius: 11, fontSize: 14, fontWeight: 700 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" fill="#fff"/></svg>
            AI 인사이트 받기
          </button>

          {/* 지원사업 매칭 */}
          {(() => {
            const programs = getProgramsForStep(step);
            if (!programs.length) return null;
            return (
              <div style={{ marginTop: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="#F59E0B"/></svg>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>이 단계 추천 지원사업</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {programs.slice(0, 4).map((p, i) => {
                    const expired = isExpired(p.deadline);
                    const left = daysLeft(p.deadline);
                    return (
                      <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                        style={{
                          display: "block", padding: "9px 10px", borderRadius: 9,
                          background: expired ? "#F9FAFB" : "#FFFBEB",
                          border: `1px solid ${expired ? "#E8EAEE" : "#FDE68A"}`,
                          textDecoration: "none", opacity: expired ? 0.6 : 1,
                        }}
                      >
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: expired ? "#9198A6" : "#1F2436", lineHeight: 1.4, marginBottom: 4 }}>{p.name}</div>
                        <div style={{ fontSize: 10.5, color: expired ? "#9198A6" : (left <= 7 ? "#DC2626" : "#92400E"), fontWeight: 600 }}>
                          {expired ? "마감" : `D-${left} · ${p.deadline.slice(5).replace("-", "/")}`}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 11px 4px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "#9198A6" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" stroke="#9198A6" strokeWidth="1.7"/><path d="M9.5 9.5a2.5 2.5 0 113.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01" stroke="#9198A6" strokeWidth="1.7" strokeLinecap="round"/></svg>
              도움말
            </span>
            <Link href="/">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="#9198A6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main>

          {/* Step Header */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span style={{ width: 46, height: 46, borderRadius: 13, background: "#ECECFB", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <StepIcon step={step} color="#5A5BD6" />
            </span>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>{meta.heading}</h1>
              <p style={{ fontSize: 14.5, color: "#6B7280", margin: "7px 0 0" }}>{meta.description}</p>
            </div>
          </div>

          {/* Why + Coach two-column */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 250px", gap: 18, marginTop: 24 }}>
            {/* Why card */}
            <div style={{ background: "#fff", border: "1px solid #E8EAEE", borderRadius: 16, padding: "22px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800, color: "#5A5BD6" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" stroke="#5A5BD6" strokeWidth="1.7"/><path d="M12 11v5M12 7.5h.01" stroke="#5A5BD6" strokeWidth="1.8" strokeLinecap="round"/></svg>
                왜 이 단계가 필요한가
              </div>
              {meta.whyText.map((text, i) => (
                <p key={i} style={{ fontSize: 13.8, lineHeight: 1.7, color: "#5A6273", margin: i === 0 ? "13px 0 0" : "12px 0 0" }}>{text}</p>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                {meta.tags.map((tag) => (
                  <span key={tag} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid #E4E7ED", borderRadius: 100, padding: "7px 14px", fontSize: 12.5, fontWeight: 600, color: "#42506B" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#15A06B" strokeWidth="1.8"/><path d="M8 12l3 3 5-6" stroke="#15A06B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Coach card */}
            <div style={{ background: "#2F3E72", borderRadius: 16, padding: 20, color: "#D5DBEC", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 800, color: "#fff" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 3c-1 3-2 4-5 5 3 1 4 2 5 5 1-3 2-4 5-5-3-1-4-2-5-5z" fill="#7DE0AE"/></svg>
                RK · AI 코치 요다
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: "#C2CAE2", marginTop: 13, flex: 1 }}>
                "{meta.coachQuote}"
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.14)", marginTop: 14, paddingTop: 11, fontSize: 11, color: "#8E97B8" }}>
                실시간 분석 · 피드백 활성
              </div>
            </div>
          </div>

          {/* AI Draft Banner */}
          {!draftGenerated ? (
            <div style={{ background: "#ECECFB", border: "1px solid #DCDCF6", borderRadius: 14, padding: "16px 20px", marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: "#5A5BD6", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" fill="#fff"/></svg>
                </span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#2F3E72" }}>AI 초안 생성이 준비되었습니다</div>
                  <div style={{ fontSize: 13, color: "#5C5F8F", marginTop: 3 }}>{meta.frameworkDesc}</div>
                </div>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || !user?.item_keyword}
                style={{ cursor: generating || !user?.item_keyword ? "not-allowed" : "pointer", fontFamily: "inherit", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 8, background: "#5A5BD6", color: "#fff", border: "none", padding: "13px 22px", borderRadius: 11, fontSize: 14, fontWeight: 700, opacity: generating || !user?.item_keyword ? 0.6 : 1 }}
              >
                {generating ? (
                  <span style={{ display: "inline-block", width: 15, height: 15, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}></span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.5 12.5h6L9 22l9-11h-6L13 2z" fill="#fff"/></svg>
                )}
                {generating ? "생성 중..." : "AI 초안 생성 시작"}
              </button>
            </div>
          ) : (
            <div style={{ background: "#E7F5EE", border: "1px solid #CDEBDC", borderRadius: 14, padding: "16px 20px", marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <span style={{ width: 40, height: 40, borderRadius: 11, background: "#15A06B", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#15803D" }}>AI 초안이 생성되었습니다</div>
                  <div style={{ fontSize: 13, color: "#3F7A5A", marginTop: 3 }}>각 항목을 검토하고 다듬은 뒤 저장 후 다음 단계로 진행하세요.</div>
                </div>
              </div>
              <button
                onClick={handleGenerate}
                disabled={generating || !user?.item_keyword}
                style={{ cursor: generating || !user?.item_keyword ? "not-allowed" : "pointer", fontFamily: "inherit", flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 8, background: "#15A06B", color: "#fff", border: "none", padding: "11px 18px", borderRadius: 11, fontSize: 13, fontWeight: 700, opacity: generating || !user?.item_keyword ? 0.6 : 1 }}
              >
                {generating ? "생성 중..." : "다시 생성하기"}
              </button>
            </div>
          )}

          {/* Framework Table */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "28px 2px 14px" }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0 }}>{meta.frameworkTitle}</h2>
            <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#5A5BD6", textDecoration: "none" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" stroke="#5A5BD6" strokeWidth="1.7"/><path d="M9.5 9.5a2.5 2.5 0 113.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01" stroke="#5A5BD6" strokeWidth="1.7" strokeLinecap="round"/></svg>
              프레임워크 가이드 보기
            </a>
          </div>

          <div style={{ background: "#fff", border: "1px solid #E8EAEE", borderRadius: 16, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", background: "#F4F5F8", borderBottom: "1px solid #E8EAEE" }}>
              <div style={{ padding: "13px 22px", fontSize: 12, fontWeight: 700, color: "#9198A6" }}>구분</div>
              <div style={{ padding: "13px 22px", fontSize: 12, fontWeight: 700, color: "#9198A6" }}>상세 내용</div>
            </div>

            {meta.rows.map((row, idx) => {
              const raw = content?.[row.key];
              const val = formatValue(raw);
              const isLast = idx === meta.rows.length - 1;
              return (
                <div key={row.key} style={{ display: "grid", gridTemplateColumns: "210px 1fr", borderBottom: isLast ? "none" : "1px solid #EEF0F3" }}>
                  <div style={{ padding: "20px 22px", display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700, color: "#2F3E72" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 3, background: "#5A5BD6", flexShrink: 0 }}></span>
                    {row.label}
                  </div>
                  <div style={{ padding: "16px 22px", fontSize: 13.5, lineHeight: 1.6 }}>
                    {val && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 700, color: "#5A5BD6", background: "#ECECFB", padding: "3px 8px", borderRadius: 100, marginBottom: 8 }}>
                        ✦ AI 초안
                      </span>
                    )}
                    <textarea
                      value={val}
                      placeholder={row.placeholder}
                      onChange={(e) => setContent((prev) => ({ ...(prev || {}), [row.key]: e.target.value }))}
                      rows={val ? Math.max(2, val.split("\n").length + 1) : 2}
                      style={{
                        display: "block",
                        width: "100%",
                        border: "none",
                        outline: "none",
                        resize: "none",
                        fontFamily: "'Pretendard', sans-serif",
                        fontSize: 13.5,
                        lineHeight: 1.6,
                        color: val ? "#1F2436" : "#A6ACB8",
                        background: "transparent",
                        padding: 0,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coaching Feedback */}
          {!draftGenerated ? (
            <div style={{ border: "1.5px dashed #D5D9E2", borderRadius: 16, padding: 34, marginTop: 18, textAlign: "center" }}>
              <span style={{ width: 46, height: 46, borderRadius: "50%", background: "#F0F1F5", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.5 8.5 0 01-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1121 11.5z" stroke="#9198A6" strokeWidth="1.7" strokeLinejoin="round"/></svg>
              </span>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#6B7280", marginTop: 14 }}>코칭 피드백 대기 중</div>
              <div style={{ fontSize: 13, color: "#9198A6", marginTop: 5, lineHeight: 1.6 }}>AI 초안을 생성하면 코치 요다가 작성된 내용을 분석해 피드백을 제시합니다.</div>
            </div>
          ) : (
            <>
              {/* 완성도 점수 카드 */}
              <div style={{ background: "#fff", border: "1px solid #E8EAEE", borderRadius: 16, padding: "18px 20px", marginTop: 18 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: fetchingScore ? 0 : (score ? 14 : 0) }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="#F59E0B"/></svg>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#1F2436" }}>완성도 채점</span>
                    {score && (
                      <span style={{ fontSize: 11, color: "#9198A6", fontWeight: 500 }}>— {score.methodology_ref}</span>
                    )}
                  </div>
                  {fetchingScore ? (
                    <span style={{ display: "inline-flex", gap: 3 }}>
                      {[0, 150, 300].map((d, i) => (
                        <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#F59E0B", display: "inline-block", animation: "bounce 1.2s infinite", animationDelay: `${d}ms` }} />
                      ))}
                    </span>
                  ) : score ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{
                        fontSize: 28, fontWeight: 900, color:
                          score.score >= 90 ? "#15A06B" : score.score >= 70 ? "#5A5BD6" : score.score >= 50 ? "#F59E0B" : "#EF4444"
                      }}>{score.score}</span>
                      <span style={{
                        fontSize: 13, fontWeight: 800, padding: "3px 10px", borderRadius: 100,
                        background: score.grade === "A" ? "#D8EFE3" : score.grade === "B" ? "#ECECFB" : score.grade === "C" ? "#FEF3C7" : "#FEE2E2",
                        color: score.grade === "A" ? "#15A06B" : score.grade === "B" ? "#5A5BD6" : score.grade === "C" ? "#92400E" : "#DC2626",
                      }}>등급 {score.grade}</span>
                    </div>
                  ) : null}
                </div>
                {!fetchingScore && score && (
                  <>
                    <div style={{ height: 6, background: "#F0F1F5", borderRadius: 100, overflow: "hidden", marginBottom: 14 }}>
                      <div style={{
                        width: `${score.score}%`, height: "100%", borderRadius: 100, transition: "width 0.8s ease",
                        background: score.score >= 90 ? "#15A06B" : score.score >= 70 ? "#5A5BD6" : score.score >= 50 ? "#F59E0B" : "#EF4444",
                      }} />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {score.strengths.length > 0 && (
                        <div style={{ background: "#F0FDF4", borderRadius: 10, padding: "10px 12px" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#15A06B", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>잘된 점</div>
                          {score.strengths.map((s, i) => (
                            <div key={i} style={{ fontSize: 12.5, color: "#1F2436", lineHeight: 1.6 }}>✓ {s}</div>
                          ))}
                        </div>
                      )}
                      {score.missing_items.length > 0 && (
                        <div style={{ background: "#FFF7ED", borderRadius: 10, padding: "10px 12px" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#C2410C", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>보완 필요</div>
                          {score.missing_items.map((m, i) => (
                            <div key={i} style={{ fontSize: 12.5, color: "#1F2436", lineHeight: 1.6 }}>△ {m}</div>
                          ))}
                        </div>
                      )}
                    </div>
                    {score.improvement_hint && (
                      <div style={{ marginTop: 10, padding: "9px 12px", background: "#ECECFB", borderRadius: 9, fontSize: 12.5, color: "#3B3D8E", fontWeight: 600 }}>
                        💡 {score.improvement_hint}
                      </div>
                    )}
                  </>
                )}
                {!fetchingScore && !score && (
                  <div style={{ fontSize: 13, color: "#9198A6" }}>채점 중 오류가 발생했습니다.</div>
                )}
              </div>

              {/* 이전/이후 비교 결과 */}
              {compareResult && prevContent && (
                <div style={{ background: "#F0FDF4", border: "1px solid #CDEBDC", borderRadius: 16, padding: "18px 20px", marginTop: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#15A06B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span style={{ fontSize: 14, fontWeight: 800, color: "#15803D" }}>수정 후 변화 분석</span>
                    {compareResult.progress_delta > 0 && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#15A06B", background: "#D8EFE3", padding: "2px 8px", borderRadius: 100 }}>
                        +{compareResult.progress_delta}점 향상
                      </span>
                    )}
                  </div>
                  {compareResult.improvements.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#15A06B", marginBottom: 5 }}>나아진 점</div>
                      {compareResult.improvements.map((imp, i) => (
                        <div key={i} style={{ fontSize: 12.5, color: "#1F2436", lineHeight: 1.6, paddingLeft: 12 }}>▸ {imp}</div>
                      ))}
                    </div>
                  )}
                  {compareResult.remaining_issues.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", marginBottom: 5 }}>아직 보완 필요</div>
                      {compareResult.remaining_issues.map((issue, i) => (
                        <div key={i} style={{ fontSize: 12.5, color: "#1F2436", lineHeight: 1.6, paddingLeft: 12 }}>△ {issue}</div>
                      ))}
                    </div>
                  )}
                  {compareResult.overall_progress && (
                    <div style={{ fontSize: 13, color: "#15803D", fontWeight: 600, fontStyle: "italic" }}>"{compareResult.overall_progress}"</div>
                  )}
                </div>
              )}

              {/* 피드백 카드 */}
              <div style={{ background: "#EAF1FB", border: "1px solid #D9E6F7", borderRadius: 16, padding: "18px 20px", marginTop: 12 }}>
                <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                  <span style={{ width: 34, height: 34, borderRadius: 9, background: "#fff", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px -6px rgba(47,62,114,0.3)" }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="16" height="12" rx="3" stroke="#2F3E72" strokeWidth="1.7"/><path d="M12 8V4M9 4h6" stroke="#2F3E72" strokeWidth="1.7" strokeLinecap="round"/><circle cx="9" cy="14" r="1.2" fill="#2F3E72"/><circle cx="15" cy="14" r="1.2" fill="#2F3E72"/></svg>
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: "#2F3E72", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      코치 요다의 피드백
                      {fetchingFeedback && (
                        <span style={{ display: "inline-flex", gap: 3 }}>
                          {[0, 150, 300].map((d, i) => (
                            <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#5A5BD6", display: "inline-block", animation: "bounce 1.2s infinite", animationDelay: `${d}ms` }} />
                          ))}
                        </span>
                      )}
                    </div>
                    {fetchingFeedback ? (
                      <div style={{ fontSize: 13, color: "#9198A6", marginTop: 6 }}>작성된 내용을 분석 중입니다...</div>
                    ) : feedback ? (
                      <>
                        <div style={{ fontSize: 13.5, lineHeight: 1.75, color: "#42506B", marginTop: 5, whiteSpace: "pre-line" }}>
                          {feedback.replace(/\[근거:.*?\]/g, "").trim()}
                        </div>
                        {methodologyRef && (
                          <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, background: "#2F3E72", color: "#A8B8D8", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 100 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.5 4.6H18l-4 2.9 1.5 4.6L12 11.2l-3.5 2.9 1.5-4.6-4-2.9h4.5L12 2z" fill="#7DE0AE"/></svg>
                            근거: {methodologyRef}
                          </div>
                        )}
                        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #D9E6F7" }}>
                          <div style={{ fontSize: 12, color: "#9198A6", marginBottom: 8 }}>내용을 수정했다면 피드백을 다시 받아보세요.</div>
                          <button
                            onClick={() => {
                              if (content) {
                                fetchFeedback(step, content);
                                fetchScore(step, content);
                              }
                            }}
                            style={{
                              display: "inline-flex", alignItems: "center", gap: 6,
                              fontSize: 12.5, fontWeight: 600, color: "#2F3E72",
                              background: "#fff", border: "1px solid #C8D8F0", padding: "7px 14px", borderRadius: 8, cursor: "pointer",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#EAF1FB"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M23 4v6h-6M1 20v-6h6" stroke="#2F3E72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="#2F3E72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            피드백 다시 받기
                          </button>
                        </div>
                      </>
                    ) : (
                      <div style={{ fontSize: 13, color: "#9198A6", marginTop: 6 }}>피드백을 불러오지 못했습니다.</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Bottom Nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "26px 0 36px" }}>
            <Link href={prevLink} style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#6B7280", textDecoration: "none" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M11 6l-6 6 6 6" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              이전으로
            </Link>
            <div style={{ display: "flex", gap: 11 }}>
              <button
                onClick={() => handleSave(false)}
                disabled={saving || !hasContent}
                style={{ cursor: "pointer", fontFamily: "inherit", background: "#fff", color: "#42506B", border: "1.5px solid #D5D9E2", padding: "13px 22px", borderRadius: 11, fontSize: 14, fontWeight: 700, opacity: !hasContent ? 0.5 : 1 }}
              >
                임시 저장
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                style={{ cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 8, background: "#2F3E72", color: "#fff", border: "none", padding: "13px 24px", borderRadius: 11, fontSize: 14, fontWeight: 700, opacity: saving ? 0.7 : 1 }}
              >
                {saveButtonLabel}
                {!saving && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>
            </div>
          </div>

        </main>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
