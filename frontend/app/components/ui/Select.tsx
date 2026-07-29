import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/app/lib/cn";

const FIELD_CLASS =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-[14px] text-text outline-none transition-colors focus:border-primary disabled:opacity-50";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className, children, ...props },
  ref
) {
  const field = (
    <select ref={ref} className={cn(FIELD_CLASS, error && "border-error", className)} {...props}>
      {children}
    </select>
  );
  return label || error ? (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-[13px] font-[600] text-text">{label}</span>}
      {field}
      {error && <span className="text-[12px] font-[600] text-error">{error}</span>}
    </label>
  ) : (
    field
  );
});
