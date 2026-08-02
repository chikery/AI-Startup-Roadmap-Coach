import Link from "next/link";
import ThemeSwitcher from "./components/ui/ThemeSwitcher";
import Button from "./components/ui/Button";
import Card from "./components/ui/Card";
import Badge from "./components/ui/Badge";
import PoweredBySolar from "./components/ui/PoweredBySolar";
import { cn } from "./lib/cn";

const SECONDARY_TINT = "color-mix(in srgb, var(--color-secondary) 16%, transparent)";
const SECONDARY_BORDER_30 = "color-mix(in srgb, var(--color-secondary) 30%, transparent)";
const SECONDARY_BORDER_35 = "color-mix(in srgb, var(--color-secondary) 35%, transparent)";
const ON_DARK_45 = "color-mix(in srgb, var(--color-background) 45%, transparent)";
const ON_DARK_60 = "color-mix(in srgb, var(--color-background) 60%, transparent)";
const ON_DARK_70 = "color-mix(in srgb, var(--color-background) 70%, transparent)";
const ON_DARK_10 = "color-mix(in srgb, var(--color-background) 10%, transparent)";
const ON_DARK_14 = "color-mix(in srgb, var(--color-background) 14%, transparent)";
const DONE_BUBBLE = "color-mix(in srgb, var(--color-secondary) 28%, transparent)";

export default function Home() {
  return (
    <div className="relative overflow-x-hidden bg-background font-['Pretendard',_sans-serif] text-text">

      {/* Ambient blurred color blobs — background stays inline: 4 chained radial-gradients each with
          nested color-mix() would be unreadable as a single arbitrary-value class. */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 12% 6%, color-mix(in srgb, var(--color-primary) 16%, transparent) 0%, transparent 42%)," +
            "radial-gradient(circle at 92% 28%, color-mix(in srgb, var(--color-accent) 14%, transparent) 0%, transparent 40%)," +
            "radial-gradient(circle at 15% 72%, color-mix(in srgb, var(--color-secondary) 14%, transparent) 0%, transparent 46%)," +
            "radial-gradient(circle at 88% 92%, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 44%)",
        }}
      />

      <div className="relative z-[1]">

        {/* NAV */}
        <nav className="glass sticky top-0 z-50 rounded-none border-l-0 border-r-0 border-t-0">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3.5 md:px-10">
            <div className="flex items-center gap-[9px]">
              <img
                src={(process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/logo-icon.png"}
                alt="StepUp"
                width={32}
                height={32}
                className="block h-8 w-8 rounded-sm"
              />
              <span className="[font-family:var(--font-geist)] text-[20px] font-bold tracking-[-0.01em]">Stepup</span>
            </div>
            <div className="landing-nav-links items-center gap-7 text-[15px] font-medium text-muted whitespace-nowrap">
              <Link href="/guide#how" className="text-inherit no-underline">전체 이용 가이드</Link>
              <Link href="/guide#match" className="text-inherit no-underline">지원사업 매칭</Link>
              <Link href="/guide#write" className="text-inherit no-underline">사업계획서 작성</Link>
              <Link href="/pricing" className="text-inherit no-underline">가격</Link>
              <ThemeSwitcher />
              <Button href="/dashboard" variant="primary" size="md" className="rounded-full">무료로 시작하기</Button>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <ThemeSwitcher />
              <Button href="/dashboard" variant="primary" size="sm" className="shrink-0 rounded-full">시작하기</Button>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            className="absolute -top-[140px] -right-[60px] h-[480px] w-[480px] animate-[floaty_9s_ease-in-out_infinite] rounded-full opacity-75 blur-[12px]"
            style={{ background: "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--color-primary) 45%, transparent), transparent 70%)" }}
          />
          <div
            className="absolute -bottom-[180px] -left-[80px] h-[420px] w-[420px] animate-[floaty2_11s_ease-in-out_infinite] rounded-full opacity-[0.55] blur-[16px]"
            style={{ background: "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-secondary) 40%, transparent), transparent 70%)" }}
          />
          <div className="landing-hero-grid relative z-[2] mx-auto max-w-[1200px] items-center">
            <div>
              <Badge variant="default" className="[font-family:var(--font-geist)] px-[15px] py-2 text-[13.5px] tracking-[0.06em]">IDEA → PLAN → FUND</Badge>
              <h1 className="landing-hero-title mt-6 [font-family:var(--font-geist)] font-extrabold leading-[1.1] tracking-[-0.03em]">아이디어를<br /><span className="text-primary">사업으로</span> 키우는<br />가장 빠른 길.</h1>
              <p className="mt-6 max-w-[520px] text-[17px] leading-[1.6] text-muted">창업 아이디어만 있다면 충분해요. AI 코치가 <b className="text-text">7단계로 사업계획서</b>를 완성하고, 지금 신청 가능한 <b className="text-text">정부지원사업</b>까지 매칭해 드립니다.</p>
              <div className="mt-8 flex flex-wrap items-center gap-[13px]">
                <Button
                  href="/dashboard"
                  variant="primary"
                  size="lg"
                  className="rounded-full"
                  style={{ boxShadow: "0 14px 30px -10px color-mix(in srgb, var(--color-text) 45%, transparent)" }}
                >무료로 시작하기 →</Button>
                <Button href="#preview" variant="secondary" size="lg" className="rounded-full">데모 둘러보기</Button>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-3 text-[13.5px] text-muted">
                <span className="inline-flex">
                  {(["bg-primary", "bg-secondary", "bg-error"] as const).map((c, i) => (
                    <span key={i} className={cn("inline-block h-[26px] w-[26px] rounded-full border-2 border-background", c, i > 0 && "-ml-2")} />
                  ))}
                </span>
                문체부 · 중기부 · 예술경영지원센터 공고 <b className="text-text">반영</b>
              </div>
            </div>
            {/* Mockup — desktop only; too dense to responsively shrink, hidden on mobile */}
            <div className="landing-hero-mockup relative">
              <div className="glass overflow-hidden rounded-lg">
                <div className="flex items-center gap-2 border-b border-border bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-4 py-[13px]">
                  {(["bg-[#E5675B]", "bg-[#F4BE4F]", "bg-[#61C554]"] as const).map((c, i) => <span key={i} className={cn("h-[11px] w-[11px] rounded-full", c)} />)}
                  <span className="flex-1 text-center text-[12px] text-muted">app.stepup.kr / write</span>
                </div>
                <div className="grid grid-cols-[168px_1fr]">
                  <div className="bg-text px-[13px] py-[18px] text-[color-mix(in_srgb,var(--color-background)_70%,transparent)]">
                    <div className="mb-3 text-[10.5px] font-semibold tracking-[0.08em] text-[color-mix(in_srgb,var(--color-background)_45%,transparent)]">ROADMAP</div>
                    {([
                      { n: "✓", label: "문제 발견", active: false, done: true },
                      { n: "✓", label: "시장·고객 리서치", active: false, done: true },
                      { n: "3", label: "솔루션 & MVP", active: true, done: false },
                      { n: "4", label: "비즈니스 모델", active: false, done: false },
                      { n: "5", label: "실행 로드맵", active: false, done: false },
                      { n: "6", label: "재무 계획", active: false, done: false },
                      { n: "7", label: "피치덱 완성", active: false, done: false },
                    ] as Array<{n:string;label:string;active:boolean;done:boolean}>).map((s) => (
                      <div
                        key={s.label}
                        className="mb-[3px] flex items-center gap-[9px] rounded-sm px-2 py-[7px]"
                        style={{ background: s.active ? SECONDARY_TINT : "transparent" }}
                      >
                        <span
                          className="inline-flex h-[19px] w-[19px] items-center justify-center rounded-full [font-family:var(--font-geist)] text-[10px] font-bold"
                          style={{
                            background: s.done ? DONE_BUBBLE : s.active ? "var(--color-secondary)" : ON_DARK_10,
                            color: s.done ? ON_DARK_70 : s.active ? "var(--color-text)" : ON_DARK_45,
                          }}
                        >{s.n}</span>
                        <span
                          className="whitespace-nowrap text-[12px]"
                          style={{
                            color: s.done ? ON_DARK_60 : s.active ? "var(--color-background)" : ON_DARK_45,
                            fontWeight: s.active ? 700 : 400,
                          }}
                        >{s.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="relative min-h-[380px] px-[22px] pt-[22px] pb-6">
                    <div className="text-[12px] font-bold tracking-[0.04em] text-primary">STEP 3 · 솔루션 &amp; MVP 설계</div>
                    <div className="mt-[6px] mb-[14px] text-[18px] font-bold tracking-[-0.01em] text-text">핵심 솔루션을 한 문장으로 정의해 볼까요?</div>
                    <div className="rounded-md border border-border bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--color-surface))] px-[15px] py-[14px] text-[13.5px] leading-[1.7] text-text">
                      <Badge variant="default" className="mb-[9px] gap-1.5 text-[11px]">✦ AI 초안</Badge><br />
                      지역 예술가의 작품을 <b>구독형 큐레이션</b>으로 매달 엄선해 배송하고, 구매 전 실물을 집에서 체험하게 하여 <b>온라인 구매 거부감</b>이라는 문제를 해소합니다.
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span className="rounded-sm bg-text px-[15px] py-[9px] text-[12.5px] font-semibold text-background">이대로 저장</span>
                      <span className="rounded-sm border border-border px-[15px] py-[9px] text-[12.5px] font-semibold text-text">↻ 다시 생성</span>
                    </div>
                    <div className="glass absolute right-[18px] bottom-[18px] w-[232px] animate-[floaty_7s_ease-in-out_infinite] rounded-md px-[15px] py-[14px]">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10.5px] font-bold tracking-[0.04em] text-muted">🎯 추천 지원사업</span>
                        <Badge variant="default" className="text-[10.5px]">매칭 94%</Badge>
                      </div>
                      <div className="text-[13.5px] font-bold leading-[1.35] text-text">예비창업패키지 2026</div>
                      <div className="mt-[3px] text-[11.5px] text-muted">중소벤처기업부 · 최대 1억원</div>
                      <div className="mt-2 text-[11px] font-bold text-error">D-12 · 마감 임박</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TRUST MARQUEE */}
        <section className="glass overflow-hidden rounded-none border-l-0 border-r-0 py-[22px]">
          <div className="mx-auto flex max-w-[1200px] items-center gap-[18px] px-10">
            <span className="shrink-0 whitespace-nowrap text-[13px] font-semibold text-muted">실시간 반영 공고 기관</span>
            {/* Mask stays inline: needs identical linear-gradient duplicated on both the
                webkit-prefixed and standard mask-image props for Safari support. */}
            <div
              className="flex-1 overflow-hidden"
              style={{
                WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
                maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
              }}
            >
              <div className="flex w-max animate-[marquee_26s_linear_infinite] gap-11 [font-family:var(--font-geist)] text-[17px] font-semibold text-muted">
                {(["중소벤처기업부","문화체육관광부","예술경영지원센터","창업진흥원","중소기업진흥공단","한국콘텐츠진흥원","K-Startup","중소벤처기업부","문화체육관광부","예술경영지원센터","창업진흥원","중소기업진흥공단","한국콘텐츠진흥원","K-Startup"] as string[]).map((o,i) => <span key={i}>{o}</span>)}
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM */}
        <section className="landing-section-pad mx-auto max-w-[1200px]">
          <div className="[font-family:var(--font-geist)] text-[14px] font-semibold tracking-[0.06em] text-error">THE PROBLEM</div>
          <h2 className="landing-cta-heading mt-[14px] max-w-[720px] [font-family:var(--font-geist)] font-extrabold leading-[1.18] tracking-[-0.03em]">좋은 아이디어는 있는데,<br />사업계획서 앞에서 멈춰 있나요?</h2>
          <p className="mt-4 max-w-[600px] text-[16px] leading-[1.6] text-muted">예비 창업자 대부분이 같은 벽에 부딪혀요. Stepup은 이 네 가지를 정확히 풀어줍니다.</p>
          <div className="landing-feature-grid mt-10">
            {([
              { emoji: "🧭", title: "어디서부터 써야 할지 막막함", desc: "빈 문서 앞의 막막함. AI가 첫 질문부터 단계로 끌어줍니다." },
              { emoji: "📑", title: "낯선 양식과 어려운 용어", desc: "TAM·BM·피치덱… 용어를 몰라도 채워지는 검증된 프레임." },
              { emoji: "🔍", title: "흩어진 지원사업 공고", desc: "기관마다 흩어진 공고. 내 아이템에 맞는 것만 골라 드려요." },
              { emoji: "💬", title: "피드백 줄 사람이 없음", desc: "혼자 쓰면 비는 논리. 단계마다 AI가 약점을 짚어줍니다." },
            ] as Array<{emoji:string;title:string;desc:string}>).map((c) => (
              <Card key={c.title} variant="glass" radius="lg" padding="none" className="px-[22px] py-[26px]">
                <div className="text-[26px]">{c.emoji}</div>
                <div className="mt-[14px] mb-2 text-[17px] font-bold">{c.title}</div>
                <p className="m-0 text-[14px] leading-[1.6] text-muted">{c.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="bg-text py-14 text-background md:py-[104px]">
          <div className="mx-auto max-w-[1200px] px-5 md:px-10">
            <div className="flex flex-wrap items-end justify-between gap-[30px]">
              <div>
                <div className="[font-family:var(--font-geist)] text-[14px] font-semibold tracking-[0.06em] text-secondary">HOW IT WORKS</div>
                <h2 className="landing-cta-heading mt-[14px] [font-family:var(--font-geist)] font-extrabold leading-[1.18] tracking-[-0.03em]">7단계만 따라오면,<br />사업계획서가 완성됩니다.</h2>
              </div>
              <p className="m-0 max-w-[360px] text-[16px] leading-[1.6] text-[color-mix(in_srgb,var(--color-background)_65%,transparent)]">각 단계에서 AI가 질문하고 초안을 씁니다. 단계를 마칠 때마다 그 내용에 맞는 지원사업이 자동으로 매칭돼요.</p>
            </div>
            <div className="mt-12 md:mt-16">
            <div className="flex flex-col">
              {([
                { n: 1, title: "문제 발견", sub: "Problem", desc: "해결할 문제와 진짜 고객이 누구인지 명확히 합니다.", grant: "+ 예비창업패키지", isFirst: true, isLast: false },
                { n: 2, title: "시장·고객 리서치", sub: "Research", desc: "시장 규모(TAM·SAM·SOM)와 경쟁사를 데이터 기반으로 정리합니다.", grant: "+ 청년창업사관학교", isFirst: false, isLast: false },
                { n: 3, title: "솔루션 & MVP 설계", sub: "Solution", desc: "핵심 가치 제안과 최소 기능 제품(MVP)을 정의합니다.", grant: "+ 초기창업패키지", isFirst: false, isLast: false },
                { n: 4, title: "비즈니스 모델", sub: "Business Model", desc: "수익 구조와 가격 전략, 비용 구조를 설계합니다.", grant: "+ 콘텐츠 스타트업 육성", isFirst: false, isLast: false },
                { n: 5, title: "실행 로드맵", sub: "Execution", desc: "마일스톤과 팀 구성, 일정 계획을 세웁니다.", grant: "+ 창업도약패키지", isFirst: false, isLast: false },
                { n: 6, title: "재무 계획", sub: "Financials", desc: "추정 매출과 자금 소요·조달 계획을 작성합니다.", grant: "+ 예술인 창업지원", isFirst: false, isLast: false },
                { n: 7, title: "피치덱 완성", sub: "Pitch Deck", desc: "앞선 6단계가 자동으로 통합된 발표자료가 완성됩니다.", grant: "최종 산출물", isFirst: false, isLast: true },
              ] as Array<{n:number;title:string;sub:string;desc:string;grant:string;isFirst:boolean;isLast:boolean}>).map((s) => (
                <div key={s.n} className="landing-how-row grid">
                  <div className="relative flex flex-col items-center">
                    <span
                      className="relative z-[2] inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full [font-family:var(--font-geist)] text-[17px] font-bold md:h-[52px] md:w-[52px] md:text-[20px]"
                      style={{
                        background: s.isFirst ? "var(--color-secondary)" : s.isLast ? "var(--color-error)" : SECONDARY_TINT,
                        color: s.isFirst ? "var(--color-text)" : s.isLast ? "var(--color-background)" : "var(--color-secondary)",
                        border: (!s.isFirst && !s.isLast) ? `1px solid ${SECONDARY_BORDER_30}` : "none",
                      }}
                    >{s.n}</span>
                    {!s.isLast && (
                      <span
                        className="absolute top-5 bottom-[-20px] left-[19px] z-0 w-[2px] md:left-[31px]"
                        style={{ background: s.isFirst ? `linear-gradient(var(--color-secondary), ${ON_DARK_14})` : ON_DARK_14 }}
                      />
                    )}
                  </div>
                  <div className={cn("landing-how-inner min-w-0", s.isLast ? "pb-0" : "pb-7")}>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="m-0 text-[20px] font-bold [word-break:keep-all]">{s.title}</h3>
                        <span className="[font-family:var(--font-geist)] text-[13px] text-[color-mix(in_srgb,var(--color-background)_45%,transparent)]">{s.sub}</span>
                      </div>
                      <p className="mt-2 max-w-[560px] text-[14.5px] leading-[1.6] text-[color-mix(in_srgb,var(--color-background)_65%,transparent)]">{s.desc}</p>
                    </div>
                    <span
                      className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px]"
                      style={{
                        fontWeight: s.isLast ? 700 : 600,
                        color: s.isLast ? "var(--color-background)" : "var(--color-secondary)",
                        background: s.isLast ? "var(--color-error)" : "transparent",
                        border: s.isLast ? "none" : `1px solid ${SECONDARY_BORDER_35}`,
                      }}
                    >{s.grant}</span>
                  </div>
                </div>
              ))}
            </div>
            </div>
          </div>
        </section>

        {/* MATCHING */}
        <section id="match" className="landing-section-pad mx-auto max-w-[1200px]">
          <div className="landing-match-grid items-center">
            <div>
              <div className="[font-family:var(--font-geist)] text-[14px] font-semibold tracking-[0.06em] text-error">SMART MATCHING</div>
              <h2 className="landing-cta-heading mt-[14px] [font-family:var(--font-geist)] font-extrabold leading-[1.18] tracking-[-0.03em]">계획서를 쓰는 동안,<br />지원금이 찾아옵니다.</h2>
              <p className="mt-[18px] text-[16px] leading-[1.65] text-muted">아이템 분야·창업 단계·지역을 입력하면 RAG 엔진이 수백 개 공고를 분석해 <b className="text-text">적합도 순으로</b> 추천해요.</p>
              <div className="mt-8 flex flex-wrap gap-8">
                {([{ n: "340+", label: "실시간 추적 공고" }, { n: "7개", label: "연동 정부·기관" }, { n: "94%", label: "상위 추천 적합도" }] as Array<{n:string;label:string}>).map((s) => (
                  <div key={s.label}>
                    <div className="[font-family:var(--font-geist)] text-[38px] font-extrabold leading-none text-primary">{s.n}</div>
                    <div className="mt-1.5 text-[13.5px] text-muted">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3.5">
              {([
                { pct: "94%", name: "예비창업패키지 2026", org: "중소벤처기업부 · 최대 1억원 · 일반형", d: "D-12", urgent: true },
                { pct: "88%", name: "초기창업패키지", org: "창업진흥원 · 최대 1억원 · 3년 이내", d: "D-30", urgent: false },
                { pct: "81%", name: "예술인 창업 지원사업", org: "예술경영지원센터 · 최대 3천만원", d: "D-45", urgent: false },
              ] as Array<{pct:string;name:string;org:string;d:string;urgent:boolean}>).map((g) => (
                <Card key={g.name} variant="glass" radius="lg" padding="none" className="flex items-center gap-[18px] px-[22px] py-5">
                  <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--color-primary)_14%,var(--color-surface))] [font-family:var(--font-geist)] text-[17px] font-extrabold text-primary">{g.pct}</div>
                  <div className="flex-1">
                    <div className="text-[16.5px] font-bold">{g.name}</div>
                    <div className="mt-[3px] text-[13px] text-muted">{g.org}</div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-[13px] font-bold", g.urgent ? "text-error" : "text-primary")}>{g.d}</div>
                    <div className="mt-0.5 whitespace-nowrap text-[11.5px] text-muted">{g.urgent ? "마감 임박" : "접수 중"}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCT PREVIEW */}
        <section id="preview" className="landing-section-pad border-t border-border">
          <div className="mx-auto max-w-[1200px] px-5 text-center md:px-10">
            <div className="[font-family:var(--font-geist)] text-[14px] font-semibold tracking-[0.06em] text-primary">THE PRODUCT</div>
            <h2 className="landing-cta-heading mt-[14px] [font-family:var(--font-geist)] font-extrabold leading-[1.18] tracking-[-0.03em]">AI와 대화하듯, 한 단계씩.</h2>
            <p className="mx-auto mt-[14px] max-w-[560px] text-[16px] leading-[1.6] text-muted">질문에 답하면 AI가 초안을 쓰고, 당신은 다듬기만 하면 됩니다.</p>
          </div>
          <div className="mx-auto mt-10 max-w-[1080px] px-5 md:mt-[52px] md:px-10">
            <Card variant="glass" radius="lg" padding="none" className="overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-[18px] py-3.5">
                {(["bg-[#E5675B]","bg-[#F4BE4F]","bg-[#61C554]"] as const).map((c,i) => <span key={i} className={cn("h-3 w-3 rounded-full", c)} />)}
                <span className="flex-1 text-center text-[12.5px] text-muted">app.stepup.kr / write</span>
              </div>
              <div className="landing-preview-grid">
                <div className="landing-preview-side bg-text px-4 py-[22px] text-[color-mix(in_srgb,var(--color-background)_70%,transparent)]">
                  <div className="mb-[14px] text-[11px] font-semibold tracking-[0.08em] text-[color-mix(in_srgb,var(--color-background)_45%,transparent)]">로드맵 진행률 · 43%</div>
                  <div className="mb-[18px] h-[5px] overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--color-background)_12%,transparent)]"><div className="h-full w-[43%] rounded-full bg-secondary" /></div>
                  {([
                    { n: "✓", label: "문제 발견", done: true, active: false },
                    { n: "✓", label: "시장·고객 리서치", done: true, active: false },
                    { n: "3", label: "솔루션 & MVP", active: true, done: false },
                    { n: "4", label: "비즈니스 모델", done: false, active: false },
                    { n: "5", label: "실행 로드맵", done: false, active: false },
                    { n: "6", label: "재무 계획", done: false, active: false },
                    { n: "7", label: "피치덱 완성", done: false, active: false },
                  ] as Array<{n:string;label:string;done:boolean;active:boolean}>).map((s) => (
                    <div
                      key={s.label}
                      className="mb-[3px] flex items-center gap-2.5 rounded-sm px-2.5 py-[9px]"
                      style={{ background: s.active ? SECONDARY_TINT : "transparent" }}
                    >
                      <span
                        className="inline-flex h-[21px] w-[21px] items-center justify-center rounded-full [font-family:var(--font-geist)] text-[11px] font-bold"
                        style={{
                          background: s.done ? DONE_BUBBLE : s.active ? "var(--color-secondary)" : ON_DARK_10,
                          color: s.done ? ON_DARK_70 : s.active ? "var(--color-text)" : ON_DARK_45,
                        }}
                      >{s.n}</span>
                      <span
                        className="text-[13px]"
                        style={{
                          color: s.done ? ON_DARK_60 : s.active ? "var(--color-background)" : ON_DARK_45,
                          fontWeight: s.active ? 700 : 400,
                        }}
                      >{s.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3.5 px-[28px] py-[26px] text-left">
                  <div className="max-w-[88%] self-start">
                    <div className="mb-[5px] text-[11px] font-semibold text-muted">Stepup AI</div>
                    <div className="rounded-[4px_14px_14px_14px] border border-border bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--color-surface))] px-4 py-[13px] text-[14px] leading-[1.6] text-text">STEP 2에서 정리한 시장 분석을 봤어요. 이제 <b>핵심 솔루션</b>을 한 문장으로 정의해 볼까요?</div>
                  </div>
                  <div className="max-w-[88%] self-end">
                    <div className="rounded-[14px_4px_14px_14px] bg-primary px-4 py-[13px] text-[14px] leading-[1.6] text-white">동네 예술가 작품을 월 구독으로 집에서 체험하고 마음에 들면 구매하는 서비스요.</div>
                  </div>
                  <div className="max-w-[92%] self-start">
                    <div className="mb-[5px] text-[11px] font-semibold text-muted">Stepup AI · ✦ 초안 생성</div>
                    <div className="rounded-[4px_14px_14px_14px] border border-border bg-[color-mix(in_srgb,var(--color-primary)_6%,var(--color-surface))] px-4 py-[14px] text-[14px] leading-[1.7] text-text">
                      좋아요. 사업계획서 문장으로 다듬으면:<br /><br />&ldquo;지역 예술가의 작품을 <b>구독형 큐레이션</b>으로 매달 집에서 체험하고, 마음에 들면 구매하는 서비스로 <b>온라인 미술품 구매의 거부감</b>을 해소합니다.&rdquo;
                    </div>
                    <div className="mt-2.5 flex gap-2">
                      <span className="rounded-sm bg-text px-[15px] py-[9px] text-[12.5px] font-semibold text-background">저장하고 다음 단계 →</span>
                      <span className="rounded-sm border border-border px-[15px] py-[9px] text-[12.5px] font-semibold text-text">수정 요청</span>
                    </div>
                  </div>
                </div>
                <div className="landing-preview-side border-l border-border px-[18px] py-[22px] text-left">
                  <div className="mb-[14px] text-[11.5px] font-bold tracking-[0.04em] text-muted">🎯 이 단계 추천 지원사업</div>
                  {([
                    { pct: "매칭 94%", name: "예비창업패키지 2026", org: "중기부 · 최대 1억원", d: "D-12", urgent: true },
                    { pct: "매칭 81%", name: "예술인 창업 지원사업", org: "예술경영지원센터 · 3천만원", d: "D-45", urgent: false },
                  ] as Array<{pct:string;name:string;org:string;d:string;urgent:boolean}>).map((g) => (
                    <div key={g.name} className="glass mb-2.5 rounded-md px-3.5 py-[13px]">
                      <div className="mb-[7px] flex items-center justify-between">
                        <Badge variant="default" className="text-[10.5px]">{g.pct}</Badge>
                        <span className={cn("text-[10.5px] font-bold", g.urgent ? "text-error" : "text-primary")}>{g.d}</span>
                      </div>
                      <div className="text-[13px] font-bold text-text">{g.name}</div>
                      <div className="mt-[3px] text-[11.5px] text-muted">{g.org}</div>
                    </div>
                  ))}
                  <div className="mt-3 text-center text-[12px] text-muted">계획서가 채워질수록<br />추천이 정교해져요</div>
                </div>
              </div>
            </Card>
            <div className="mt-9 text-center">
              <Button
                href="/dashboard"
                variant="primary"
                size="lg"
                className="rounded-full px-[34px] py-[17px] text-[17px]"
                style={{ boxShadow: "0 14px 30px -10px color-mix(in srgb, var(--color-text) 45%, transparent)" }}
              >직접 작성해 보기 →</Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="pricing" className="landing-section-pad mx-auto max-w-[1200px]">
          <div className="relative overflow-hidden rounded-lg bg-text px-6 py-12 text-center md:p-[72px]">
            <div
              className="absolute -top-[100px] right-[10%] h-[320px] w-[320px] rounded-full blur-[8px]"
              style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-secondary) 22%, transparent), transparent 70%)" }}
            />
            <div className="relative z-[2]">
              <h2 className="landing-cta-heading m-0 [font-family:var(--font-geist)] font-extrabold leading-[1.2] tracking-[-0.03em] text-background">오늘 아이디어를 적으면,<br />이번 주에 지원사업에 신청할 수 있어요.</h2>
              <p className="mt-5 text-[16px] text-[color-mix(in_srgb,var(--color-background)_65%,transparent)]">가입 후 7단계 전부 무료. 카드 등록 없이 바로 시작하세요.</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-[13px]">
                <Button
                  href="/dashboard"
                  variant="primary"
                  size="lg"
                  className="whitespace-nowrap rounded-full bg-background text-[16px] font-bold text-text hover:opacity-90"
                >무료로 시작하기 →</Button>
                <Button
                  href="#how"
                  variant="secondary"
                  size="lg"
                  className="whitespace-nowrap rounded-full border-[1.5px] border-[color-mix(in_srgb,var(--color-background)_45%,transparent)] bg-transparent text-[16px] text-background hover:border-background"
                >작동 방식 보기</Button>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-border px-5 py-8 md:p-[48px_40px]">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-[9px]">
              <img
                src={(process.env.NEXT_PUBLIC_BASE_PATH ?? "") + "/logo-icon.png"}
                alt="StepUp"
                width={28}
                height={28}
                className="block h-7 w-7 rounded-sm"
              />
              <span className="[font-family:var(--font-geist)] text-[17px] font-bold">Stepup</span>
              <span className="ml-2 text-[13px] text-muted">아이디어에서 사업계획서까지, AI 창업 로드맵 코치</span>
            </div>
            <div className="flex items-center gap-4">
              <PoweredBySolar />
              <div className="text-[13px] text-muted">© 2026 Stepup. All rights reserved.</div>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
