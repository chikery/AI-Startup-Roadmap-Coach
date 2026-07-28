"use client";

import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/app/lib/cn";

interface AccordionProps {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export default function Accordion({ summary, children, defaultOpen = false, className }: AccordionProps) {
  return (
    <details className={cn("group", className)} open={defaultOpen}>
      <summary
        className="flex cursor-pointer list-none items-center justify-between gap-2 px-1 py-2.5 text-[13.5px] font-[600] text-text [&::-webkit-details-marker]:hidden"
      >
        {summary}
        <ChevronDown size={16} className="flex-shrink-0 text-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="pt-2">{children}</div>
    </details>
  );
}
