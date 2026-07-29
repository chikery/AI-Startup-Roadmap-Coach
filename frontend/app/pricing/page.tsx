"use client";

import Link from "next/link";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import ThemeSwitcher from "@/app/components/ui/ThemeSwitcher";
import Drawer from "@/app/components/ui/Drawer";
import PoweredBySolar from "@/app/components/ui/PoweredBySolar";
import { cn } from "@/app/lib/cn";
import { PRICING_PLANS } from "./plans-data";

export default function PricingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 12% 6%, color-mix(in srgb, var(--color-primary) 20%, transparent) 0%, transparent 42%)," +
            "radial-gradient(circle at 92% 12%, color-mix(in srgb, var(--color-accent) 18%, transparent) 0%, transparent 40%)," +
            "radial-gradient(circle at 22% 96%, color-mix(in srgb, var(--color-secondary) 18%, transparent) 0%, transparent 46%)",
        }}
      />

      <div className="relative z-10">
        {/* HEADER — same pattern as programs/page.tsx; no BottomNav (not one of its
            3 core destinations) and no notifications/logout (public, pre-login page) */}
        <header className="glass border-b border-border px-6 py-4" style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="font-[800] text-text no-underline">StepUp</Link>
            <div className="flex items-center gap-3">
              <PoweredBySolar className="hidden md:inline-flex" />
              <ThemeSwitcher className="hidden md:inline-flex" />
              <Link href="/" className="hidden text-[13px] text-muted no-underline hover:text-text md:inline">← 홈</Link>

              <Drawer
                title="메뉴"
                trigger={(open) => (
                  <button
                    onClick={open}
                    aria-label="메뉴 더보기"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border-none bg-transparent text-muted md:hidden"
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="12" r="1.8" fill="currentColor"/><circle cx="12" cy="12" r="1.8" fill="currentColor"/><circle cx="19" cy="12" r="1.8" fill="currentColor"/></svg>
                  </button>
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-muted">테마</span>
                  <ThemeSwitcher />
                </div>
              </Drawer>
            </div>
          </div>
        </header>

        <main className="max-w-[1100px] mx-auto px-5 pt-8 pb-16 sm:px-6 sm:py-14">
          <div className="mb-10 text-center">
            <h1 className="text-[26px] sm:text-h3 font-[800] text-text m-0">합리적인 요금제</h1>
            <p className="text-[14px] text-muted mt-2">아이디어 검증부터 팀 단위 창업 준비까지, 단계에 맞는 플랜을 선택하세요.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <Card
                key={plan.id}
                variant="glass"
                padding="lg"
                className={cn("relative flex flex-col", plan.highlighted && "border-2 border-accent")}
              >
                {plan.highlighted && (
                  <Badge variant="accent" className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px]">
                    Most popular
                  </Badge>
                )}

                <div className="mb-5">
                  <div className="text-[18px] font-[800] text-text">{plan.name}</div>
                  <p className="mt-1 text-[13px] text-muted">{plan.tagline}</p>
                </div>

                <div className="mb-6 flex items-end gap-1.5">
                  <span className="text-[34px] font-[800] tabular-nums text-text">{plan.price}</span>
                  {plan.priceUnit && <span className="mb-1.5 text-[13px] font-semibold text-muted">{plan.priceUnit}</span>}
                </div>

                <ul className="mb-6 flex flex-1 flex-col gap-2.5 list-none p-0 m-0">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13.5px] text-text">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                        <path d="M20 6L9 17l-5-5" stroke="var(--color-success)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  href={plan.ctaHref}
                  variant={plan.highlighted ? "primary" : "secondary"}
                  size="lg"
                  className="w-full rounded-full"
                >
                  {plan.ctaLabel}
                </Button>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
