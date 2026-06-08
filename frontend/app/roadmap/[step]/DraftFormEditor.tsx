"use client";

import { useState, useEffect } from "react";

/* ─── shared styles ─── */
const INPUT = "w-full text-sm border border-stone-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] bg-white";
const TEXTAREA = INPUT + " resize-y";

/* ─── primitive components ─── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold text-[#2D6A4F] uppercase tracking-wider mt-5 mb-2 first:mt-0 border-b border-stone-100 pb-1">
      {children}
    </p>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-500 mb-1">{children}</label>;
}

function TextBox({
  label, value, onChange, rows = 2, placeholder = "",
}: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <div className="mb-3">
      <Label>{label}</Label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={TEXTAREA}
      />
    </div>
  );
}

function SingleInput({
  label, value, onChange, placeholder = "",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="mb-3">
      <Label>{label}</Label>
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT}
      />
    </div>
  );
}

function StringList({
  label, value, onChange, placeholder = "입력",
}: {
  label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const items = Array.isArray(value) ? value : [];
  return (
    <div className="mb-3">
      <Label>{label}</Label>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-1.5 items-center">
            <span className="text-[11px] text-stone-400 w-4 text-right shrink-0">{i + 1}</span>
            <input
              value={item}
              onChange={(e) => {
                const n = [...items];
                n[i] = e.target.value;
                onChange(n);
              }}
              className={INPUT + " flex-1"}
              placeholder={placeholder}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-stone-300 hover:text-red-400 text-xs px-1 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="text-xs text-[#2D6A4F] font-medium hover:underline"
        >
          + 추가
        </button>
      </div>
    </div>
  );
}

/* ─── step-specific forms ─── */
type D = Record<string, unknown>;
type Updater = (key: string, value: unknown) => void;

/* STEP 1 — TPCS */
function Step1Form({ d, u }: { d: D; u: Updater }) {
  return (
    <>
      <SectionTitle>TPCS 프레임워크</SectionTitle>
      <TextBox label="목표 고객 (Target)" value={d.target as string} onChange={(v) => u("target", v)} />
      <TextBox label="핵심 문제 (Problem)" value={d.problem as string} onChange={(v) => u("problem", v)} />
      <StringList label="근본 원인 3가지 (Cause)" value={d.cause as string[]} onChange={(v) => u("cause", v)} placeholder="원인" />
      <TextBox label="솔루션 (Solution)" value={d.solution as string} onChange={(v) => u("solution", v)} rows={3} />
      <StringList label="WHY 분석 (1→2→3차 원인)" value={d.why_analysis as string[]} onChange={(v) => u("why_analysis", v)} placeholder="원인" />
    </>
  );
}

/* STEP 2 — 고객 리서치 */
function Step2Form({ d, u }: { d: D; u: Updater }) {
  const cp = (d.customer_profile as D) || {};
  const ucp = (k: string, v: unknown) => u("customer_profile", { ...cp, [k]: v });

  return (
    <>
      <SectionTitle>잠재고객 프로파일</SectionTitle>
      <SingleInput label="나이대" value={cp.age_range as string} onChange={(v) => ucp("age_range", v)} placeholder="예: 20~35세" />
      <SingleInput label="직업 / 역할" value={cp.occupation as string} onChange={(v) => ucp("occupation", v)} placeholder="예: 프리랜서 예술가" />
      <StringList label="불편함 (Pain Points)" value={cp.pain_points as string[]} onChange={(v) => ucp("pain_points", v)} placeholder="불편한 점" />
      <StringList label="목표 (Goals)" value={cp.goals as string[]} onChange={(v) => ucp("goals", v)} placeholder="목표" />
      <SectionTitle>시장 리서치</SectionTitle>
      <StringList label="리서치 플랫폼" value={d.research_platforms as string[]} onChange={(v) => u("research_platforms", v)} placeholder="플랫폼명" />
      <TextBox label="AI 리서치 프롬프트 예시" value={d.ai_research_prompt as string} onChange={(v) => u("ai_research_prompt", v)} rows={3} />
    </>
  );
}

/* STEP 3 — 고객 인터뷰 */
function Step3Form({ d, u }: { d: D; u: Updater }) {
  const iq = (d.interview_questions as D) || {};
  const uiq = (k: string, v: unknown) => u("interview_questions", { ...iq, [k]: v });
  const persona = (d.persona as D) || {};
  const up = (k: string, v: unknown) => u("persona", { ...persona, [k]: v });

  return (
    <>
      <SectionTitle>가설 수립</SectionTitle>
      <StringList label="가설 9개 (우리 고객은 ___)" value={d.hypotheses as string[]} onChange={(v) => u("hypotheses", v)} placeholder="가설" />
      <SectionTitle>인터뷰 질문지</SectionTitle>
      <StringList label="일반 질문" value={iq.general as string[]} onChange={(v) => uiq("general", v)} placeholder="질문" />
      <StringList label="심층 질문" value={iq.deep_dive as string[]} onChange={(v) => uiq("deep_dive", v)} placeholder="질문" />
      <SectionTitle>페르소나</SectionTitle>
      <SingleInput label="페르소나 이름" value={persona.name as string} onChange={(v) => up("name", v)} placeholder="예: 30대 프리랜서 유진" />
      <SingleInput label="한 줄 설명" value={persona.description as string} onChange={(v) => up("description", v)} placeholder="페르소나 설명" />
    </>
  );
}

/* STEP 4 — MVP 테스트 */
function Step4Form({ d, u }: { d: D; u: Updater }) {
  const tools = (Array.isArray(d.recommended_tools) ? d.recommended_tools : []) as D[];
  const uTool = (i: number, k: string, v: string) => {
    const n = [...tools];
    n[i] = { ...n[i], [k]: v };
    u("recommended_tools", n);
  };

  return (
    <>
      <SectionTitle>핵심 가설</SectionTitle>
      <TextBox label="가설" value={d.hypothesis as string} onChange={(v) => u("hypothesis", v)} rows={2} />
      <SingleInput label="성공 기준 (수치)" value={d.success_criteria as string} onChange={(v) => u("success_criteria", v)} placeholder="예: 2주 내 전환율 5% 이상" />
      <SectionTitle>추천 도구</SectionTitle>
      {tools.map((t, i) => (
        <div key={i} className="border border-stone-200 rounded-xl p-3 mb-2 bg-stone-50/60">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-400">도구 {i + 1}</span>
            <button type="button" onClick={() => u("recommended_tools", tools.filter((_, j) => j !== i))}
              className="text-stone-300 hover:text-red-400 text-xs transition-colors">✕</button>
          </div>
          <input value={(t.tool as string) ?? ""} onChange={(e) => uTool(i, "tool", e.target.value)} placeholder="도구명" className={INPUT + " mb-1.5"} />
          <input value={(t.reason as string) ?? ""} onChange={(e) => uTool(i, "reason", e.target.value)} placeholder="추천 이유" className={INPUT + " mb-1.5"} />
          <input value={(t.url as string) ?? ""} onChange={(e) => uTool(i, "url", e.target.value)} placeholder="URL" className={INPUT} />
        </div>
      ))}
      <button type="button" onClick={() => u("recommended_tools", [...tools, { tool: "", reason: "", url: "" }])}
        className="text-xs text-[#2D6A4F] font-medium hover:underline mb-3">
        + 도구 추가
      </button>
      <SectionTitle>테스트 계획</SectionTitle>
      <TextBox label="테스트 실행 계획" value={d.test_plan as string} onChange={(v) => u("test_plan", v)} rows={3} />
    </>
  );
}

/* STEP 5 — 시장 / 경쟁사 분석 */
function Step5Form({ d, u }: { d: D; u: Updater }) {
  const ms = (d.market_size as D) || {};
  const ums = (k: string, v: string) => u("market_size", { ...ms, [k]: v });
  const swot = (d.swot as D) || {};
  const uSwot = (k: string, v: string[]) => u("swot", { ...swot, [k]: v });
  const competitors = (Array.isArray(d.competitors) ? d.competitors : []) as D[];
  const uComp = (i: number, k: string, v: string) => {
    const n = [...competitors];
    n[i] = { ...n[i], [k]: v };
    u("competitors", n);
  };

  return (
    <>
      <SectionTitle>시장 규모</SectionTitle>
      <SingleInput label="TAM (전체 시장)" value={ms.TAM as string} onChange={(v) => ums("TAM", v)} placeholder="예: 약 10조원" />
      <SingleInput label="SAM (유효 시장)" value={ms.SAM as string} onChange={(v) => ums("SAM", v)} placeholder="예: 약 1조원" />
      <SingleInput label="SOM (목표 시장)" value={ms.SOM as string} onChange={(v) => ums("SOM", v)} placeholder="예: 약 100억원" />
      <TextBox label="산정 근거" value={ms.formula_hint as string} onChange={(v) => ums("formula_hint", v)} rows={2} />
      <SectionTitle>경쟁사 분석</SectionTitle>
      {competitors.map((c, i) => (
        <div key={i} className="border border-stone-200 rounded-xl p-3 mb-2 bg-stone-50/60">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-400">경쟁사 {i + 1}</span>
            <button type="button" onClick={() => u("competitors", competitors.filter((_, j) => j !== i))}
              className="text-stone-300 hover:text-red-400 text-xs transition-colors">✕</button>
          </div>
          <input value={(c.name as string) ?? ""} onChange={(e) => uComp(i, "name", e.target.value)} placeholder="경쟁사명" className={INPUT + " mb-1.5"} />
          <input value={(c.strength as string) ?? ""} onChange={(e) => uComp(i, "strength", e.target.value)} placeholder="강점" className={INPUT + " mb-1.5"} />
          <input value={(c.weakness as string) ?? ""} onChange={(e) => uComp(i, "weakness", e.target.value)} placeholder="약점" className={INPUT} />
        </div>
      ))}
      <button type="button" onClick={() => u("competitors", [...competitors, { name: "", strength: "", weakness: "" }])}
        className="text-xs text-[#2D6A4F] font-medium hover:underline mb-3">+ 경쟁사 추가</button>
      <SectionTitle>SWOT 분석</SectionTitle>
      <StringList label="강점 (S)" value={swot.S as string[]} onChange={(v) => uSwot("S", v)} placeholder="강점" />
      <StringList label="약점 (W)" value={swot.W as string[]} onChange={(v) => uSwot("W", v)} placeholder="약점" />
      <StringList label="기회 (O)" value={swot.O as string[]} onChange={(v) => uSwot("O", v)} placeholder="기회" />
      <StringList label="위협 (T)" value={swot.T as string[]} onChange={(v) => uSwot("T", v)} placeholder="위협" />
      <TextBox label="전략 방향 코멘트" value={d.strategy_comments as string} onChange={(v) => u("strategy_comments", v)} rows={2} />
    </>
  );
}

/* STEP 6 — 비즈니스 모델 캔버스 */
function Step6Form({ d, u }: { d: D; u: Updater }) {
  const BMC: [string, string][] = [
    ["customer_segments", "고객 세그먼트"],
    ["value_propositions", "핵심 가치"],
    ["channels", "유통 채널"],
    ["customer_relationships", "고객 관계"],
    ["revenue_streams", "수익 구조"],
    ["key_resources", "핵심 자원"],
    ["key_activities", "핵심 활동"],
    ["key_partnerships", "핵심 파트너"],
    ["cost_structure", "비용 구조"],
  ];
  return (
    <>
      <SectionTitle>비즈니스 모델 캔버스 (9블록)</SectionTitle>
      {BMC.map(([key, label]) => (
        <TextBox key={key} label={label} value={d[key] as string} onChange={(v) => u(key, v)} rows={2} />
      ))}
      <SectionTitle>AI 피드백</SectionTitle>
      <TextBox label="모순 및 보완 코멘트" value={d.feedback as string} onChange={(v) => u("feedback", v)} rows={3} />
    </>
  );
}

/* STEP 7 — 피치덱 */
function Step7Form({ d, u }: { d: D; u: Updater }) {
  const sections = (Array.isArray(d.sections) ? d.sections : []) as D[];
  const qaList = (Array.isArray(d.qa_list) ? d.qa_list : []) as D[];
  const uSec = (i: number, k: string, v: string) => {
    const n = [...sections]; n[i] = { ...n[i], [k]: v }; u("sections", n);
  };
  const uQa = (i: number, k: string, v: string) => {
    const n = [...qaList]; n[i] = { ...n[i], [k]: v }; u("qa_list", n);
  };

  return (
    <>
      <SectionTitle>피치덱 섹션</SectionTitle>
      {sections.map((s, i) => (
        <div key={i} className="border border-stone-200 rounded-xl p-3 mb-2">
          <input value={(s.title as string) ?? ""} onChange={(e) => uSec(i, "title", e.target.value)}
            placeholder={`섹션 ${i + 1} 제목`} className={INPUT + " mb-1.5 font-semibold"} />
          <textarea value={(s.content as string) ?? ""} onChange={(e) => uSec(i, "content", e.target.value)}
            rows={3} className={TEXTAREA} placeholder="섹션 내용" />
        </div>
      ))}
      <SectionTitle>예상 Q&amp;A</SectionTitle>
      {qaList.map((q, i) => (
        <div key={i} className="border border-stone-200 rounded-xl p-3 mb-2">
          <input value={(q.question as string) ?? ""} onChange={(e) => uQa(i, "question", e.target.value)}
            placeholder={`질문 ${i + 1}`} className={INPUT + " mb-1.5"} />
          <textarea value={(q.answer as string) ?? ""} onChange={(e) => uQa(i, "answer", e.target.value)}
            rows={2} className={TEXTAREA} placeholder="답변 방향" />
        </div>
      ))}
    </>
  );
}

/* ─── main export ─── */

export default function DraftFormEditor({
  step,
  content,
  onChange,
}: {
  step: number;
  content: Record<string, unknown> | null;
  onChange: (json: Record<string, unknown>) => void;
}) {
  const [local, setLocal] = useState<D>(content ?? {});

  useEffect(() => {
    if (content) setLocal(content);
  }, [content]);

  function update(key: string, value: unknown) {
    const next = { ...local, [key]: value };
    setLocal(next);
    onChange(next);
  }

  const props = { d: local, u: update };

  return (
    <div>
      {step === 1 && <Step1Form {...props} />}
      {step === 2 && <Step2Form {...props} />}
      {step === 3 && <Step3Form {...props} />}
      {step === 4 && <Step4Form {...props} />}
      {step === 5 && <Step5Form {...props} />}
      {step === 6 && <Step6Form {...props} />}
      {step === 7 && <Step7Form {...props} />}
    </div>
  );
}
