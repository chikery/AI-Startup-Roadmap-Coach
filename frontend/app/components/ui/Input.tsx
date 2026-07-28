import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/app/lib/cn";

const FIELD_CLASS =
  "w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-[14px] text-text placeholder:text-muted outline-none transition-colors focus:border-primary disabled:opacity-50";

interface FieldWrapProps {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

function FieldWrap({ label, error, children }: FieldWrapProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && <span className="text-[13px] font-[600] text-text">{label}</span>}
      {children}
      {error && <span className="text-[12px] font-[600] text-error">{error}</span>}
    </label>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, ...props },
  ref
) {
  const field = (
    <input
      ref={ref}
      className={cn(FIELD_CLASS, error && "border-error", className)}
      {...props}
    />
  );
  return label || error ? <FieldWrap label={label} error={error}>{field}</FieldWrap> : field;
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, ...props },
  ref
) {
  const field = (
    <textarea
      ref={ref}
      className={cn(FIELD_CLASS, "resize-none leading-relaxed", error && "border-error", className)}
      {...props}
    />
  );
  return label || error ? <FieldWrap label={label} error={error}>{field}</FieldWrap> : field;
});
