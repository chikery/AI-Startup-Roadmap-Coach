import Card from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";

interface Props {
  count: number;
}

export default function EligibleProgramsCard({ count }: Props) {
  return (
    <Card variant="glass" padding="md" className="flex flex-col justify-between">
      <div>
        <div className="text-sm font-bold" style={{ color: "var(--color-text)" }}>지금 신청 가능한 지원사업</div>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-3xl font-extrabold tabular-nums" style={{ color: "var(--color-accent)" }}>{count}</span>
          <span className="mb-1 text-[13px] font-semibold" style={{ color: "var(--color-muted)" }}>건</span>
        </div>
      </div>
      <Button href="/programs" variant="secondary" size="sm" className="mt-4 w-full">
        지원사업 보기
      </Button>
    </Card>
  );
}
