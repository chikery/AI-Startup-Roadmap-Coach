import { HTMLAttributes, ElementType } from "react";
import { cn } from "@/app/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  variant?: "glass" | "flat";
  radius?: "sm" | "md" | "lg" | "full";
  as?: ElementType; // e.g. "aside"/"section" when the container is a real landmark, not a generic div
}

const PADDING_CLASS = {
  none: "p-0",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

const RADIUS_CLASS = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export default function Card({ padding = "md", variant = "glass", radius = "lg", as: Tag = "div", className, ...props }: CardProps) {
  return (
    <Tag
      className={cn(
        RADIUS_CLASS[radius],
        variant === "glass" ? "glass" : "bg-surface border border-border",
        PADDING_CLASS[padding],
        className
      )}
      {...props}
    />
  );
}
