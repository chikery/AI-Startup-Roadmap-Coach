import { cn } from "@/app/lib/cn";

interface PoweredBySolarProps {
  className?: string;
  label?: string;
}

/** Understated brand badge for the SOLAR API — same pill shape as Badge, but border-only so it never competes with semantic (progress/status) badges. */
export default function PoweredBySolar({ className, label = "Powered by SOLAR" }: PoweredBySolarProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-[600] text-muted",
        className
      )}
    >
      <span aria-hidden="true">⚡</span>
      {label}
    </span>
  );
}
