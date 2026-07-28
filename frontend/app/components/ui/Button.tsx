import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/app/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-text text-background hover:opacity-90",
  secondary: "bg-surface text-text border border-border hover:border-[var(--color-border-strong)]",
  ghost: "bg-transparent text-text hover:bg-[var(--color-primary-subtle)]",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "text-[13px] px-3.5 py-2 gap-1.5",
  md: "text-[15px] px-5 py-3 gap-2",
  lg: "text-[16px] px-7 py-3.5 gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", className, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-sm font-[600] transition-[opacity,border-color,background-color] disabled:cursor-not-allowed disabled:opacity-50",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className
      )}
      {...props}
    />
  );
});

export default Button;
