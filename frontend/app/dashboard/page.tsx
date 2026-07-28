"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/app/lib/api";
import { SUPPORT_PROGRAMS, isExpired, daysLeft } from "@/app/lib/support-programs";
import { STEP_CONTENT } from "./step-content";
import TodayMissionCard, { MissionVariant } from "./components/TodayMissionCard";
import RoadmapProgressCard from "./components/RoadmapProgressCard";
import MilestoneCard from "./components/MilestoneCard";
import ProjectHealthCard from "./components/ProjectHealthCard";
import AIRecommendationCard from "./components/AIRecommendationCard";
import GovernmentSupportCard from "./components/GovernmentSupportCard";
import NotificationCard from "./components/NotificationCard";
import LearningCard from "./components/LearningCard";
import ThemeSwitcher from "@/app/components/ui/ThemeSwitcher";

interface StepStatus {
  step: number;
  is_completed: boolean;
}

const LAST_SEEN_KEY = "stepup_last_seen_completed";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [progress, setProgress] = useState<StepStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPlan, setHasPlan] = useState(false);
  const [justCompletedStep, setJustCompletedStep] = useState<number | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    setIsLoggedIn(!!token);

    if (token) {
      api.roadmap.getProgress()
        .then((data: any) => {
          setProgress(data);
          const completedCount = (data as StepStatus[]).filter((s) => s.is_completed).length;
          const lastSeen = parseInt(localStorage.getItem(LAST_SEEN_KEY) || "0", 10);
          if (completedCount > lastSeen) setJustCompletedStep(completedCount);
          localStorage.setItem(LAST_SEEN_KEY, String(completedCount));
        })
        .catch(() => {})
        .finally(() => setLoading(false));

      fetch(`${BASE_URL}/roadmap/business-plan?token=${token}`)
        .then((r) => r.json())
        .then((d) => setHasPlan(!!d.content))
        .catch(() => {});
    } else {
      setLoading(false);
    }
  }, []);

  const completedCount = progress.filter((s) => s.is_completed).length;
  const nextStep = Math.min(completedCount + 1, 7);
  const activeStep = nextStep;

  const urgentProgram = SUPPORT_PROGRAMS
    .map((p) => ({ ...p, expired: isExpired(p.deadline), left: daysLeft(p.deadline) }))
    .filter((p) => !p.expired && p.left <= 14)
    .sort((a, b) => a.left - b.left)[0];

  function buildMission(): { variant: MissionVariant; eyebrow: string; title: string; desc: string; ctaLabel: string; ctaHref: string; externalCta?: boolean } {
    if (!isLoggedIn) {
      return {
        variant: "guest",
        eyebrow: "시작하기",
        title: "아이디어만 있어도 충분해요",
        desc: "가입하고 7단계 로드맵을 무료로 시작해보세요. AI 코치가 사업계획서 완성까지 함께합니다.",
        ctaLabel: "무료로 시작하기",
        ctaHref: "/signup",
      };
    }
    if (completedCount < 7) {
      const meta = STEP_CONTENT[nextStep - 1];
      return {
        variant: "roadmap",
        eyebrow: `STEP ${nextStep}`,
        title: `${meta.name} 시작하기`,
        desc: meta.desc,
        ctaLabel: "이 단계 시작하기",
        ctaHref: `/roadmap/${nextStep}`,
      };
    }
    if (!hasPlan) {
      return {
        variant: "plan",
        eyebrow: "7단계 완료!",
        title: "사업계획서를 완성해보세요",
        desc: "지금까지 작성한 내용을 바탕으로 완성도 높은 사업계획서를 만들어 드려요.",
        ctaLabel: "사업계획서 생성하기",
        ctaHref: "/business-plan",
      };
    }
    if (urgentProgram) {
      return {
        variant: "support",
        eyebrow: "마감 임박",
        title: urgentProgram.name,
        desc: `D-${urgentProgram.left} · 지금 신청 가능한 지원사업이에요. 놓치지 마세요.`,
        ctaLabel: "신청하러 가기",
        ctaHref: urgentProgram.url,
        externalCta: true,
      };
    }
    return {
      variant: "polish",
      eyebrow: "완료",
      title: "사업계획서를 다듬어보세요",
      desc: "제출 전에 한 번 더 검토하고, 코치 요다의 피드백으로 완성도를 높여보세요.",
      ctaLabel: "사업계획서 보기",
      ctaHref: "/business-plan",
    };
  }

  const mission = buildMission();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-background)" }}>
        <div style={{ color: "var(--color-muted)", fontFamily: "Pretendard, sans-serif" }}>불러오는 중...</div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "var(--color-background)" }}>
      {/* Ambient blurred color blobs — glass cards need something to refract */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background:
            "radial-gradient(circle at 12% 6%, color-mix(in srgb, var(--color-primary) 18%, transparent) 0%, transparent 42%)," +
            "radial-gradient(circle at 92% 12%, color-mix(in srgb, var(--color-accent) 16%, transparent) 0%, transparent 40%)," +
            "radial-gradient(circle at 22% 96%, color-mix(in srgb, var(--color-secondary) 16%, transparent) 0%, transparent 46%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, fontFamily: "Pretendard, sans-serif", color: "var(--color-text)" }}>

        {/* TOP NAV */}
        <nav className="glass" style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none", position: "sticky", top: 0, zIndex: 10 }}>
          <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 sm:px-7">
            <div className="flex items-center gap-8">
              <Link href="/" style={{ fontFamily: "var(--font-geist, 'Geist', sans-serif)", fontWeight: 800, fontSize: 21, color: "var(--color-text)", letterSpacing: "-0.01em", textDecoration: "none" }}>StepUp</Link>
              <div className="hidden items-center gap-6 text-[14.5px] font-semibold sm:flex" style={{ color: "var(--color-muted)" }}>
                <span style={{ color: "var(--color-primary)" }}>대시보드</span>
                <Link href="/programs" style={{ color: "inherit", textDecoration: "none" }}>지원사업</Link>
                <Link href="/business-plan" style={{ color: "inherit", textDecoration: "none" }}>사업계획서</Link>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold"
                style={{ background: "color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))", color: "var(--color-primary)" }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 14h3v6H4zM10.5 9h3v11h-3zM17 4h3v16h-3z" fill="currentColor"/></svg>
                {completedCount}/7
              </span>

              {/* Mobile-only icon shortcuts — sm:hidden text nav means these are the only way in on small screens */}
              <div className="flex items-center gap-1 sm:hidden">
                <Link
                  href="/programs"
                  aria-label="지원사업"
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ color: "var(--color-muted)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="currentColor"/></svg>
                </Link>
                <Link
                  href="/business-plan"
                  aria-label="사업계획서"
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{ color: "var(--color-muted)" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                {isLoggedIn && (
                  <button
                    onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("user"); window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/dashboard/"; }}
                    aria-label="로그아웃"
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                )}
              </div>

              <ThemeSwitcher />
              <span className="hidden h-8 w-8 rounded-full sm:inline-block" style={{ background: "linear-gradient(135deg, var(--color-secondary), var(--color-primary))", border: "1px solid var(--color-border)" }} />
              {isLoggedIn && (
                <button
                  onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("user"); window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/dashboard/"; }}
                  className="hidden rounded-md border px-3 py-1.5 text-[13px] font-semibold sm:inline-flex"
                  style={{ color: "var(--color-muted)", borderColor: "var(--color-border)", background: "none", cursor: "pointer" }}
                >
                  로그아웃
                </button>
              )}
            </div>
          </div>
        </nav>

        <div className="mx-auto max-w-[1200px] px-5 py-6 sm:px-7 sm:py-8">

          {/* Guest Banner */}
          {!isLoggedIn && (
            <div className="glass mb-4 flex flex-col items-start gap-3 rounded-lg p-5 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                로그인하면 진행 상황이 저장되고, AI 초안 생성 기능을 사용할 수 있습니다.
              </p>
              <div className="flex flex-shrink-0 gap-2">
                <Link href="/signup" className="rounded-full px-4 py-2 text-[13px] font-bold no-underline" style={{ color: "var(--color-background)", background: "var(--color-text)" }}>무료 가입</Link>
                <Link href="/login" className="rounded-full border px-4 py-2 text-[13px] font-bold no-underline" style={{ color: "var(--color-text)", borderColor: "var(--color-border)" }}>로그인</Link>
              </div>
            </div>
          )}

          <div className="dash-grid">
            <div style={{ gridArea: "mission" }} className="flex flex-col gap-4">
              <TodayMissionCard {...mission} />
              {justCompletedStep && justCompletedStep >= 1 && (
                <MilestoneCard stepName={STEP_CONTENT[justCompletedStep - 1].name} />
              )}
            </div>

            <div style={{ gridArea: "progress" }}>
              <RoadmapProgressCard completedCount={completedCount} activeStep={activeStep} />
            </div>

            <div style={{ gridArea: "health" }}>
              <ProjectHealthCard completedCount={completedCount} />
            </div>

            <div style={{ gridArea: "recommend" }}>
              <AIRecommendationCard tip={STEP_CONTENT[Math.min(activeStep, 7) - 1].coachTip} />
            </div>

            <div style={{ gridArea: "support" }}>
              <GovernmentSupportCard currentStep={activeStep} />
            </div>

            <div style={{ gridArea: "notify" }}>
              <NotificationCard currentStep={activeStep} />
            </div>

            <div style={{ gridArea: "learning" }}>
              <LearningCard step={Math.min(activeStep, 7)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
