import Card from "@/app/components/ui/Card";
import ProgressBar from "@/app/components/ui/ProgressBar";
import Button from "@/app/components/ui/Button";

interface Props {
  completedCount: number;
  hasPlan: boolean;
}

function bucket(completedCount: number): { label: string; color: string } {
  if (completedCount === 0) return { label: "이제 시작이에요", color: "var(--color-muted)" };
  if (completedCount < 3) return { label: "초기 단계", color: "var(--color-accent)" };
  if (completedCount < 6) return { label: "순항 중", color: "var(--color-primary)" };
  if (completedCount < 7) return { label: "완성이 눈앞이에요", color: "var(--color-primary)" };
  return { label: "로드맵 완주!", color: "var(--color-success)" };
}

export default function ProjectHealthCard({ completedCount, hasPlan }: Props) {
  const pct = Math.round((completedCount / 7) * 100);
  const { label, color } = bucket(completedCount);

  return (
    <Card variant="glass" padding="md" className="flex flex-col justify-between">
      <div>
        <div className="text-sm font-bold" style={{ color: "var(--color-text)" }}>사업계획서 완성도</div>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-3xl font-extrabold tabular-nums" style={{ color }}>{pct}%</span>
          <span className="mb-1 text-[13px] font-semibold" style={{ color: "var(--color-muted)" }}>{label}</span>
        </div>
        <div className="mt-3">
          <ProgressBar value={completedCount} max={7} color={color} />
        </div>
      </div>
      <Button href="/business-plan" variant="secondary" size="sm" className="mt-4 w-full">
        {hasPlan ? "사업계획서 보기" : "사업계획서 만들어보기"}
      </Button>
    </Card>
  );
}
