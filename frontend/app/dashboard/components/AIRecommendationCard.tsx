import Card from "@/app/components/ui/Card";

interface Props {
  tip: string;
}

export default function AIRecommendationCard({ tip }: Props) {
  return (
    <Card
      variant="glass"
      padding="none"
      className="flex gap-3 p-5 bg-[color-mix(in_srgb,var(--color-primary)_8%,var(--glass-bg))]"
    >
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-extrabold"
        style={{ background: "var(--color-primary)", color: "#fff" }}
      >
        RK
      </span>
      <div>
        <div className="text-[11.5px] font-bold" style={{ color: "var(--color-muted)" }}>AI 코치 요다</div>
        <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: "var(--color-text)" }}>&ldquo;{tip}&rdquo;</p>
      </div>
    </Card>
  );
}
