"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";
import { SUPPORT_PROGRAMS, isExpired, daysLeft } from "@/app/lib/support-programs";

interface StepStatus {
  step: number;
  is_completed: boolean;
}

const STEP_INFO = [
  { name: "아이디어 스파크", desc: "해결할 문제와 고객을 명확히 정의할 차례입니다." },
  { name: "예술적 비전", desc: "당신만의 독창성을 시장의 언어로 번역합니다." },
  { name: "시장 적합성", desc: "시장 규모와 경쟁사를 데이터로 분석합니다." },
  { name: "재무 지도", desc: "수익 구조와 비즈니스 모델을 완성합니다." },
  { name: "투자 유치", desc: "자금 계획과 지원사업을 연결합니다." },
  { name: "팀 빌딩", desc: "팀 구성과 실행 체계를 설계합니다." },
  { name: "런칭 데이", desc: "피치덱과 런칭 준비를 완성합니다." },
];

const STEP_ICONS = [
  <path key="1" d="M12 2a7 7 0 00-4 12.7V17a2 2 0 002 2h4a2 2 0 002-2v-2.3A7 7 0 0012 2zM9 22h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>,
  <><circle key="2a" cx="13.5" cy="6.5" r="2.5" stroke="currentColor" strokeWidth="1.7"/><circle key="2b" cx="6.5" cy="11.5" r="2" stroke="currentColor" strokeWidth="1.7"/><circle key="2c" cx="15" cy="15" r="2" stroke="currentColor" strokeWidth="1.7"/><path key="2d" d="M5 19c2-3 9-4 12-1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></>,
  <path key="3" d="M8 19a5 5 0 100-10 5 5 0 000 10zM3 5h6M6 3v4M16 21l5-5M14 14h6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>,
  <><rect key="4a" x="2" y="6" width="20" height="13" rx="2.5" stroke="currentColor" strokeWidth="1.7"/><circle key="4b" cx="12" cy="12.5" r="2.5" stroke="currentColor" strokeWidth="1.7"/></>,
  <><circle key="5a" cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7"/><path key="5b" d="M21 21l-4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></>,
  <><circle key="6a" cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.7"/><circle key="6b" cx="17" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.7"/><path key="6c" d="M3 19c0-3 2.7-5 6-5s6 2 6 5M15.5 19c0-2 1-3.4 3-3.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></>,
  <path key="7" d="M5 19c-1.5 1.5-2 4-2 4s2.5-.5 4-2M14.5 4.5C17 2 21 2 21 2s0 4-2.5 6.5L12 15l-3-3 5.5-7.5z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>,
];

const TINT = "color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))";
const TINT_BORDER = "color-mix(in srgb, var(--color-primary) 30%, transparent)";
const SUCCESS_TINT = "color-mix(in srgb, var(--color-success) 16%, var(--color-surface))";
const ACCENT_TINT = "color-mix(in srgb, var(--color-accent) 18%, var(--color-surface))";
const ACCENT_BORDER = "color-mix(in srgb, var(--color-accent) 45%, transparent)";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [progress, setProgress] = useState<StepStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPlan, setHasPlan] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
    setIsLoggedIn(!!token);

    if (token) {
      api.roadmap.getProgress()
        .then((data: any) => setProgress(data))
        .catch(() => {})
        .finally(() => setLoading(false));

      fetch(`${BASE_URL}/roadmap/business-plan?token=${token}`)
        .then(r => r.json())
        .then(d => setHasPlan(!!d.content))
        .catch(() => {});
    } else {
      setLoading(false);
    }
  }, []);

  const completedCount = progress.filter((s) => s.is_completed).length;
  const pct = Math.round((completedCount / 7) * 100);
  const nextStep = Math.min(completedCount + 1, 7);
  const nextInfo = STEP_INFO[nextStep - 1];
  const activeStep = nextStep; // 1-indexed current/active step

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
            "radial-gradient(circle at 12% 6%, color-mix(in srgb, var(--color-primary) 20%, transparent) 0%, transparent 42%)," +
            "radial-gradient(circle at 92% 12%, color-mix(in srgb, var(--color-accent) 18%, transparent) 0%, transparent 40%)," +
            "radial-gradient(circle at 22% 96%, color-mix(in srgb, var(--color-secondary) 18%, transparent) 0%, transparent 46%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, fontFamily: "Pretendard, sans-serif", color: "var(--color-text)" }}>

        {/* TOP NAV */}
        <nav className="glass" style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: 1240, margin: "0 auto", height: 64, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
              <Link href="/" style={{ fontFamily: "var(--font-geist, 'Geist', sans-serif)", fontWeight: 800, fontSize: 21, color: "var(--color-text)", letterSpacing: "-0.01em", textDecoration: "none" }}>StepUp</Link>
              <div style={{ display: "flex", alignItems: "center", gap: 26, fontSize: 14.5, fontWeight: 600, color: "var(--color-muted)" }}>
                <span style={{ color: "var(--color-primary)", borderBottom: "2px solid var(--color-primary)", paddingBottom: 21, cursor: "default" }}>대시보드</span>
                <Link href="/programs" style={{ color: "inherit", textDecoration: "none" }}>나의 여정</Link>
                <Link href="/programs" style={{ color: "inherit", textDecoration: "none" }}>지원사업</Link>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: TINT, color: "var(--color-primary)", fontWeight: 700, fontSize: 13, padding: "6px 12px", borderRadius: "var(--radius-full)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 14h3v6H4zM10.5 9h3v11h-3zM17 4h3v16h-3z" fill="currentColor"/></svg>
                {completedCount}/7
              </span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" stroke="var(--color-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3.2" stroke="var(--color-muted)" strokeWidth="1.8"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3" stroke="var(--color-muted)" strokeWidth="1.8" strokeLinecap="round"/></svg>
              <span style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--color-secondary), var(--color-primary))", display: "inline-block", border: "1px solid var(--color-border)" }}></span>
              {isLoggedIn && (
                <button
                  onClick={() => { localStorage.removeItem("access_token"); localStorage.removeItem("user"); window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/dashboard/"; }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "var(--color-muted)", background: "none", border: "1px solid var(--color-border)", padding: "5px 12px", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-error)"; e.currentTarget.style.borderColor = "var(--color-error)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-muted)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  로그아웃
                </button>
              )}
            </div>
          </div>
        </nav>

        <div style={{ maxWidth: 1240, margin: "0 auto", padding: 28, display: "grid", gridTemplateColumns: "262px 1fr", gap: 24, alignItems: "start" }}>

          {/* SIDEBAR */}
          <aside className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "22px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 6px 16px" }}>
              <span style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)", background: "var(--color-primary)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M5 19c-1.5 1.5-2 4-2 4s2.5-.5 4-2M14.5 4.5C17 2 21 2 21 2s0 4-2.5 6.5L12 15l-3-3 5.5-7.5zM9 12l-3 3M12 15l-3 3" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>창업 로드맵</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 3 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--color-primary)" }}>{pct}%</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 14h3v6H4zM10.5 9h3v11h-3zM17 4h3v16h-3z" fill="var(--color-primary)"/></svg>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {STEP_INFO.map((s, i) => {
                const stepNum = i + 1;
                const isActive = stepNum === activeStep;
                return (
                  <Link
                    key={stepNum}
                    href={`/roadmap/${stepNum}`}
                    style={{
                      display: "flex", alignItems: "center", gap: 11,
                      padding: "10px 11px", borderRadius: "var(--radius-sm)",
                      fontSize: 13.5, fontWeight: isActive ? 700 : 600,
                      color: isActive ? "var(--color-primary)" : "var(--color-muted)",
                      background: isActive ? TINT : "transparent",
                      textDecoration: "none",
                    }}
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                      style={{ color: isActive ? "var(--color-primary)" : "var(--color-muted)", flexShrink: 0 }}>
                      {STEP_ICONS[i]}
                    </svg>
                    {s.name}
                  </Link>
                );
              })}
            </div>

            <div style={{ borderTop: "1px solid var(--color-border)", margin: "16px 0" }}></div>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
              style={{ width: "100%", cursor: "pointer", fontFamily: "inherit", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--color-text)", color: "var(--color-background)", border: "none", padding: 12, borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 700 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3zM19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z" fill="currentColor"/></svg>
              AI 인사이트 받기
            </button>

            <div style={{ borderTop: "1px solid var(--color-border)", margin: "8px 0" }}></div>

            <Link
              href="/business-plan"
              style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "10px 11px", borderRadius: "var(--radius-sm)",
                fontSize: 13.5, fontWeight: 600,
                color: hasPlan ? "var(--color-success)" : "var(--color-muted)",
                background: hasPlan ? SUCCESS_TINT : "transparent",
                textDecoration: "none",
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              내 사업계획서 {hasPlan ? "보기" : "(미작성)"}
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "14px 11px 4px", fontSize: 13, color: "var(--color-muted)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.7"/><path d="M9.5 9.5a2.5 2.5 0 113.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>
              고객센터
            </div>
          </aside>

          {/* MAIN */}
          <main style={{ display: "flex", flexDirection: "column", gap: 22 }}>

            {/* Guest Banner */}
            {!isLoggedIn && (
              <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <p style={{ fontSize: 14, color: "var(--color-text)", margin: 0, fontWeight: 500 }}>
                  로그인하면 진행 상황이 저장되고, AI 초안 생성 기능을 사용할 수 있습니다.
                </p>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <Link href="/signup" style={{ fontSize: 13, fontWeight: 700, color: "var(--color-background)", background: "var(--color-text)", padding: "9px 18px", borderRadius: "var(--radius-full)", textDecoration: "none" }}>무료 가입</Link>
                  <Link href="/login" style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)", background: "transparent", border: "1px solid var(--color-border)", padding: "9px 18px", borderRadius: "var(--radius-full)", textDecoration: "none" }}>로그인</Link>
                </div>
              </div>
            )}

            {/* Status Card — the one "hero" gradient moment on this page */}
            <div style={{
              position: "relative", overflow: "hidden",
              background: "linear-gradient(150deg, var(--color-primary) 0%, var(--color-secondary) 55%, var(--color-accent) 100%)",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "var(--radius-lg)", padding: "26px 28px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 20px 40px -20px color-mix(in srgb, var(--color-primary) 55%, transparent)",
              color: "#fff",
            }}>
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "linear-gradient(115deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 68%, rgba(255,255,255,0.12) 100%)",
              }} />
              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", margin: 0 }}>지금 너의 상태</h1>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", margin: "9px 0 0" }}>
                    {isLoggedIn
                      ? `${user?.name ? `${user.name}님, ` : ""}성공적인 창업을 향한 다음 단계가 기다리고 있습니다.`
                      : "로그인하고 나만의 창업 여정을 시작해보세요."}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 26, flexShrink: 0, textAlign: "right" }}>
                  <div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>현재 단계</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 3 }}>{completedCount}/7</div>
                  </div>
                  <div style={{ borderLeft: "1px solid rgba(255,255,255,0.3)", paddingLeft: 26 }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>매칭된 지원사업</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginTop: 3, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                      2
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 14h3v6H4zM10.5 9h3v11h-3zM17 4h3v16h-3z" fill="#fff"/></svg>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 22, marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>전체 달성도</span>
                <span style={{ fontSize: 13, color: "#fff", fontWeight: 800 }}>{pct}%</span>
              </div>
              <div style={{ position: "relative", height: 9, background: "rgba(255,255,255,0.28)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: "#fff", borderRadius: "var(--radius-full)", transition: "width 0.5s ease" }}></div>
              </div>
            </div>

            {/* Next Task + Milestone */}
            <div style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 22, alignItems: "stretch" }}>
              {/* Next Task */}
              <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "26px 28px", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ background: TINT, color: "var(--color-primary)", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: "var(--radius-sm)" }}>STEP {nextStep}</span>
                  <span style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 600 }}>다음 과제</span>
                </div>
                <h2 style={{ fontSize: 23, fontWeight: 800, margin: "14px 0 0", color: "var(--color-text)" }}>{nextInfo.name}</h2>
                <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--color-muted)", margin: "12px 0 0" }}>{nextInfo.desc}</p>
                <div style={{ background: "color-mix(in srgb, var(--color-surface) 60%, transparent)", border: `1px solid ${TINT_BORDER}`, borderRadius: "var(--radius-md)", padding: "15px 16px", margin: "20px 0 0", display: "flex", gap: 13 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0, color: "var(--color-primary)", fontWeight: 800, fontSize: 14 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3c-1 3-2 4-5 5 3 1 4 2 5 5 1-3 2-4 5-5-3-1-4-2-5-5z" fill="var(--color-success)"/></svg>RK
                  </span>
                  <div>
                    <div style={{ fontSize: 11.5, color: "var(--color-muted)", fontWeight: 700, marginBottom: 4 }}>AI 코치 요다</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--color-text)" }}>"지금 이 단계를 완성하면 다음 지원사업 신청에 한 발 더 가까워집니다!"</div>
                  </div>
                </div>
                <Link href={`/roadmap/${nextStep}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9, background: "var(--color-text)", color: "var(--color-background)", padding: 15, borderRadius: "var(--radius-md)", fontSize: 15, fontWeight: 700, marginTop: 20, textDecoration: "none" }}>
                  작업 시작하기
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </div>

              {/* Milestone */}
              <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: 26, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 30, right: 30, width: 120, height: 90, background: "color-mix(in srgb, var(--color-primary) 12%, transparent)", borderRadius: "var(--radius-md)", transform: "rotate(8deg)" }}></div>
                <div style={{ position: "absolute", top: 42, right: 42, width: 120, height: 90, background: "color-mix(in srgb, var(--color-accent) 12%, transparent)", borderRadius: "var(--radius-md)", transform: "rotate(-6deg)" }}></div>
                <span style={{ position: "relative", zIndex: 2, width: 62, height: 62, borderRadius: "50%", background: "var(--color-surface)", boxShadow: "0 8px 20px -8px color-mix(in srgb, var(--color-primary) 45%, transparent)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M5 21V4M5 4c3-1.5 6 1.5 9 0s5-1 5-1v9s-2-.5-5 1-6-1.5-9 0" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <div style={{ position: "relative", zIndex: 2, fontSize: 16, fontWeight: 800, marginTop: 16, color: "var(--color-text)" }}>다음 마일스톤</div>
                <div style={{ position: "relative", zIndex: 2, fontSize: 13.5, color: "var(--color-muted)", marginTop: 5 }}>시드 펀딩 지원 자격 획득</div>
              </div>
            </div>

            {/* 지원사업 매칭 */}
            <div className="glass" style={{ borderRadius: "var(--radius-lg)", padding: "24px 26px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="var(--color-accent)"/></svg>
                <span style={{ fontSize: 16, fontWeight: 800, color: "var(--color-text)" }}>지원사업 매칭</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-muted)", marginLeft: 4 }}>현재 단계에 맞는 지원사업이 강조 표시됩니다</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                {SUPPORT_PROGRAMS.map((p, i) => {
                  const expired = isExpired(p.deadline);
                  const left = daysLeft(p.deadline);
                  const isMatched = p.steps.includes(nextStep);
                  return (
                    <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                      style={{
                        display: "block", padding: "13px 14px", borderRadius: "var(--radius-sm)",
                        textDecoration: "none", transition: "all 0.15s",
                        background: expired ? "transparent" : isMatched ? ACCENT_TINT : "color-mix(in srgb, var(--color-surface) 45%, transparent)",
                        border: `1.5px solid ${expired ? "var(--color-border)" : isMatched ? ACCENT_BORDER : "var(--color-border)"}`,
                        opacity: expired ? 0.55 : 1,
                        boxShadow: isMatched && !expired ? "0 2px 10px -4px color-mix(in srgb, var(--color-accent) 45%, transparent)" : "none",
                      }}
                      onMouseEnter={(e) => { if (!expired) e.currentTarget.style.borderColor = isMatched ? "var(--color-accent)" : "color-mix(in srgb, var(--color-text) 25%, transparent)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = expired ? "var(--color-border)" : isMatched ? ACCENT_BORDER : "var(--color-border)"; }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: expired ? "var(--color-muted)" : "var(--color-text)", lineHeight: 1.4 }}>{p.name}</div>
                        {isMatched && !expired && (
                          <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 800, background: "var(--color-accent)", color: "#fff", padding: "2px 7px", borderRadius: "var(--radius-full)", whiteSpace: "nowrap" }}>현재 단계</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--color-muted)", lineHeight: 1.5, marginBottom: 8 }}>{p.description}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: expired ? "var(--color-muted)" : left <= 7 ? "var(--color-error)" : isMatched ? "var(--color-accent)" : "var(--color-muted)" }}>
                          {expired ? "마감" : `D-${left} · ${p.deadline.slice(5).replace("-", "/")}`}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--color-muted)" }}>{p.maxSupport}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
