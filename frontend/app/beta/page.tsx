"use client";

import Link from "next/link";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import ThemeSwitcher from "@/app/components/ui/ThemeSwitcher";
import Drawer from "@/app/components/ui/Drawer";
import PoweredBySolar from "@/app/components/ui/PoweredBySolar";
import { PRICING_PLANS } from "@/app/pricing/plans-data";

// Free 플랜의 제한된 항목(로드맵 3회 등)은 제외 — 지금은 그 제한 없이 Pro·Business
// 플랜의 기능까지 전부 무료로 열려있다는 게 이 페이지의 요점이라, 헷갈리지 않게
// 유료 플랜(Pro·Business) 기능만 모아서 보여준다.
const ALL_FEATURES = Array.from(
  new Set(PRICING_PLANS.filter((p) => p.id !== "free").flatMap((p) => p.features))
);

export default function BetaPage() {
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
        {/* HEADER — same pattern as pricing/programs */}
        <header className="glass border-b border-border px-6 py-4" style={{ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="font-[800] text-text no-underline">StepUp</Link>
            <div className="flex items-center gap-3">
              <PoweredBySolar className="hidden md:inline-flex" />
              <ThemeSwitcher className="hidden md:inline-flex" />
              <Link href="/pricing" className="hidden text-[13px] text-muted no-underline hover:text-text md:inline">← 요금제</Link>

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

        <main className="max-w-[720px] mx-auto px-5 pt-12 pb-20 sm:px-6 sm:pt-20">
          <div className="text-center">
            <Badge variant="accent" className="[font-family:var(--font-geist)] px-[15px] py-2 text-[12.5px] tracking-[0.06em]">BETA</Badge>
            <h1 className="mt-5 text-[26px] sm:text-h3 font-[800] leading-[1.3] text-text">지금은 베타 서비스 기간입니다</h1>
            <p className="mt-4 text-[15px] leading-[1.7] text-muted">
              StepUp은 더 완성도 높은 서비스를 만들기 위해 베타 테스트를 진행하고 있습니다.
              Pro·Business 유료 요금제는 정식 출시 이후 순차적으로 적용될 예정이며,
              그 전까지는 두 플랜에 포함된 기능을 포함해 모든 기능을 제한 없이 무료로 이용하실 수 있습니다.
            </p>
          </div>

          <Card variant="glass" radius="lg" padding="lg" className="mt-10">
            <div className="text-[13px] font-[700] tracking-[0.04em] text-primary">지금 무료로 이용 가능한 기능</div>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 list-none p-0 m-0 sm:grid-cols-2">
              {ALL_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[13.5px] text-text">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                    <path d="M20 6L9 17l-5-5" stroke="var(--color-success)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </Card>

          <p className="mt-8 text-center text-[14px] leading-[1.7] text-muted">
            지금 사용해 보시고 느끼신 점을 들려주시면, 정식 출시 전 서비스를 다듬는 데 큰 도움이 됩니다.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button href="/dashboard" variant="primary" size="lg" className="w-full rounded-full sm:w-auto">무료로 시작하기 →</Button>
            <Button href="/pricing" variant="secondary" size="lg" className="w-full rounded-full sm:w-auto">요금제로 돌아가기</Button>
          </div>
        </main>
      </div>
    </div>
  );
}
