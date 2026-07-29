import { HTMLAttributes } from "react";
import { cn } from "@/app/lib/cn";

export type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  default: "text-primary bg-[var(--color-primary-subtle)]",
  success: "text-success bg-[color-mix(in_srgb,var(--color-success)_16%,var(--color-surface))]",
  warning: "text-warning bg-[color-mix(in_srgb,var(--color-warning)_18%,var(--color-surface))]",
  error: "text-error bg-[color-mix(in_srgb,var(--color-error)_16%,var(--color-surface))]",
  info: "text-info bg-[color-mix(in_srgb,var(--color-info)_16%,var(--color-surface))]",
  accent: "text-accent bg-[color-mix(in_srgb,var(--color-accent)_18%,var(--color-surface))]",
};

export default function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-[600] whitespace-nowrap",
        VARIANT_CLASS[variant],
        className
      )}
      {...props}
    />
  );
}
