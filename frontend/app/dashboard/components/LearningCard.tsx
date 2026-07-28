import { STEP_CONTENT } from "../step-content";

interface Props {
  step: number;
}

export default function LearningCard({ step }: Props) {
  const meta = STEP_CONTENT[step - 1];

  return (
    <div className="glass rounded-lg p-5">
      <div className="flex items-center gap-2">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>이 단계 참고 방법론</span>
      </div>
      <div className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-[11.5px] font-bold" style={{ background: "color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))", color: "var(--color-primary)" }}>
        {meta.methodology}
      </div>
      <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--color-muted)" }}>{meta.learningBlurb}</p>
    </div>
  );
}
