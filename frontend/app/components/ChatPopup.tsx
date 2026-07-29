"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/cn";
import PoweredBySolar from "@/app/components/ui/PoweredBySolar";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const STEP_GREETINGS: Record<number, string> = {
  1: "STEP 1 — 문제 발견 단계에 있군요! TPCS 프레임워크(Target·Problem·Cause·Solution)로 아이디어를 검증해 드릴게요. 어떤 문제를 해결하려 하시나요?",
  2: "STEP 2 — 예술적 비전 단계네요! '예쁘다'를 넘어 '왜 지금 이것이 필요한가'를 시장의 언어로 번역해 드릴게요.",
  3: "STEP 3 — 시장 적합성 단계입니다. TAM·SAM·SOM을 데이터로 증명할 수 있어야 설득력이 생깁니다. 어떤 시장을 보고 계신가요?",
  4: "STEP 4 — 재무 지도 단계입니다. 어떻게 돈을 벌고 언제 흑자로 전환하는지 함께 설계해 봐요.",
  5: "STEP 5 — 투자 유치 단계네요! 지금 신청 가능한 지원사업과 자금 조달 전략을 연결해 드릴게요.",
  6: "STEP 6 — 팀 빌딩 단계입니다. 혼자라도 괜찮아요. '내가 잘하는 것 + 채워야 할 것'이 명확하면 강점이 됩니다.",
  7: "STEP 7 — 런칭 데이입니다! 3분 피치로 '왜 이 사업인가, 왜 지금인가, 왜 당신인가'를 함께 다듬어 봐요.",
};

const DEFAULT_GREETING = "안녕하세요! StepUp AI 코치입니다. 창업 여정의 어떤 단계든 함께 고민해 드릴게요.";

// TODO(bug, tracked separately — not fixed as part of this refactor):
// `@keyframes bounce` used by the loading dots below is only defined locally in
// business-plan/page.tsx's <style> tag, not globally in globals.css. On any other
// page, the loading dots' `animate-[bounce_1.2s_infinite]` has no matching keyframe,
// so they just sit at fixed opacity instead of bouncing. Needs the keyframe moved
// to globals.css. Filed as a follow-up, out of scope for the Tailwind-unification pass.

function useCurrentStep(): number | null {
  const pathname = usePathname();
  const match = pathname?.match(/\/roadmap\/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

// Pages below render the mobile-only BottomNav, so the floating chat button
// (and its popup) must clear it — roadmap additionally stacks a sticky CTA bar
// above BottomNav, so it needs extra clearance on top of that.
function useBottomBarClearance(): "none" | "bottomnav" | "roadmap" {
  const pathname = usePathname();
  if (!pathname) return "none";
  if (pathname.startsWith("/roadmap/")) return "roadmap";
  if (["/dashboard", "/business-plan", "/programs"].some((p) => pathname.startsWith(p))) return "bottomnav";
  return "none";
}

export default function ChatPopup() {
  const step = useCurrentStep();
  const bottomClearance = useBottomBarClearance();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: step ? (STEP_GREETINGS[step] ?? DEFAULT_GREETING) : DEFAULT_GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Reset messages when step changes
  useEffect(() => {
    setMessages([
      { role: "assistant", content: step ? (STEP_GREETINGS[step] ?? DEFAULT_GREETING) : DEFAULT_GREETING },
    ]);
  }, [step]);

  useEffect(() => {
    function handleOpenChat() { setOpen(true); }
    window.addEventListener("open-chat", handleOpenChat);
    return () => window.removeEventListener("open-chat", handleOpenChat);
  }, []);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          step: step ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("응답 오류");
      const data = await res.json();
      setMessages([...next, { role: "assistant", content: data.message }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "오류가 발생했습니다. 잠시 후 다시 시도해주세요." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "fixed right-6 z-50 flex flex-col items-end gap-3",
        bottomClearance === "roadmap" ? "bottom-[140px] md:bottom-6" : bottomClearance === "bottomnav" ? "bottom-20 md:bottom-6" : "bottom-6"
      )}
    >
      {open && (
        <div className="glass flex h-[500px] w-[360px] flex-col overflow-hidden rounded-lg">
          {/* Header — hero gradient moment for this component. Gradient stays inline:
              a 3-stop CSS-var gradient reused across pages, not a good arbitrary-value fit. */}
          <div
            className="relative overflow-hidden px-4 py-3.5"
            style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 60%, var(--color-accent) 100%)" }}
          >
            {/* Sheen overlay — same exception as above */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 68%, rgba(255,255,255,0.12) 100%)" }}
            />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.18] text-lg">🤖</div>
                <div>
                  <div className="text-sm font-bold leading-[1.2] text-white">AI 창업 코치</div>
                  <div className="flex items-center gap-1 text-[11px] text-white/75">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
                    {step ? `STEP ${step} 전문 코칭 중` : "언제든 질문하세요"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-sm border-none bg-transparent px-1.5 py-1 text-[20px] leading-none text-white/70 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>

          {/* Brand strip — thin, understated; doesn't compete with the gradient header above */}
          <div className="flex items-center justify-center border-b border-border bg-surface py-1">
            <PoweredBySolar className="border-none bg-transparent px-0 py-0 text-[10px]" />
          </div>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto bg-background px-3 py-3.5">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[82%] whitespace-pre-wrap break-words px-[13px] py-2.5 text-[13px] leading-[1.6]",
                    m.role === "user"
                      ? "rounded-tl-md rounded-tr-md rounded-br-md rounded-bl-[4px] bg-primary text-white"
                      : "glass rounded-tl-md rounded-tr-md rounded-br-md rounded-bl-[4px] text-text"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="glass flex items-center gap-1 rounded-tl-md rounded-tr-md rounded-br-md rounded-bl-[4px] px-3.5 py-2.5">
                  {[0, 150, 300].map((delay, idx) => (
                    <span
                      key={idx}
                      className="inline-block h-[7px] w-[7px] animate-[bounce_1.2s_infinite] rounded-full bg-primary opacity-60"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-border bg-surface px-3 py-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="코치에게 물어보세요..."
              disabled={loading}
              className="flex-1 rounded-sm border-[1.5px] border-border bg-background px-[13px] py-[9px] text-[13px] text-text outline-none focus:border-primary disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className={cn(
                "flex items-center justify-center rounded-sm px-[13px] py-[9px] text-white transition-colors duration-150 disabled:pointer-events-none disabled:cursor-not-allowed",
                loading || !input.trim()
                  ? "bg-[color-mix(in_srgb,var(--color-primary)_30%,var(--color-surface))]"
                  : "cursor-pointer bg-primary hover:bg-primary-hover"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle FAB — boxShadow stays inline: color-mix() shadow, arbitrary-value would be unreadable */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full border-none text-white transition duration-150 hover:scale-[1.08]",
          open ? "bg-primary-hover" : "bg-primary"
        )}
        style={{ boxShadow: "0 4px 20px color-mix(in srgb, var(--color-primary) 40%, transparent)" }}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
          </svg>
        )}
      </button>
    </div>
  );
}
