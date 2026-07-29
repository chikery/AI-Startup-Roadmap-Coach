import Card from "@/app/components/ui/Card";

interface Props {
  stepName: string;
}

export default function MilestoneCard({ stepName }: Props) {
  return (
    <Card variant="glass" padding="none" className="relative flex items-center gap-4 overflow-hidden p-5">
      <span
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: "color-mix(in srgb, var(--color-success) 18%, var(--color-surface))" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3c-1 3-2 4-5 5 3 1 4 2 5 5 1-3 2-4 5-5-3-1-4-2-5-5z" fill="var(--color-success)"/></svg>
      </span>
      <div>
        <div className="text-[15px] font-extrabold" style={{ color: "var(--color-text)" }}>{stepName} 완료!</div>
        <div className="mt-0.5 text-[13px]" style={{ color: "var(--color-muted)" }}>한 걸음 더 나아갔어요. 이 기세로 계속해봐요.</div>
      </div>
    </Card>
  );
}
