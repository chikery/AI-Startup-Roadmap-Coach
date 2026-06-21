"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/app/lib/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function renderPlan(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isSection = /^\[.+\]$/.test(line.trim());

    if (isSection) {
      elements.push(
        <div key={key++} style={{ marginTop: i === 0 ? 0 : 28 }}>
          <div style={{ borderTop: i === 0 ? "none" : "1px solid #E8EAEE", marginBottom: 12 }} />
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 15, fontWeight: 800, color: "#2F3E72",
            background: "#ECECFB", padding: "5px 14px", borderRadius: 8,
            marginBottom: 10,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 2, background: "#5A5BD6", flexShrink: 0, display: "inline-block" }} />
            {line.trim().replace(/^\[|\]$/g, "")}
          </div>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key++} style={{ height: 6 }} />);
    } else {
      elements.push(
        <p key={key++} style={{ fontSize: 14, lineHeight: 1.85, color: "#42506B", margin: "0 0 4px 0" }}>
          {line}
        </p>
      );
    }
  }
  return elements;
}

export default function BusinessPlanPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [businessPlan, setBusinessPlan] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }
    setIsLoggedIn(true);
    if (hasFetched.current) return;
    hasFetched.current = true;

    (async () => {
      try {
        setLoadingPlan(true);
        const progress = await api.roadmap.getProgress() as any[];
        const all_content: Record<string, any> = {};
        for (const p of progress) {
          if (p.content) all_content[String(p.step)] = p.content;
        }

        const planRes = await fetch(`${BASE_URL}/ai/business-plan`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, all_content }),
        });
        if (!planRes.ok) throw new Error("사업계획서 생성에 실패했습니다");
        const planData = await planRes.json();
        setBusinessPlan(planData.business_plan);
        setLoadingPlan(false);

        setLoadingFeedback(true);
        const fbRes = await fetch(`${BASE_URL}/ai/business-plan/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ business_plan: planData.business_plan }),
        });
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          setFeedback(fbData.feedback);
        }
      } catch (e: any) {
        setError(e.message || "오류가 발생했습니다");
        setLoadingPlan(false);
      } finally {
        setLoadingFeedback(false);
      }
    })();
  }, [router]);

  function handleCopy() {
    if (!businessPlan) return;
    navigator.clipboard.writeText(businessPlan).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/dashboard/";
  }

  const INDIGO = "#5A5BD6";

  return (
    <div style={{ fontFamily: "'Pretendard', sans-serif", background: "#F5F6F8", color: "#1F2436", minHeight: "100vh" }}>

      {/* NAV */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #E8EAEE", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 64, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Link href="/" style={{ fontFamily: "var(--font-bricolage,'Bricolage Grotesque',sans-serif)", fontWeight: 800, fontSize: 21, color: "#2F3E72", letterSpacing: "-0.01em", textDecoration: "none" }}>StepUp</Link>
            <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: INDIGO, textDecoration: "none", padding: "5px 12px", borderRadius: 8, background: "#ECECFB" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill={INDIGO}/><rect x="14" y="3" width="7" height="7" rx="1.5" fill={INDIGO}/><rect x="3" y="14" width="7" height="7" rx="1.5" fill={INDIGO}/><rect x="14" y="14" width="7" height="7" rx="1.5" fill={INDIGO}/></svg>
              대시보드
            </Link>
            <span style={{ fontSize: 13, color: "#9198A6", paddingLeft: 18, borderLeft: "1px solid #E8EAEE" }}>사업계획서</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ECECFB", color: INDIGO, fontWeight: 700, fontSize: 13, padding: "5px 12px", borderRadius: 100 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" fill={INDIGO}/></svg>
              완성
            </span>
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#8E9BD6,#5A5BD6)", display: "inline-block" }} />
            {isLoggedIn && (
              <button
                onClick={handleLogout}
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

      {/* BODY */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 28px 60px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: INDIGO, background: "#ECECFB", padding: "3px 10px", borderRadius: 100, letterSpacing: "0.04em" }}>COMPLETE</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#2F3E72", margin: 0, letterSpacing: "-0.02em" }}>나의 사업계획서</h1>
          <p style={{ fontSize: 14, color: "#9198A6", marginTop: 6 }}>7단계 로드맵을 바탕으로 AI가 작성한 사업계획서입니다. 자유롭게 수정해 활용하세요.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

          {/* LEFT: 사업계획서 */}
          <div>
            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#2F3E72" }}>전체 사업계획서</span>
              <button
                onClick={handleCopy}
                disabled={!businessPlan}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 13, fontWeight: 600,
                  color: copied ? "#15803D" : INDIGO,
                  background: copied ? "#F0FDF4" : "#ECECFB",
                  border: "none", padding: "7px 16px", borderRadius: 8,
                  cursor: businessPlan ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                }}
              >
                {copied ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    복사됨!
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke={INDIGO} strokeWidth="1.8"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={INDIGO} strokeWidth="1.8" strokeLinecap="round"/></svg>
                    전체 복사
                  </>
                )}
              </button>
            </div>

            <div style={{ background: "#fff", border: "1px solid #E8EAEE", borderRadius: 16, padding: "28px 32px", minHeight: 500 }}>
              {loadingPlan ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 18 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[0, 150, 300].map((d, i) => (
                      <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: INDIGO, display: "inline-block", animation: "bounce 1.2s infinite", animationDelay: `${d}ms`, opacity: 0.7 }} />
                    ))}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#2F3E72", marginBottom: 6 }}>AI가 사업계획서를 작성 중입니다</div>
                    <div style={{ fontSize: 13, color: "#9198A6" }}>7단계 내용을 분석하고 있어요. 30초 정도 소요됩니다.</div>
                  </div>
                </div>
              ) : error ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#E53E3E" }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>오류가 발생했습니다</div>
                  <div style={{ fontSize: 13, color: "#9198A6" }}>{error}</div>
                  <button onClick={() => { hasFetched.current = false; window.location.reload(); }} style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: INDIGO, background: "#ECECFB", border: "none", padding: "8px 18px", borderRadius: 8, cursor: "pointer" }}>다시 시도</button>
                </div>
              ) : businessPlan ? (
                <div style={{ userSelect: "text" }}>
                  {renderPlan(businessPlan)}
                </div>
              ) : null}
            </div>
          </div>

          {/* RIGHT: 코치 요다 피드백 */}
          <div style={{ position: "sticky", top: 88 }}>
            <div style={{ background: "#fff", border: "1px solid #E8EAEE", borderRadius: 16, overflow: "hidden" }}>
              {/* Header */}
              <div style={{ background: "linear-gradient(135deg, #5A5BD6 0%, #4849C0 100%)", padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🤖</div>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>코치 요다의 피드백</div>
                    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                      전체 사업계획서 분석 중
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "20px" }}>
                {loadingPlan || loadingFeedback ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", padding: "24px 0" }}>
                    <div style={{ display: "flex", gap: 5 }}>
                      {[0, 150, 300].map((d, i) => (
                        <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: INDIGO, display: "inline-block", animation: "bounce 1.2s infinite", animationDelay: `${d}ms`, opacity: 0.6 }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 13, color: "#9198A6", textAlign: "center" }}>
                      {loadingPlan ? "사업계획서 생성 후 분석합니다" : "사업계획서를 꼼꼼히 읽는 중이에요..."}
                    </div>
                  </div>
                ) : feedback ? (
                  <p style={{ fontSize: 13.5, lineHeight: 1.8, color: "#42506B", margin: 0, whiteSpace: "pre-line" }}>{feedback}</p>
                ) : (
                  <p style={{ fontSize: 13, color: "#9198A6", textAlign: "center", padding: "24px 0" }}>피드백을 불러오지 못했습니다.</p>
                )}
              </div>

              {/* Footer tip */}
              {feedback && (
                <div style={{ borderTop: "1px solid #EEF0F3", padding: "12px 20px", background: "#FAFAFE" }}>
                  <div style={{ fontSize: 12, color: "#9198A6", lineHeight: 1.6 }}>
                    사업계획서 내용을 직접 수정하고 싶다면 각 단계로 돌아가 수정 후 다시 방문하세요.
                  </div>
                </div>
              )}
            </div>

            {/* Back to step 7 */}
            <Link href="/roadmap/7" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, fontSize: 13, fontWeight: 600, color: "#9198A6", textDecoration: "none", padding: "10px", borderRadius: 10, border: "1px solid #E8EAEE", background: "#fff" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = INDIGO; e.currentTarget.style.color = INDIGO; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E8EAEE"; e.currentTarget.style.color = "#9198A6"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              7단계로 돌아가기
            </Link>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
