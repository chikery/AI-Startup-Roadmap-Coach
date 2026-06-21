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

  const INDIGO = "#5A5BD6";
  const INDIGO_DARK = "#4849C0";
  const INDIGO_BG = "#ECECFB";

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 50, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
      {open && (
        <div style={{
          width: 360,
          height: 500,
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 20px 60px rgba(90,91,214,0.18), 0 4px 16px rgba(0,0,0,0.08)",
          border: `1.5px solid ${INDIGO_BG}`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            background: `linear-gradient(135deg, ${INDIGO} 0%, #4849C0 100%)`,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>🤖</div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>AI 창업 코치</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                  {step ? `STEP ${step} 전문 코칭 중` : "언제든 질문하세요"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                color: "rgba(255,255,255,0.7)", background: "none", border: "none",
                cursor: "pointer", fontSize: 20, lineHeight: 1, padding: "4px 6px",
                borderRadius: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10, background: "#F8F8FE" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "82%",
                  padding: "10px 13px",
                  borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  background: m.role === "user" ? INDIGO : "#fff",
                  color: m.role === "user" ? "#fff" : "#1F2436",
                  boxShadow: m.role === "user" ? "none" : "0 1px 4px rgba(0,0,0,0.06)",
                  border: m.role === "user" ? "none" : "1px solid #ECECFB",
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  background: "#fff", border: "1px solid #ECECFB", borderRadius: "16px 16px 16px 4px",
                  padding: "10px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  display: "flex", gap: 4, alignItems: "center",
                }}>
                  {[0, 150, 300].map((delay, idx) => (
                    <span key={idx} style={{
                      width: 7, height: 7, borderRadius: "50%", background: INDIGO,
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
          <div style={{ padding: "10px 12px", background: "#fff", borderTop: "1px solid #ECECFB", display: "flex", gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="코치에게 물어보세요..."
              disabled={loading}
              style={{
                flex: 1, fontSize: 13, padding: "9px 13px",
                borderRadius: 12, border: "1.5px solid #E0E1FA",
                outline: "none", background: "#FAFAFE",
                color: "#1F2436",
                opacity: loading ? 0.5 : 1,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = INDIGO)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E0E1FA")}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                padding: "9px 13px",
                background: loading || !input.trim() ? "#C5C6F4" : INDIGO,
                color: "#fff", border: "none", borderRadius: 12,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onMouseEnter={(e) => { if (!loading && input.trim()) e.currentTarget.style.background = INDIGO_DARK; }}
              onMouseLeave={(e) => { if (!loading && input.trim()) e.currentTarget.style.background = INDIGO; }}
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
          background: open ? INDIGO_DARK : INDIGO,
          border: "none", borderRadius: "50%",
          boxShadow: "0 4px 20px rgba(90,91,214,0.4)",
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
