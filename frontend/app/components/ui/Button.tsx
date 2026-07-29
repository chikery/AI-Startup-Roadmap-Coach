import { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/app/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "success";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonOwnProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
}

type ButtonProps = ButtonOwnProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "href"> &
  Pick<AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel">;

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-text text-background hover:opacity-90",
  secondary: "bg-surface text-text border border-border hover:border-[var(--color-border-strong)]",
  ghost: "bg-transparent text-text hover:bg-[var(--color-primary-subtle)]",
  success: "bg-success text-white hover:opacity-90",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "text-[13px] px-3.5 py-2 gap-1.5 min-h-11",
  md: "text-[15px] px-5 py-3 gap-2 min-h-11",
  lg: "text-[16px] px-7 py-3.5 gap-2 min-h-11",
};

/** href renders as a next/link Link; otherwise a native <button>. Same variant/size classes either way. */
export default function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-sm font-[600] transition-[opacity,border-color,background-color] disabled:cursor-not-allowed disabled:opacity-50",
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  return (
    <button disabled={disabled} className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
