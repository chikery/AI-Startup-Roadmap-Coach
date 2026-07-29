"use client";

import { useState } from "react";
import { SUPPORT_PROGRAMS, SupportProgram, isExpired, daysLeft } from "@/app/lib/support-programs";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";

interface Props {
  currentStep: number;
}

interface RankedProgram extends SupportProgram {
  expired: boolean;
  left: number;
  matched: boolean;
}

export default function GovernmentSupportCard({ currentStep }: Props) {
  const [open, setOpen] = useState(false);

  const ranked = SUPPORT_PROGRAMS
    .map((p) => ({ ...p, expired: isExpired(p.deadline), left: daysLeft(p.deadline), matched: p.steps.includes(currentStep) }))
    .filter((p) => !p.expired)
    .sort((a, b) => (Number(b.matched) - Number(a.matched)) || a.left - b.left);

  const preview = ranked.slice(0, 2);
  const rest = ranked.slice(2);

  return (
    <Card variant="glass" padding="md">
      <div className="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="var(--color-accent)"/></svg>
        <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>지금 신청 가능한 지원사업</span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {preview.map((p, i) => (
          <SupportRow key={i} p={p} />
        ))}
        {open && rest.map((p, i) => (
          <SupportRow key={`r${i}`} p={p} />
        ))}
      </div>

      {rest.length > 0 && (
        <Button
          onClick={() => setOpen((v) => !v)}
          variant="ghost"
          size="sm"
          className="mt-3 w-full text-primary"
        >
          {open ? "접기" : `${rest.length}개 더 보기`}
        </Button>
      )}
    </Card>
  );
}

function SupportRow({ p }: { p: RankedProgram }) {
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-md p-3 no-underline transition-colors"
      style={{
        background: p.matched ? "color-mix(in srgb, var(--color-accent) 14%, var(--color-surface))" : "color-mix(in srgb, var(--color-surface) 60%, transparent)",
        border: `1px solid ${p.matched ? "color-mix(in srgb, var(--color-accent) 40%, transparent)" : "var(--color-border)"}`,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[13px] font-bold leading-snug" style={{ color: "var(--color-text)" }}>{p.name}</span>
        {p.matched && (
          <Badge variant="accent" className="flex-shrink-0 whitespace-nowrap text-[10px]">
            현재 단계
          </Badge>
        )}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px]">
        <span className="font-bold" style={{ color: p.left <= 7 ? "var(--color-error)" : "var(--color-muted)" }}>
          D-{p.left} · {p.deadline.slice(5).replace("-", "/")}
        </span>
        <span style={{ color: "var(--color-muted)" }}>{p.maxSupport}</span>
      </div>
    </a>
  );
}
