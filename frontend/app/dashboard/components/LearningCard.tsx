import { STEP_CONTENT } from "../step-content";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";

interface Props {
  step: number;
}

export default function LearningCard({ step }: Props) {
  const meta = STEP_CONTENT[step - 1];

  return (
    <Card variant="glass" padding="none" className="p-5">
      <div className="flex items-center gap-2">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>이 단계 참고 방법론</span>
      </div>
      <div className="mt-3">
        <Badge variant="default" className="text-[11.5px]">{meta.methodology}</Badge>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--color-muted)" }}>{meta.learningBlurb}</p>
    </Card>
  );
}
