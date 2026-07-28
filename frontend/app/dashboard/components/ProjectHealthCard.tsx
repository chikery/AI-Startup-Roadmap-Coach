interface Props {
  completedCount: number;
}

function bucket(completedCount: number): { label: string; color: string } {
  if (completedCount === 0) return { label: "이제 시작이에요", color: "var(--color-muted)" };
  if (completedCount < 3) return { label: "초기 단계", color: "var(--color-accent)" };
  if (completedCount < 6) return { label: "순항 중", color: "var(--color-primary)" };
  if (completedCount < 7) return { label: "완성이 눈앞이에요", color: "var(--color-primary)" };
  return { label: "로드맵 완주!", color: "var(--color-success)" };
}

export default function ProjectHealthCard({ completedCount }: Props) {
  const pct = Math.round((completedCount / 7) * 100);
  const { label, color } = bucket(completedCount);

  return (
    <div className="glass rounded-lg p-5 sm:p-6">
      <div className="text-sm font-bold" style={{ color: "var(--color-text)" }}>사업계획서 진행 상태</div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-3xl font-extrabold tabular-nums" style={{ color }}>{pct}%</span>
        <span className="mb-1 text-[13px] font-semibold" style={{ color: "var(--color-muted)" }}>{label}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: "var(--color-border)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
