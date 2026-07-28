"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

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

function useCurrentStep(): number | null {
  const pathname = usePathname();
  const match = pathname?.match(/\/roadmap\/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

export default function ChatPopup() {
  const step = useCurrentStep();

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
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
      {open && (
        <div className="glass" style={{
          width: 360,
          height: 500,
          borderRadius: "var(--radius-lg)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header — hero gradient moment for this component */}
          <div style={{
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 60%, var(--color-accent) 100%)",
            padding: "14px 16px",
          }}>
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none",
              background: "linear-gradient(115deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 68%, rgba(255,255,255,0.12) 100%)",
            }} />
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "var(--radius-full)",
                  background: "rgba(255,255,255,0.18)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18,
                }}>🤖</div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>AI 창업 코치</div>
                  <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "var(--radius-full)", background: "var(--color-success)", display: "inline-block" }} />
                    {step ? `STEP ${step} 전문 코칭 중` : "언제든 질문하세요"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  color: "rgba(255,255,255,0.7)", background: "none", border: "none",
                  cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "4px 6px",
                  borderRadius: "var(--radius-sm)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10, background: "var(--color-background)" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div
                  className={m.role === "user" ? undefined : "glass"}
                  style={{
                    maxWidth: "82%",
                    padding: "10px 13px",
                    borderRadius: m.role === "user" ? "var(--radius-md) var(--radius-md) 4px var(--radius-md)" : "var(--radius-md) var(--radius-md) var(--radius-md) 4px",
                    fontSize: 13,
                    lineHeight: 1.6,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    background: m.role === "user" ? "var(--color-primary)" : undefined,
                    color: m.role === "user" ? "#fff" : "var(--color-text)",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div className="glass" style={{
                  borderRadius: "var(--radius-md) var(--radius-md) var(--radius-md) 4px",
                  padding: "10px 14px",
                  display: "flex", gap: 4, alignItems: "center",
                }}>
                  {[0, 150, 300].map((delay, idx) => (
                    <span key={idx} style={{
                      width: 7, height: 7, borderRadius: "var(--radius-full)", background: "var(--color-primary)",
                      display: "inline-block", opacity: 0.6,
                      animation: "bounce 1.2s infinite",
                      animationDelay: `${delay}ms`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "10px 12px", background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", display: "flex", gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="코치에게 물어보세요..."
              disabled={loading}
              style={{
                flex: 1, fontSize: 13, padding: "9px 13px",
                borderRadius: "var(--radius-sm)", border: "1.5px solid var(--color-border)",
                outline: "none", background: "var(--color-background)",
                color: "var(--color-text)",
                opacity: loading ? 0.5 : 1,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                padding: "9px 13px",
                background: loading || !input.trim() ? "color-mix(in srgb, var(--color-primary) 30%, var(--color-surface))" : "var(--color-primary)",
                color: "#fff", border: "none", borderRadius: "var(--radius-sm)",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onMouseEnter={(e) => { if (!loading && input.trim()) e.currentTarget.style.background = "var(--color-primary-hover)"; }}
              onMouseLeave={(e) => { if (!loading && input.trim()) e.currentTarget.style.background = "var(--color-primary)"; }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Toggle FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 56, height: 56,
          background: open ? "var(--color-primary-hover)" : "var(--color-primary)",
          border: "none", borderRadius: "var(--radius-full)",
          boxShadow: "0 4px 20px color-mix(in srgb, var(--color-primary) 40%, transparent)",
          cursor: "pointer", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.15s, background 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
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
