"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Check, Pencil, Save, RefreshCw, ArrowLeft } from "lucide-react";
import { api } from "@/app/lib/api";
import { useToast } from "@/app/components/ui/Toast";
import Button from "@/app/components/ui/Button";

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
          <div style={{ borderTop: i === 0 ? "none" : "1px solid var(--color-border)", marginBottom: 12 }} />
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 15, fontWeight: 800, color: "var(--color-text)",
            background: "color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))", padding: "5px 14px", borderRadius: "var(--radius-sm)",
            marginBottom: 10,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 2, background: "var(--color-primary)", flexShrink: 0, display: "inline-block" }} />
            {line.trim().replace(/^\[|\]$/g, "")}
          </div>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key++} style={{ height: 6 }} />);
    } else {
      elements.push(
        <p key={key++} style={{ fontSize: 14, lineHeight: 1.85, color: "var(--color-muted)", margin: "0 0 4px 0" }}>
          {line}
        </p>
      );
    }
  }
  return elements;
}

const INDIGO = "var(--color-primary)";
const TINT = "color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))";
const TINT_HOVER = "color-mix(in srgb, var(--color-primary) 24%, var(--color-surface))";
const MUTED_TINT = "color-mix(in srgb, var(--color-muted) 12%, var(--color-surface))";
const SUCCESS_TINT = "color-mix(in srgb, var(--color-success) 16%, var(--color-surface))";
const SUCCESS_TINT_STRONG = "color-mix(in srgb, var(--color-success) 26%, var(--color-surface))";

export default function BusinessPlanPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [businessPlan, setBusinessPlan] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
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

        // 저장된 사업계획서 먼저 확인
        const savedRes = await fetch(`${BASE_URL}/roadmap/business-plan?token=${token}`);
        if (savedRes.ok) {
          const savedData = await savedRes.json();
          if (savedData.content) {
            setBusinessPlan(savedData.content);
            setLoadingPlan(false);
            // 피드백만 새로 생성
            setLoadingFeedback(true);
            const fbRes = await fetch(`${BASE_URL}/ai/business-plan/feedback`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ business_plan: savedData.content }),
            });
            if (fbRes.ok) setFeedback((await fbRes.json()).feedback);
            setLoadingFeedback(false);
            return;
          }
        }

        // 저장된 계획 없으면 새로 생성
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

        // 생성 즉시 저장
        await fetch(`${BASE_URL}/roadmap/business-plan/save?token=${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: planData.business_plan }),
        });

        setLoadingFeedback(true);
        const fbRes = await fetch(`${BASE_URL}/ai/business-plan/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ business_plan: planData.business_plan }),
        });
        if (fbRes.ok) setFeedback((await fbRes.json()).feedback);
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
      toast.show("사업계획서가 복사되었습니다");
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSave(textOverride?: string) {
    const planToSave = textOverride ?? businessPlan;
    if (!planToSave) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;
    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/roadmap/business-plan/save?token=${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: planToSave }),
      });
      if (res.ok) {
        setSavedOk(true);
        toast.show("저장되었습니다");
        setTimeout(() => setSavedOk(false), 2000);
      } else {
        toast.show("저장에 실패했습니다", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  function handleEditStart() {
    setEditText(businessPlan ?? "");
    setIsEditing(true);
  }

  async function handleEditSave() {
    setBusinessPlan(editText);
    setIsEditing(false);
    await handleSave(editText);
  }

  async function handleRefreshFeedback(planText?: string) {
    const plan = planText ?? businessPlan;
    if (!plan) return;
    setLoadingFeedback(true);
    setFeedback(null);
    try {
      const fbRes = await fetch(`${BASE_URL}/ai/business-plan/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ business_plan: plan }),
      });
      if (fbRes.ok) setFeedback((await fbRes.json()).feedback);
    } finally {
      setLoadingFeedback(false);
    }
  }

  function handleEditCancel() {
    setIsEditing(false);
    setEditText("");
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = (process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/dashboard/";
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "var(--color-background)" }}>
      {/* Ambient blurred color blobs — kept subtle so the long-form document stays readable */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
          background:
            "radial-gradient(circle at 10% 4%, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 40%)," +
            "radial-gradient(circle at 94% 10%, color-mix(in srgb, var(--color-accent) 10%, transparent) 0%, transparent 38%)," +
            "radial-gradient(circle at 20% 98%, color-mix(in srgb, var(--color-secondary) 10%, transparent) 0%, transparent 44%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, fontFamily: "'Pretendard', sans-serif", color: "var(--color-text)" }}>

        {/* NAV */}
        <nav className="glass" style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", height: 64, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }} className="md:!px-7">
            <div style={{ display: "flex", alignItems: "center", gap: 18, minWidth: 0 }}>
              <Link href="/" style={{ fontFamily: "var(--font-geist,'Geist',sans-serif)", fontWeight: 800, fontSize: 21, color: "var(--color-text)", letterSpacing: "-0.01em", textDecoration: "none", flexShrink: 0 }}>StepUp</Link>
              <Link href="/dashboard" className="hidden md:inline-flex" style={{ alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: INDIGO, textDecoration: "none", padding: "5px 12px", borderRadius: "var(--radius-sm)", background: TINT }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill={INDIGO}/><rect x="14" y="3" width="7" height="7" rx="1.5" fill={INDIGO}/><rect x="3" y="14" width="7" height="7" rx="1.5" fill={INDIGO}/><rect x="14" y="14" width="7" height="7" rx="1.5" fill={INDIGO}/></svg>
                대시보드
              </Link>
              <span className="hidden md:inline" style={{ fontSize: 13, color: "var(--color-muted)", paddingLeft: 18, borderLeft: "1px solid var(--color-border)" }}>사업계획서</span>
              <Link href="/dashboard" aria-label="대시보드" className="flex md:hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-full" style={{ background: TINT }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill={INDIGO}/><rect x="14" y="3" width="7" height="7" rx="1.5" fill={INDIGO}/><rect x="3" y="14" width="7" height="7" rx="1.5" fill={INDIGO}/><rect x="14" y="14" width="7" height="7" rx="1.5" fill={INDIGO}/></svg>
              </Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="md:!gap-4">
              <span className="hidden sm:inline-flex" style={{ alignItems: "center", gap: 6, background: TINT, color: INDIGO, fontWeight: 700, fontSize: 13, padding: "5px 12px", borderRadius: "var(--radius-full)" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" fill={INDIGO}/></svg>
                완성
              </span>
              <span className="hidden sm:inline-block" style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--color-secondary), var(--color-primary))" }} />
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="hidden md:inline-flex"
                  style={{ alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600, color: "var(--color-muted)", background: "none", border: "1px solid var(--color-border)", padding: "5px 12px", borderRadius: "var(--radius-sm)", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--color-error)"; e.currentTarget.style.borderColor = "var(--color-error)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-muted)"; e.currentTarget.style.borderColor = "var(--color-border)"; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  로그아웃
                </button>
              )}
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  aria-label="로그아웃"
                  className="flex md:hidden h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ color: "var(--color-muted)", background: "none", border: "none", cursor: "pointer" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* BODY */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px 60px" }} className="md:!px-7 md:!pt-8">

          {/* Page header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: INDIGO, background: TINT, padding: "3px 10px", borderRadius: "var(--radius-full)", letterSpacing: "0.04em" }}>COMPLETE</span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--color-text)", margin: 0, letterSpacing: "-0.02em" }} className="md:!text-[26px]">나의 사업계획서</h1>
            <p style={{ fontSize: 13.5, color: "var(--color-muted)", marginTop: 6 }}>7단계 로드맵을 바탕으로 AI가 작성한 사업계획서입니다. 자유롭게 수정해 활용하세요.</p>
          </div>

          {/* Primary action — copying/exporting the plan is the one thing this screen exists for */}
          {!isEditing && (
            <div className="mb-5">
              <Button variant="primary" size="lg" onClick={handleCopy} disabled={!businessPlan} className="w-full sm:w-auto rounded-full">
                {copied ? <Check size={17} /> : <Copy size={17} />}
                {copied ? "복사됨!" : "사업계획서 복사하기"}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[1fr_340px] gap-6 items-start">

            {/* LEFT: 사업계획서 */}
            <div>
              {/* Toolbar — secondary actions only, copy CTA lives above as the primary action */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-text)" }}>전체 사업계획서</span>
                <div style={{ display: "flex", gap: 8 }}>
                  {!isEditing ? (
                    <>
                      <button
                        onClick={handleEditStart}
                        disabled={!businessPlan}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          fontSize: 13, fontWeight: 600, color: "var(--color-muted)",
                          background: MUTED_TINT, border: "none", padding: "7px 16px", borderRadius: "var(--radius-sm)",
                          cursor: businessPlan ? "pointer" : "not-allowed",
                        }}
                      >
                        <Pencil size={14} />
                        편집
                      </button>
                      <button
                        onClick={() => handleSave()}
                        disabled={!businessPlan || saving}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          fontSize: 13, fontWeight: 600,
                          color: "var(--color-success)",
                          background: savedOk ? SUCCESS_TINT_STRONG : SUCCESS_TINT,
                          border: "none", padding: "7px 16px", borderRadius: "var(--radius-sm)",
                          cursor: businessPlan && !saving ? "pointer" : "not-allowed",
                        }}
                      >
                        {savedOk ? (<><Check size={14} />저장됨!</>) : (<><Save size={14} />{saving ? "저장 중..." : "저장"}</>)}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleEditCancel}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          fontSize: 13, fontWeight: 600, color: "var(--color-muted)",
                          background: MUTED_TINT, border: "none", padding: "7px 16px", borderRadius: "var(--radius-sm)", cursor: "pointer",
                        }}
                      >
                        취소
                      </button>
                      <button
                        onClick={handleEditSave}
                        disabled={saving}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          fontSize: 13, fontWeight: 600, color: "var(--color-background)",
                          background: "var(--color-text)", border: "none", padding: "7px 16px", borderRadius: "var(--radius-sm)",
                          cursor: saving ? "not-allowed" : "pointer",
                        }}
                      >
                        {savedOk ? (
                          <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="var(--color-background)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>저장됨!</>
                        ) : (
                          <>{saving ? "저장 중..." : "저장 완료"}</>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="glass" style={{ background: isEditing ? "var(--glass-bg)" : undefined, border: isEditing ? `2px solid ${INDIGO}` : undefined, borderRadius: "var(--radius-md)", padding: "28px 32px", minHeight: 500 }}>
                {loadingPlan ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400, gap: 18 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {[0, 150, 300].map((d, i) => (
                        <span key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: INDIGO, display: "inline-block", animation: "bounce 1.2s infinite", animationDelay: `${d}ms`, opacity: 0.7 }} />
                      ))}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-text)", marginBottom: 6 }}>AI가 사업계획서를 작성 중입니다</div>
                      <div style={{ fontSize: 13, color: "var(--color-muted)" }}>7단계 내용을 분석하고 있어요. 30초 정도 소요됩니다.</div>
                    </div>
                  </div>
                ) : error ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--color-error)" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>오류가 발생했습니다</div>
                    <div style={{ fontSize: 13, color: "var(--color-muted)" }}>{error}</div>
                    <button onClick={() => { hasFetched.current = false; window.location.reload(); }} style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: INDIGO, background: TINT, border: "none", padding: "8px 18px", borderRadius: "var(--radius-sm)", cursor: "pointer" }}>다시 시도</button>
                  </div>
                ) : isEditing ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{
                      width: "100%", minHeight: 600, border: "none", outline: "none",
                      fontSize: 14, lineHeight: 1.85, color: "var(--color-muted)",
                      fontFamily: "Pretendard, sans-serif", resize: "vertical",
                      background: "transparent",
                    }}
                  />
                ) : businessPlan ? (
                  <div style={{ userSelect: "text" }}>
                    {renderPlan(businessPlan)}
                  </div>
                ) : null}
              </div>
            </div>

            {/* RIGHT: 코치 요다 피드백 */}
            <div style={{ position: "sticky", top: 88 }}>
              <div className="glass" style={{ borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                {/* Header — the one hero gradient moment on this page */}
                <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(150deg, var(--color-primary) 0%, var(--color-secondary) 55%, var(--color-accent) 100%)", padding: "16px 20px" }}>
                  <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: "linear-gradient(115deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 68%, rgba(255,255,255,0.12) 100%)",
                  }} />
                  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
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
                      <div style={{ fontSize: 13, color: "var(--color-muted)", textAlign: "center" }}>
                        {loadingPlan ? "사업계획서 생성 후 분석합니다" : "사업계획서를 꼼꼼히 읽는 중이에요..."}
                      </div>
                    </div>
                  ) : feedback ? (
                    <p style={{ fontSize: 13.5, lineHeight: 1.8, color: "var(--color-muted)", margin: 0, whiteSpace: "pre-line" }}>{feedback}</p>
                  ) : (
                    <p style={{ fontSize: 13, color: "var(--color-muted)", textAlign: "center", padding: "24px 0" }}>피드백을 불러오지 못했습니다.</p>
                  )}
                </div>

                {/* Footer — 재요청 버튼 */}
                {!loadingPlan && !loadingFeedback && (
                  <div style={{ borderTop: "1px solid var(--color-border)", padding: "12px 20px", background: "color-mix(in srgb, var(--color-primary) 4%, transparent)" }}>
                    <div style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.6, marginBottom: 8 }}>
                      사업계획서를 편집한 후 새 피드백을 받고 싶다면 아래 버튼을 눌러주세요.
                    </div>
                    <button
                      onClick={() => handleRefreshFeedback()}
                      style={{
                        width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                        fontSize: 13, fontWeight: 600, color: INDIGO,
                        background: TINT, border: "none", padding: "9px 0", borderRadius: "var(--radius-sm)", cursor: "pointer",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = TINT_HOVER; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = TINT; }}
                    >
                      <RefreshCw size={14} />
                      피드백 다시 받기
                    </button>
                  </div>
                )}
              </div>

              {/* Back to step 7 */}
              <Link href="/roadmap/7" className="glass" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 12, fontSize: 13, fontWeight: 600, color: "var(--color-muted)", textDecoration: "none", padding: "10px", borderRadius: "var(--radius-md)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = INDIGO; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "var(--color-muted)"; }}
              >
                <ArrowLeft size={14} />
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
    </div>
  );
}
