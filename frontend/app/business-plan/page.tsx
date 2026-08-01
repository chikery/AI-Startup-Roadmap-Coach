"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Check, Pencil, Save, RefreshCw, ArrowLeft } from "lucide-react";
import { api } from "@/app/lib/api";
import { useToast } from "@/app/components/ui/Toast";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import ThemeSwitcher from "@/app/components/ui/ThemeSwitcher";
import BottomNav from "@/app/components/ui/BottomNav";
import Drawer from "@/app/components/ui/Drawer";
import PoweredBySolar from "@/app/components/ui/PoweredBySolar";
import NotificationList from "@/app/components/ui/NotificationList";
import { NOTIFICATIONS } from "@/app/lib/notifications-data";
import { cn } from "@/app/lib/cn";

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
        <div key={key++} className={i === 0 ? "mt-0" : "mt-7"}>
          <div className={cn("mb-3", i === 0 ? "border-t-0" : "border-t border-border")} />
          <div className="mb-2.5 inline-flex items-center gap-2 rounded-sm bg-[color-mix(in_srgb,var(--color-primary)_14%,var(--color-surface))] px-[14px] py-[5px] text-[15px] font-extrabold text-text">
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-[2px] bg-primary" />
            {line.trim().replace(/^\[|\]$/g, "")}
          </div>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={key++} className="h-1.5" />);
    } else {
      elements.push(
        <p key={key++} className="mb-1 text-[14px] leading-[1.85] text-muted">
          {line}
        </p>
      );
    }
  }
  return elements;
}

const INDIGO = "var(--color-primary)";

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
    <div className="relative min-h-screen bg-background">
      {/* Ambient blurred color blobs — kept subtle so the long-form document stays readable */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 10% 4%, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 40%)," +
            "radial-gradient(circle at 94% 10%, color-mix(in srgb, var(--color-accent) 10%, transparent) 0%, transparent 38%)," +
            "radial-gradient(circle at 20% 98%, color-mix(in srgb, var(--color-secondary) 10%, transparent) 0%, transparent 44%)",
        }}
      />

      <div className="relative z-[1] font-['Pretendard',_sans-serif] text-text">

        {/* NAV — desktop unchanged; mobile trimmed to logo + a single "더보기" drawer trigger
             (theme + logout), since 대시보드 이동은 이제 BottomNav가 담당 */}
        <nav className="glass sticky top-0 z-10 rounded-none border-l-0 border-r-0 border-t-0">
          <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 md:px-7">
            <div className="flex min-w-0 items-center gap-[18px]">
              <Link href="/" className="shrink-0 [font-family:var(--font-geist)] text-[21px] font-extrabold tracking-[-0.01em] text-text no-underline">StepUp</Link>
              <Link href="/dashboard" className="hidden items-center gap-1.5 rounded-sm bg-[color-mix(in_srgb,var(--color-primary)_14%,var(--color-surface))] px-3 py-[5px] text-[13px] font-semibold text-primary no-underline md:inline-flex">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill={INDIGO}/><rect x="14" y="3" width="7" height="7" rx="1.5" fill={INDIGO}/><rect x="3" y="14" width="7" height="7" rx="1.5" fill={INDIGO}/><rect x="14" y="14" width="7" height="7" rx="1.5" fill={INDIGO}/></svg>
                대시보드
              </Link>
              <span className="hidden border-l border-border pl-[18px] text-[13px] text-muted md:inline">사업계획서</span>
            </div>
            <div className="flex items-center gap-2.5 md:gap-4">
              <Badge variant="default" className="hidden gap-1.5 text-[13px] md:inline-flex">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3z" fill={INDIGO}/></svg>
                완성
              </Badge>
              <PoweredBySolar className="hidden md:inline-flex" />
              <ThemeSwitcher className="hidden md:inline-flex" />
              <span className="hidden h-8 w-8 rounded-full bg-[linear-gradient(135deg,var(--color-secondary),var(--color-primary))] md:inline-block" />
              {isLoggedIn && (
                <Button
                  onClick={handleLogout}
                  variant="secondary"
                  size="sm"
                  className="hidden hover:border-error hover:text-error md:inline-flex"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  로그아웃
                </Button>
              )}

              {/* Mobile only: single drawer trigger carrying theme + logout (nav links moved to BottomNav) */}
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
                  {isLoggedIn && (
                    <Button onClick={handleLogout} variant="secondary" size="md" className="w-full hover:border-error hover:text-error">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      로그아웃
                    </Button>
                  )}
                  <div className="flex justify-center border-t border-border pt-4">
                    <PoweredBySolar />
                  </div>
                </div>
              </Drawer>
            </div>
          </div>
        </nav>

        {/* BODY */}
        <div className="mx-auto max-w-[1280px] px-5 pt-6 pb-24 md:px-7 md:pt-8 md:pb-[60px]">

          {/* Page header */}
          <div className="mb-5">
            <div className="mb-1.5 flex items-center gap-2.5">
              <Badge variant="default" className="text-[11px] tracking-[0.04em]">COMPLETE</Badge>
            </div>
            <h1 className="m-0 text-[24px] font-black tracking-[-0.02em] text-text md:text-[26px]">나의 사업계획서</h1>
            <p className="mt-1.5 text-[13.5px] text-muted">7단계 로드맵을 바탕으로 AI가 작성한 사업계획서입니다. 자유롭게 수정해 활용하세요.</p>
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
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-bold text-text">전체 사업계획서</span>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <>
                      <Button
                        onClick={handleEditStart}
                        disabled={!businessPlan}
                        variant="secondary"
                        size="sm"
                      >
                        <Pencil size={14} />
                        편집
                      </Button>
                      <Button
                        onClick={() => handleSave()}
                        disabled={!businessPlan || saving}
                        variant="success"
                        size="sm"
                      >
                        {savedOk ? (<><Check size={14} />저장됨!</>) : (<><Save size={14} />{saving ? "저장 중..." : "저장"}</>)}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={handleEditCancel} variant="secondary" size="sm">
                        취소
                      </Button>
                      <Button onClick={handleEditSave} disabled={saving} variant="primary" size="sm">
                        {savedOk ? (
                          <><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="var(--color-background)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>저장됨!</>
                        ) : (
                          <>{saving ? "저장 중..." : "저장 완료"}</>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Card variant="glass" padding="none" radius="md" className={cn("min-h-[500px] px-8 py-7", isEditing && "border-2 border-primary")}>
                {loadingPlan ? (
                  <div className="flex min-h-[400px] flex-col items-center justify-center gap-[18px]">
                    <div className="flex gap-1.5">
                      {[0, 150, 300].map((d, i) => (
                        <span key={i} className="inline-block h-2.5 w-2.5 animate-[bounce_1.2s_infinite] rounded-full bg-primary opacity-70" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                    <div className="text-center">
                      <div className="mb-1.5 text-[15px] font-bold text-text">AI가 사업계획서를 작성 중입니다</div>
                      <div className="text-[13px] text-muted">7단계 내용을 분석하고 있어요. 30초 정도 소요됩니다.</div>
                    </div>
                  </div>
                ) : error ? (
                  <div className="px-5 py-[60px] text-center text-error">
                    <div className="mb-2 text-[15px] font-bold">오류가 발생했습니다</div>
                    <div className="text-[13px] text-muted">{error}</div>
                    <Button onClick={() => { hasFetched.current = false; window.location.reload(); }} variant="secondary" size="sm" className="mt-4">다시 시도</Button>
                  </div>
                ) : isEditing ? (
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[600px] w-full resize-y rounded-sm border-none bg-transparent text-[14px] leading-[1.85] text-muted outline-none font-[Pretendard,_sans-serif] focus-visible:ring-2 focus-visible:ring-primary"
                  />
                ) : businessPlan ? (
                  <div className="select-text">
                    {renderPlan(businessPlan)}
                  </div>
                ) : null}
              </Card>
            </div>

            {/* RIGHT: 코치 요다 피드백 */}
            <div className="sticky top-[88px]">
              <Card variant="glass" padding="none" radius="md" className="overflow-hidden">
                {/* Header — the one hero gradient moment on this page */}
                <div
                  className="relative overflow-hidden px-5 py-4"
                  style={{ background: "linear-gradient(150deg, var(--color-primary) 0%, var(--color-secondary) 55%, var(--color-accent) 100%)" }}
                >
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 68%, rgba(255,255,255,0.12) 100%)" }}
                  />
                  <div className="relative flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.18] text-[18px]">🤖</div>
                    <div>
                      <div className="text-[14px] font-bold leading-[1.2] text-white">코치 요다의 피드백</div>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-white/75">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                        전체 사업계획서 분석 중
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5">
                  {loadingPlan || loadingFeedback ? (
                    <div className="flex flex-col items-center gap-3 py-6">
                      <div className="flex gap-[5px]">
                        {[0, 150, 300].map((d, i) => (
                          <span key={i} className="inline-block h-[7px] w-[7px] animate-[bounce_1.2s_infinite] rounded-full bg-primary opacity-60" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                      <div className="text-center text-[13px] text-muted">
                        {loadingPlan ? "사업계획서 생성 후 분석합니다" : "사업계획서를 꼼꼼히 읽는 중이에요..."}
                      </div>
                    </div>
                  ) : feedback ? (
                    <p className="m-0 whitespace-pre-line text-[13.5px] leading-[1.8] text-muted">{feedback}</p>
                  ) : (
                    <p className="py-6 text-center text-[13px] text-muted">피드백을 불러오지 못했습니다.</p>
                  )}
                </div>

                {/* Footer — 재요청 버튼 */}
                {!loadingPlan && !loadingFeedback && (
                  <div className="border-t border-border bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)] px-5 py-3">
                    <div className="mb-2 text-[12px] leading-[1.6] text-muted">
                      사업계획서를 편집한 후 새 피드백을 받고 싶다면 아래 버튼을 눌러주세요.
                    </div>
                    <Button
                      onClick={() => handleRefreshFeedback()}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      <RefreshCw size={14} />
                      피드백 다시 받기
                    </Button>
                  </div>
                )}
              </Card>

              {/* Back to step 7 */}
              <Link
                href="/roadmap/7"
                className="glass mt-3 flex items-center justify-center gap-1.5 rounded-md p-2.5 text-[13px] font-semibold text-muted no-underline hover:text-primary"
              >
                <ArrowLeft size={14} />
                7단계로 돌아가기
              </Link>
            </div>

          </div>
        </div>

        <BottomNav />

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
