import Link from "next/link";
import { STEP_CONTENT } from "../step-content";
import Card from "@/app/components/ui/Card";
import ProgressBar from "@/app/components/ui/ProgressBar";

interface Props {
  completedCount: number;
  activeStep: number;
  compact?: boolean;
}

export default function RoadmapProgressCard({ completedCount, activeStep, compact }: Props) {
  const pct = Math.round((completedCount / 7) * 100);

  return (
    <Card variant="glass" padding="md">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold" style={{ color: "var(--color-text)" }}>7단계 로드맵</div>
        <span className="text-sm font-extrabold" style={{ color: "var(--color-primary)" }}>{completedCount}/7</span>
      </div>

      <div className="mt-3">
        <ProgressBar variant="segmented" total={7} completed={completedCount} activeIndex={activeStep} />
      </div>
      <div className="mt-2 text-xs font-medium" style={{ color: "var(--color-muted)" }}>전체 진행률 {pct}%</div>

      {!compact && (
        <div className="mt-4 flex flex-col gap-1">
          {STEP_CONTENT.map((s, i) => {
            const stepNum = i + 1;
            const done = stepNum <= completedCount;
            const isActive = stepNum === activeStep;
            return (
              <Link
                key={stepNum}
                href={`/roadmap/${stepNum}`}
                className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-semibold no-underline transition-colors"
                style={{
                  color: isActive ? "var(--color-primary)" : done ? "var(--color-muted)" : "var(--color-text)",
                  background: isActive ? "color-mix(in srgb, var(--color-primary) 14%, var(--color-surface))" : "transparent",
                }}
              >
                <span
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    background: done ? "var(--color-success)" : isActive ? "var(--color-primary)" : "var(--color-border)",
                    color: done || isActive ? "#fff" : "var(--color-muted)",
                  }}
                >
                  {done ? "✓" : stepNum}
                </span>
                {s.name}
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
