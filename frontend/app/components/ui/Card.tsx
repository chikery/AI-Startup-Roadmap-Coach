import { HTMLAttributes } from "react";
import { cn } from "@/app/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "sm" | "md" | "lg";
  variant?: "glass" | "flat";
}

const PADDING_CLASS = {
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export default function Card({ padding = "md", variant = "glass", className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg",
        variant === "glass" ? "glass" : "bg-surface border border-border",
        PADDING_CLASS[padding],
        className
      )}
      {...props}
    />
  );
}
