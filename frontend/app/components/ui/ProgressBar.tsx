import { cn } from "@/app/lib/cn";

interface LinearProps {
  variant?: "linear";
  value: number;
  max?: number;
  color?: string;
  className?: string;
}

interface SegmentedProps {
  variant: "segmented";
  total: number;
  completed: number;
  activeIndex?: number;
  className?: string;
}

export default function ProgressBar(props: LinearProps | SegmentedProps) {
  if (props.variant === "segmented") {
    const { total, completed, activeIndex, className } = props;
    return (
      <div className={cn("flex gap-1.5", className)}>
        {Array.from({ length: total }, (_, i) => {
          const step = i + 1;
          const done = step <= completed;
          const active = step === activeIndex;
          return (
            <div
              key={step}
              className="h-2 flex-1 rounded-full"
              style={{
                background: done
                  ? "var(--color-primary)"
                  : active
                  ? "color-mix(in srgb, var(--color-primary) 35%, transparent)"
                  : "var(--color-border)",
              }}
            />
          );
        })}
      </div>
    );
  }

  const { value, max = 100, color = "var(--color-primary)", className } = props;
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={cn("h-2 overflow-hidden rounded-full", className)} style={{ background: "var(--color-border)" }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
