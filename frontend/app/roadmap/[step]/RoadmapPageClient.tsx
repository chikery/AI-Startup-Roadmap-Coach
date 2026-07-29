"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/app/lib/api";
import { getProgramsForStep, isExpired, daysLeft } from "@/app/lib/support-programs";
import { useToast } from "@/app/components/ui/Toast";
import ThemeSwitcher from "@/app/components/ui/ThemeSwitcher";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import ProgressBar from "@/app/components/ui/ProgressBar";
import BottomNav from "@/app/components/ui/BottomNav";
import Drawer from "@/app/components/ui/Drawer";
import { cn } from "@/app/lib/cn";

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
  const toast = useToast();
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
      toast.show(err instanceof Error ? err.message : "오류가 발생했습니다", "error");
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
      toast.show(navigate ? "저장되었습니다" : "임시 저장되었습니다");
      if (navigate) {
        if (step < 7) router.push(`/roadmap/${step + 1}`);
        else router.push("/business-plan");
      }
    } catch (err: unknown) {
      toast.show(err instanceof Error ? err.message : "저장에 실패했습니다", "error");
    } finally {
      setSaving(false);
    }
  }

  if (!meta) {
    return <div className="min-h-screen bg-background p-10 text-center text-muted">존재하지 않는 단계입니다</div>;
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

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/dashboard/";
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {/* Ambient blurred color blobs — kept subtle since this page is text/form-dense */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 10% 6%, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 40%)," +
            "radial-gradient(circle at 94% 10%, color-mix(in srgb, var(--color-accent) 10%, transparent) 0%, transparent 38%)," +
            "radial-gradient(circle at 18% 98%, color-mix(in srgb, var(--color-secondary) 10%, transparent) 0%, transparent 44%)",
        }}
      />

      <div className="relative z-[1] font-['Pretendard',_sans-serif] text-text">

        {/* ── TOP NAV — desktop unchanged; mobile trimmed to logo + step badge + a single
             "더보기" drawer trigger (theme + logout), since 대시보드 이동은 이제 BottomNav가 담당 ── */}
        <nav className="glass sticky top-0 z-10 rounded-none border-l-0 border-r-0 border-t-0">
          <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-4 sm:px-7">
            <div className="flex min-w-0 items-center gap-[18px]">
              <Link href="/" className="shrink-0 [font-family:var(--font-geist)] text-[21px] font-extrabold tracking-[-0.01em] text-text no-underline">StepUp</Link>
              {/* Desktop only: full dashboard link + step name label */}
              <Link href="/dashboard" className="hidden items-center gap-1.5 rounded-sm bg-[color-mix(in_srgb,var(--color-primary)_14%,var(--color-surface))] px-3 py-[5px] text-[13px] font-semibold text-primary no-underline transition-[background] duration-150 md:inline-flex">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="var(--color-primary)"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="var(--color-primary)"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="var(--color-primary)"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="var(--color-primary)"/></svg>
                대시보드
              </Link>
              <span className="hidden border-l border-border pl-[18px] text-[13px] text-muted md:inline">{step}단계: {meta.name}</span>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-4">
              <span className="inline-flex items-center gap-[7px] rounded-full bg-[color-mix(in_srgb,var(--color-primary)_14%,var(--color-surface))] px-3 py-1.5 text-[13px] font-bold text-primary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 14h3v6H4zM10.5 9h3v11h-3zM17 4h3v16h-3z" fill="var(--color-primary)"/></svg>
                {step}/7
              </span>
              {/* Decorative bell — desktop only, no behavior attached */}
              <svg className="hidden md:block" width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" stroke="var(--color-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <ThemeSwitcher className="hidden md:inline-flex" />
              <span className="hidden h-8 w-8 rounded-full border border-border bg-[linear-gradient(135deg,var(--color-secondary),var(--color-primary))] sm:inline-block"></span>
              {isLoggedIn && (
                <Button
                  onClick={handleLogout}
                  aria-label="로그아웃"
                  variant="secondary"
                  size="sm"
                  className="hidden hover:border-error hover:text-error md:inline-flex"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  로그아웃
                </Button>
              )}
              {/* Mobile only: single drawer trigger carrying theme + logout */}
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
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-muted">테마</span>
                    <ThemeSwitcher />
                  </div>
                  {isLoggedIn && (
                    <Button onClick={handleLogout} variant="secondary" size="md" className="w-full hover:border-error hover:text-error">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      로그아웃
                    </Button>
                  )}
                </div>
              </Drawer>
            </div>
          </div>
        </nav>

        {/* ── BODY GRID ── */}
        <div className="roadmap-grid mx-auto max-w-[1180px]">

          {/* ── SIDEBAR ── */}
          <aside className="glass sticky top-[26px] rounded-lg px-4 py-5">
            <div className="text-[18px] font-extrabold text-primary">창업 여정</div>
            <div className="mt-[9px] mb-2 flex items-center justify-between">
              <span className="text-[12.5px] font-semibold text-muted">진행률</span>
              <span className="text-[12.5px] font-bold text-muted">{completedCount}/7</span>
            </div>
            <div className="mb-6">
              <ProgressBar value={completedCount} max={7} color="var(--color-success)" className="h-[7px]" />
            </div>

            {/* Desktop: full step list, always visible (unchanged) */}
            <div className="hidden flex-col gap-[3px] md:flex">
              {STEP_META.map((s) => {
                const isActive = s.step === step;
                const isDone = progress.find((p) => p.step === s.step)?.is_completed;
                return (
                  <Link
                    key={s.step}
                    href={`/roadmap/${s.step}`}
                    className={cn(
                      "flex items-center gap-[11px] rounded-sm px-[11px] py-2.5 text-[13.5px] no-underline",
                      isActive
                        ? "bg-[color-mix(in_srgb,var(--color-primary)_14%,var(--color-surface))] font-bold text-primary"
                        : "font-semibold text-muted"
                    )}
                  >
                    {isDone && !isActive ? (
                      <span className="inline-flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-success)_16%,var(--color-surface))]">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="var(--color-success)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </span>
                    ) : (
                      <span className={cn("shrink-0", isActive ? "text-primary" : "text-muted")}>
                        <StepIcon step={s.step} color={isActive ? "var(--color-primary)" : "var(--color-muted)"} />
                      </span>
                    )}
                    {s.name}
                  </Link>
                );
              })}
            </div>

            {/* Mobile: collapsed drawer — journey list is reference material, not the task at hand */}
            <details className="md:hidden">
              <summary className="cursor-pointer list-none px-1 py-2 text-[13px] font-bold text-muted">
                전체 7단계 보기 ({completedCount}/7 완료)
              </summary>
              <div className="mt-1.5 flex flex-col gap-[3px]">
                {STEP_META.map((s) => {
                  const isActive = s.step === step;
                  const isDone = progress.find((p) => p.step === s.step)?.is_completed;
                  return (
                    <Link
                      key={s.step}
                      href={`/roadmap/${s.step}`}
                      className={cn(
                        "flex items-center gap-[11px] rounded-sm px-[11px] py-2.5 text-[13.5px] no-underline",
                        isActive
                          ? "bg-[color-mix(in_srgb,var(--color-primary)_14%,var(--color-surface))] font-bold text-primary"
                          : "font-semibold text-muted"
                      )}
                    >
                      {isDone && !isActive ? (
                        <span className="inline-flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-success)_16%,var(--color-surface))]">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="var(--color-success)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                      ) : (
                        <span className={cn("shrink-0", isActive ? "text-primary" : "text-muted")}>
                          <StepIcon step={s.step} color={isActive ? "var(--color-primary)" : "var(--color-muted)"} />
                        </span>
                      )}
                      {s.name}
                    </Link>
                  );
                })}
              </div>
            </details>

            <div className="mt-[22px] mb-4 border-t border-border"></div>

            <Button
              onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
              variant="secondary"
              size="md"
              className="w-full"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" fill="currentColor"/></svg>
              AI 인사이트 받기
            </Button>

            {/* 지원사업 매칭 */}
            {(() => {
              const programs = getProgramsForStep(step);
              if (!programs.length) return null;
              const list = (
                <div className="flex flex-col gap-1.5">
                  {programs.slice(0, 4).map((p, i) => {
                    const expired = isExpired(p.deadline);
                    const left = daysLeft(p.deadline);
                    return (
                      <a
                        key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                        className={cn(
                          "block rounded-sm border px-2.5 py-[9px] no-underline",
                          expired
                            ? "border-border opacity-60"
                            : "border-[color-mix(in_srgb,var(--color-accent)_45%,transparent)] bg-[color-mix(in_srgb,var(--color-accent)_18%,var(--color-surface))]"
                        )}
                      >
                        <div className={cn("mb-1 text-[11.5px] font-bold leading-[1.4]", expired ? "text-muted" : "text-text")}>{p.name}</div>
                        <div className={cn("text-[10.5px] font-semibold", expired ? "text-muted" : left <= 7 ? "text-error" : "text-accent")}>
                          {expired ? "마감" : `D-${left} · ${p.deadline.slice(5).replace("-", "/")}`}
                        </div>
                      </a>
                    );
                  })}
                </div>
              );
              return (
                <>
                  {/* Desktop: always expanded */}
                  <div className="mt-[18px] hidden md:block">
                    <div className="mb-2.5 flex items-center gap-1.5">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="var(--color-accent)"/></svg>
                      <span className="text-[12px] font-bold text-accent">이 단계 추천 지원사업</span>
                    </div>
                    {list}
                  </div>
                  {/* Mobile: collapsed accordion */}
                  <details className="mt-3 md:hidden">
                    <summary className="flex cursor-pointer list-none items-center gap-1.5 px-1 py-2 text-[12.5px] font-bold text-accent">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="var(--color-accent)"/></svg>
                      이 단계 추천 지원사업 ({programs.length})
                    </summary>
                    <div className="mt-2">{list}</div>
                  </details>
                </>
              );
            })()}

            <div className="flex items-center justify-between px-[11px] pt-3.5 pb-1">
              <span className="inline-flex items-center gap-2 text-[13px] text-muted">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" stroke="var(--color-muted)" strokeWidth="1.7"/><path d="M9.5 9.5a2.5 2.5 0 113.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01" stroke="var(--color-muted)" strokeWidth="1.7" strokeLinecap="round"/></svg>
                도움말
              </span>
              <Link href="/">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="var(--color-muted)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </div>
          </aside>

          {/* ── MAIN ── */}
          <main>

            {/* Step Header */}
            <div className="roadmap-section-header flex min-w-0 items-start gap-4">
              <span className="inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--color-primary)_14%,var(--color-surface))]">
                <StepIcon step={step} color="var(--color-primary)" />
              </span>
              <div className="min-w-0">
                <h1 className="m-0 text-[26px] font-extrabold tracking-[-0.02em] text-text [word-break:keep-all] [overflow-wrap:break-word]">{meta.heading}</h1>
                <p className="mt-[7px] text-[14.5px] text-muted [word-break:keep-all]">{meta.description}</p>
              </div>
            </div>

            {/* Why + Coach two-column — collapsed by default on mobile (context reading, not the core task) */}
            <details className="roadmap-section-why mt-4 md:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-1 py-3 text-[14px] font-bold text-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" stroke="var(--color-primary)" strokeWidth="1.7"/><path d="M12 11v5M12 7.5h.01" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round"/></svg>
                왜 이 단계가 필요한가 (펼쳐보기)
              </summary>
              <div className="glass mt-2 rounded-md px-5 py-[18px]">
                {meta.whyText.map((text, i) => (
                  <p key={i} className={cn("text-[13.5px] leading-[1.7] text-muted", i === 0 ? "m-0" : "mt-3")}>{text}</p>
                ))}
                <div className="my-[14px] border-t border-border" />
                <div className="flex items-center gap-[7px] text-[12.5px] font-extrabold text-primary">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 3c-1 3-2 4-5 5 3 1 4 2 5 5 1-3 2-4 5-5-3-1-4-2-5-5z" fill="var(--color-accent)"/></svg>
                  RK · AI 코치 요다
                </div>
                <div className="mt-2 text-[13px] leading-[1.7] text-text">"{meta.coachQuote}"</div>
              </div>
            </details>

            {/* Desktop-only version — always visible, two-column, unchanged */}
            <div className="roadmap-section-why mt-6 hidden md:block">
            <div className="roadmap-why-row">
              {/* Why card */}
              <Card variant="glass" radius="md" className="px-6 py-[22px]">
                <div className="flex items-center gap-2 text-[16px] font-extrabold text-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" stroke="var(--color-primary)" strokeWidth="1.7"/><path d="M12 11v5M12 7.5h.01" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round"/></svg>
                  왜 이 단계가 필요한가
                </div>
                {meta.whyText.map((text, i) => (
                  <p key={i} className={cn("text-[13.8px] leading-[1.7] text-muted", i === 0 ? "mt-[13px]" : "mt-3")}>{text}</p>
                ))}
                <div className="mt-[18px] flex flex-wrap gap-2.5">
                  {meta.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-[7px] text-[12.5px] font-semibold text-muted">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="var(--color-success)" strokeWidth="1.8"/><path d="M8 12l3 3 5-6" stroke="var(--color-success)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>

              {/* Coach card — primary-tinted glass, distinct from neutral cards */}
              <Card variant="glass" radius="md" className="flex flex-col bg-[color-mix(in_srgb,var(--color-primary)_14%,var(--color-surface))] p-5">
                <div className="flex items-center gap-[7px] text-[13px] font-extrabold text-primary">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 3c-1 3-2 4-5 5 3 1 4 2 5 5 1-3 2-4 5-5-3-1-4-2-5-5z" fill="var(--color-accent)"/></svg>
                  RK · AI 코치 요다
                </div>
                <div className="mt-[13px] flex-1 text-[13px] leading-[1.7] text-text">
                  "{meta.coachQuote}"
                </div>
                <div className="mt-3.5 border-t border-border pt-[11px] text-[11px] text-muted">
                  실시간 분석 · 피드백 활성
                </div>
              </Card>
            </div>
            </div>

            {/* Core task — AI draft generation + framework editing. This is the star of the page on mobile. */}
            <div className="roadmap-section-work">

            {/* AI Draft Banner */}
            {!draftGenerated ? (
              /* Hero gradient moment — the page's one call-to-action highlight */
              <div
                className="relative mt-[18px] flex items-center justify-between gap-[18px] overflow-hidden rounded-lg border border-white/30 px-[22px] py-[18px]"
                style={{
                  background: "linear-gradient(150deg, var(--color-primary) 0%, var(--color-secondary) 55%, var(--color-accent) 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 20px 40px -20px color-mix(in srgb, var(--color-primary) 55%, transparent)",
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 68%, rgba(255,255,255,0.12) 100%)" }}
                />
                <div className="relative flex items-center gap-[13px]">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-white/30 bg-white/[0.22]">
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" fill="#fff"/></svg>
                  </span>
                  <div>
                    <div className="text-[15px] font-extrabold text-white">AI 초안 생성이 준비되었습니다</div>
                    <div className="mt-[3px] text-[13px] text-white/85">{meta.frameworkDesc}</div>
                  </div>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !user?.item_keyword}
                  variant="primary"
                  size="md"
                  className="relative shrink-0 px-[22px] py-[13px]"
                >
                  {generating ? (
                    <span
                      className="inline-block h-[15px] w-[15px] animate-[spin_0.7s_linear_infinite] rounded-full border-2"
                      style={{ borderColor: "color-mix(in srgb, var(--color-background) 40%, transparent)", borderTopColor: "var(--color-background)" }}
                    ></span>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L4.5 12.5h6L9 22l9-11h-6L13 2z" fill="currentColor"/></svg>
                  )}
                  {generating ? "생성 중..." : "AI 초안 생성 시작"}
                </Button>
              </div>
            ) : (
              <div className="glass mt-[18px] flex items-center justify-between gap-[18px] rounded-md bg-[color-mix(in_srgb,var(--color-success)_16%,var(--color-surface))] px-5 py-4">
                <div className="flex items-center gap-[13px]">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-success">
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <div>
                    <div className="text-[15px] font-extrabold text-success">AI 초안이 생성되었습니다</div>
                    <div className="mt-[3px] text-[13px] text-muted">각 항목을 검토하고 다듬은 뒤 저장 후 다음 단계로 진행하세요.</div>
                  </div>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !user?.item_keyword}
                  variant="success"
                  size="sm"
                  className="shrink-0 px-[18px] py-[11px]"
                >
                  {generating ? "생성 중..." : "다시 생성하기"}
                </Button>
              </div>
            )}

            {/* Framework Table */}
            <div className="mx-0.5 mt-7 mb-3.5 flex items-center justify-between">
              <h2 className="m-0 text-[19px] font-extrabold text-text">{meta.frameworkTitle}</h2>
              <a href="#" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-primary no-underline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" stroke="var(--color-primary)" strokeWidth="1.7"/><path d="M9.5 9.5a2.5 2.5 0 113.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01" stroke="var(--color-primary)" strokeWidth="1.7" strokeLinecap="round"/></svg>
                프레임워크 가이드 보기
              </a>
            </div>

            <Card variant="glass" radius="md" padding="none" className="overflow-hidden">
              {/* Table header — hidden on mobile since the label already appears above each field in the stacked layout */}
              <div className="roadmap-table-row hidden border-b border-border bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] md:grid">
                <div className="px-[22px] py-[13px] text-[12px] font-bold text-muted">구분</div>
                <div className="px-[22px] py-[13px] text-[12px] font-bold text-muted">상세 내용</div>
              </div>

              {meta.rows.map((row, idx) => {
                const raw = content?.[row.key];
                const val = formatValue(raw);
                const isLast = idx === meta.rows.length - 1;
                return (
                  <div key={row.key} className={cn("roadmap-table-row", !isLast && "border-b border-border")}>
                    <div className="flex items-center gap-2.5 px-[22px] py-5 text-[14px] font-bold text-text">
                      <span className="h-2 w-2 shrink-0 rounded-[3px] bg-primary"></span>
                      {row.label}
                    </div>
                    <div className="px-[22px] py-4 text-[13.5px] leading-[1.6]">
                      {val && (
                        <span className="mb-2 inline-flex items-center gap-[5px] rounded-full bg-[color-mix(in_srgb,var(--color-primary)_14%,var(--color-surface))] px-2 py-[3px] text-[10.5px] font-bold text-primary">
                          ✦ AI 초안
                        </span>
                      )}
                      <textarea
                        value={val}
                        placeholder={row.placeholder}
                        onChange={(e) => setContent((prev) => ({ ...(prev || {}), [row.key]: e.target.value }))}
                        rows={val ? Math.max(2, val.split("\n").length + 1) : 2}
                        className={cn(
                          "block w-full resize-none border-none bg-transparent p-0 text-[13.5px] leading-[1.6] outline-none font-['Pretendard',_sans-serif]",
                          val ? "text-text" : "text-muted"
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </Card>
            </div>

            {/* Coaching Feedback — surfaced right after the work area on mobile so users see it without hunting */}
            <div className="roadmap-section-coachfeedback">
            {!draftGenerated ? (
              <div className="glass mt-[18px] rounded-md p-[34px] text-center">
                <span className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-muted)_15%,transparent)]">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.5 8.5 0 01-12.3 7.6L3 21l1.9-5.7A8.5 8.5 0 1121 11.5z" stroke="var(--color-muted)" strokeWidth="1.7" strokeLinejoin="round"/></svg>
                </span>
                <div className="mt-3.5 text-[15px] font-extrabold text-muted">코칭 피드백 대기 중</div>
                <div className="mt-[5px] text-[13px] leading-[1.6] text-muted">AI 초안을 생성하면 코치 요다가 작성된 내용을 분석해 피드백을 제시합니다.</div>
              </div>
            ) : (
              <>
                {/* 완성도 점수 카드 */}
                <Card variant="glass" radius="md" className="mt-[18px] px-5 py-[18px]">
                  <div className={cn("flex items-center justify-between", !fetchingScore && score && "mb-3.5")}>
                    <div className="flex items-center gap-2">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="var(--color-accent)"/></svg>
                      <span className="text-[14px] font-extrabold text-text">완성도 채점</span>
                      {score && (
                        <span className="text-[11px] font-medium text-muted">— {score.methodology_ref}</span>
                      )}
                    </div>
                    {fetchingScore ? (
                      <span className="inline-flex gap-[3px]">
                        {[0, 150, 300].map((d, i) => (
                          <span key={i} className="inline-block h-[5px] w-[5px] animate-[bounce_1.2s_infinite] rounded-full bg-accent" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </span>
                    ) : score ? (
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "text-[28px] font-black",
                            score.score >= 90 ? "text-success" : score.score >= 70 ? "text-primary" : score.score >= 50 ? "text-accent" : "text-error"
                          )}
                        >{score.score}</span>
                        <Badge
                          variant={score.grade === "A" ? "success" : score.grade === "B" ? "default" : score.grade === "C" ? "accent" : "error"}
                          className="text-[13px]"
                        >등급 {score.grade}</Badge>
                      </div>
                    ) : null}
                  </div>
                  {!fetchingScore && score && (
                    <>
                      <ProgressBar
                        value={score.score}
                        color={
                          score.score >= 90 ? "var(--color-success)" : score.score >= 70 ? "var(--color-primary)" : score.score >= 50 ? "var(--color-accent)" : "var(--color-error)"
                        }
                        className="mb-3.5 h-1.5"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        {score.strengths.length > 0 && (
                          <div className="rounded-sm bg-[color-mix(in_srgb,var(--color-success)_16%,var(--color-surface))] px-3 py-2.5">
                            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.05em] text-success">잘된 점</div>
                            {score.strengths.map((s, i) => (
                              <div key={i} className="text-[12.5px] leading-[1.6] text-text">✓ {s}</div>
                            ))}
                          </div>
                        )}
                        {score.missing_items.length > 0 && (
                          <div className="rounded-sm bg-[color-mix(in_srgb,var(--color-accent)_18%,var(--color-surface))] px-3 py-2.5">
                            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.05em] text-accent">보완 필요</div>
                            {score.missing_items.map((m, i) => (
                              <div key={i} className="text-[12.5px] leading-[1.6] text-text">△ {m}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      {score.improvement_hint && (
                        <div className="mt-2.5 rounded-sm bg-[color-mix(in_srgb,var(--color-primary)_14%,var(--color-surface))] px-3 py-[9px] text-[12.5px] font-semibold text-primary">
                          💡 {score.improvement_hint}
                        </div>
                      )}
                    </>
                  )}
                  {!fetchingScore && !score && (
                    <div className="text-[13px] text-muted">채점 중 오류가 발생했습니다.</div>
                  )}
                </Card>

                {/* 이전/이후 비교 결과 */}
                {compareResult && prevContent && (
                  <Card variant="glass" radius="md" className="mt-3 bg-[color-mix(in_srgb,var(--color-success)_16%,var(--color-surface))] px-5 py-[18px]">
                    <div className="mb-3 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="var(--color-success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="text-[14px] font-extrabold text-success">수정 후 변화 분석</span>
                      {compareResult.progress_delta > 0 && (
                        <span className="rounded-full bg-[color-mix(in_srgb,var(--color-success)_26%,var(--color-surface))] px-2 py-0.5 text-[12px] font-bold text-success">
                          +{compareResult.progress_delta}점 향상
                        </span>
                      )}
                    </div>
                    {compareResult.improvements.length > 0 && (
                      <div className="mb-2.5">
                        <div className="mb-[5px] text-[11px] font-bold text-success">나아진 점</div>
                        {compareResult.improvements.map((imp, i) => (
                          <div key={i} className="pl-3 text-[12.5px] leading-[1.6] text-text">▸ {imp}</div>
                        ))}
                      </div>
                    )}
                    {compareResult.remaining_issues.length > 0 && (
                      <div className="mb-2.5">
                        <div className="mb-[5px] text-[11px] font-bold text-accent">아직 보완 필요</div>
                        {compareResult.remaining_issues.map((issue, i) => (
                          <div key={i} className="pl-3 text-[12.5px] leading-[1.6] text-text">△ {issue}</div>
                        ))}
                      </div>
                    )}
                    {compareResult.overall_progress && (
                      <div className="text-[13px] font-semibold italic text-success">"{compareResult.overall_progress}"</div>
                    )}
                  </Card>
                )}

                {/* 피드백 카드 */}
                <Card variant="glass" radius="md" className="mt-3 bg-[color-mix(in_srgb,var(--color-primary)_10%,var(--color-surface))] px-5 py-[18px]">
                  <div className="flex items-start gap-[13px]">
                    <span
                      className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-sm bg-surface"
                      style={{ boxShadow: "0 4px 12px -6px color-mix(in srgb, var(--color-primary) 30%, transparent)" }}
                    >
                      <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><rect x="4" y="8" width="16" height="12" rx="3" stroke="var(--color-primary)" strokeWidth="1.7"/><path d="M12 8V4M9 4h6" stroke="var(--color-primary)" strokeWidth="1.7" strokeLinecap="round"/><circle cx="9" cy="14" r="1.2" fill="var(--color-primary)"/><circle cx="15" cy="14" r="1.2" fill="var(--color-primary)"/></svg>
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[13.5px] font-extrabold text-primary">
                        코치 요다의 피드백
                        {fetchingFeedback && (
                          <span className="inline-flex gap-[3px]">
                            {[0, 150, 300].map((d, i) => (
                              <span key={i} className="inline-block h-[5px] w-[5px] animate-[bounce_1.2s_infinite] rounded-full bg-primary" style={{ animationDelay: `${d}ms` }} />
                            ))}
                          </span>
                        )}
                      </div>
                      {fetchingFeedback ? (
                        <div className="mt-1.5 text-[13px] text-muted">작성된 내용을 분석 중입니다...</div>
                      ) : feedback ? (
                        <>
                          <div className="mt-[5px] whitespace-pre-line text-[13.5px] leading-[1.75] text-muted">
                            {feedback.replace(/\[근거:.*?\]/g, "").trim()}
                          </div>
                          {methodologyRef && (
                            <div className="mt-2 inline-flex items-center gap-[5px] rounded-full bg-text px-2.5 py-1 text-[11px] font-semibold text-background">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M12 2l1.5 4.6H18l-4 2.9 1.5 4.6L12 11.2l-3.5 2.9 1.5-4.6-4-2.9h4.5L12 2z" fill="var(--color-accent)"/></svg>
                              근거: {methodologyRef}
                            </div>
                          )}
                          <div className="mt-3.5 border-t border-border pt-3">
                            <div className="mb-2 text-[12px] text-muted">내용을 수정했다면 피드백을 다시 받아보세요.</div>
                            <Button
                              onClick={() => {
                                if (content) {
                                  fetchFeedback(step, content);
                                  fetchScore(step, content);
                                }
                              }}
                              variant="secondary"
                              size="sm"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M23 4v6h-6M1 20v-6h6" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                              피드백 다시 받기
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="mt-1.5 text-[13px] text-muted">피드백을 불러오지 못했습니다.</div>
                      )}
                    </div>
                  </div>
                </Card>
              </>
            )}
            </div>

            {/* Bottom Nav — in-flow on desktop; on mobile the primary action moves to a sticky bar below instead */}
            <div className="roadmap-section-bottomnav hidden items-center justify-between mt-[26px] mb-9 md:flex">
              <Link href={prevLink} className="inline-flex items-center gap-2 text-[14px] font-semibold text-muted no-underline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M11 6l-6 6 6 6" stroke="var(--color-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                이전으로
              </Link>
              <div className="flex gap-[11px]">
                <Button
                  onClick={() => handleSave(false)}
                  disabled={saving || !hasContent}
                  variant="secondary"
                  size="lg"
                  className={cn(!hasContent && "opacity-50")}
                >
                  임시 저장
                </Button>
                <Button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  variant="primary"
                  size="lg"
                >
                  {saveButtonLabel}
                  {!saving && (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  )}
                </Button>
              </div>
            </div>

          </main>
        </div>

        {/* Mobile-only sticky primary CTA — always reachable regardless of scroll position */}
        <div className="roadmap-sticky-cta glass md:hidden">
          <Button
            onClick={() => handleSave(true)}
            disabled={saving}
            variant="primary"
            size="lg"
            className="w-full text-[15px]"
          >
            {saveButtonLabel}
            {!saving && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </Button>
        </div>

        <BottomNav />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
