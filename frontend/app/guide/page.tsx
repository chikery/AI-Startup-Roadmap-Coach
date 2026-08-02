import Link from "next/link";
import ThemeSwitcher from "@/app/components/ui/ThemeSwitcher";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import PoweredBySolar from "@/app/components/ui/PoweredBySolar";
import { cn } from "@/app/lib/cn";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function Shot({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="m-0">
      <Card variant="glass" radius="lg" padding="none" className="overflow-hidden">
        <img src={`${BASE}/guide/${src}`} alt={alt} className="block w-full" />
      </Card>
      <figcaption className="mt-2.5 text-[13px] leading-[1.5] text-muted">{caption}</figcaption>
    </figure>
  );
}

interface Step {
  title: string;
  desc: string;
}

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-5 p-0">
      {steps.map((s, i) => (
        <li key={i} className="flex gap-3.5">
          <span
            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold [font-family:var(--font-geist)]"
            style={{ background: "var(--color-primary-subtle)", color: "var(--color-primary)" }}
          >
            {i + 1}
          </span>
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-text">{s.title}</div>
            <p className="m-0 mt-1 text-[14px] leading-[1.65] text-muted">{s.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function SectionHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="mb-10 max-w-[640px] md:mb-14">
      <div className="[font-family:var(--font-geist)] text-[13px] font-semibold tracking-[0.06em] text-primary">{eyebrow}</div>
      <h2 className="mt-3 [font-family:var(--font-geist)] text-[26px] font-extrabold leading-[1.25] tracking-[-0.02em] text-text md:text-[34px]">{title}</h2>
      <p className="mt-3 text-[15px] leading-[1.65] text-muted md:text-[16px]">{desc}</p>
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="relative overflow-x-hidden bg-background font-['Pretendard',_sans-serif] text-text">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 10% 4%, color-mix(in srgb, var(--color-primary) 14%, transparent) 0%, transparent 40%)," +
            "radial-gradient(circle at 94% 30%, color-mix(in srgb, var(--color-accent) 12%, transparent) 0%, transparent 38%)," +
            "radial-gradient(circle at 12% 80%, color-mix(in srgb, var(--color-secondary) 12%, transparent) 0%, transparent 44%)",
        }}
      />

      <div className="relative z-[1]">
        {/* NAV — same shell as the landing page, but the 3 links now point here (내부 앵커) */}
        <nav className="glass sticky top-0 z-50 rounded-none border-l-0 border-r-0 border-t-0">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3.5 md:px-10">
            <Link href="/" className="flex items-center gap-[9px] no-underline">
              <img src={`${BASE}/logo-icon.png`} alt="StepUp" width={32} height={32} className="block h-8 w-8 rounded-sm" />
              <span className="[font-family:var(--font-geist)] text-[20px] font-bold tracking-[-0.01em] text-text">Stepup</span>
            </Link>
            <div className="landing-nav-links items-center gap-7 text-[15px] font-medium text-muted whitespace-nowrap">
              <a href="#how" className="text-inherit no-underline">작동 방식</a>
              <a href="#match" className="text-inherit no-underline">지원사업 매칭</a>
              <a href="#write" className="text-inherit no-underline">작성 화면</a>
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
        <section className="landing-section-pad mx-auto max-w-[1200px] !pb-8">
          <Badge variant="default" className="[font-family:var(--font-geist)] px-[15px] py-2 text-[13px] tracking-[0.06em]">이용 가이드</Badge>
          <h1 className="landing-cta-heading mt-4 max-w-[720px] [font-family:var(--font-geist)] font-extrabold leading-[1.2] tracking-[-0.02em]">
            실제 화면으로 보는<br />Stepup 사용 방법
          </h1>
          <p className="mt-4 max-w-[620px] text-[16px] leading-[1.65] text-muted">
            여기 나오는 스크린샷은 전부 실제로 동작하는 화면이에요. 어디를 채우고 어떤 버튼을 누르면 무슨 일이 일어나는지, 순서대로 정리했습니다.
          </p>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="landing-section-pad mx-auto max-w-[1200px]">
          <SectionHeader
            eyebrow="HOW IT WORKS"
            title="대시보드에서 로드맵 7단계까지"
            desc="로그인하면 대시보드가 지금 할 일 하나만 딱 짚어줘요. 그걸 누르면 로드맵 STEP 페이지로 들어가서 AI와 함께 초안을 채우고, 코치의 피드백을 받아 다듬습니다."
          />

          <div className="flex flex-col gap-14">
            <div className="grid items-start gap-9 md:grid-cols-[1fr_1fr]">
              <Shot
                src="dashboard-top.jpg"
                alt="대시보드 화면 — 오늘의 미션 카드와 지원사업 카드"
                caption="대시보드 첫 화면. 상단 그라데이션 카드가 '오늘의 미션'이에요 — 로그인 여부·진행 상황에 따라 문구와 버튼이 자동으로 바뀝니다."
              />
              <StepList
                steps={[
                  { title: "회원가입 때 입력한 정보가 전부 개인화 기준이 됩니다", desc: "관심분야·지역·창업 아이템 키워드를 한 번 입력해두면, 이후 지원사업 추천·AI 초안 생성이 전부 이 정보를 기준으로 동작해요." },
                  { title: "\"오늘의 미션\" 카드의 버튼을 누르세요", desc: "다음 단계 시작하기 / 사업계획서 완성하기 / 마감 임박 지원사업 신청하기 — 지금 상황에 맞는 버튼 하나만 큼직하게 떠요. 헷갈릴 필요 없이 그 버튼만 누르면 됩니다." },
                  { title: "왼쪽 사이드바에서 7단계 중 지금 위치를 확인하세요", desc: "완료한 단계는 초록 체크로, 지금 단계는 보라색으로 표시됩니다. 아무 단계나 다시 클릭해서 이전 내용을 고칠 수도 있어요." },
                ]}
              />
            </div>

            <div className="grid items-start gap-9 md:grid-cols-[1fr_1fr]">
              <StepList
                steps={[
                  { title: "\"AI 초안 생성 시작\" 버튼을 누르세요", desc: "회원가입 때 적은 아이템 키워드를 바탕으로 Solar AI가 이 단계의 모든 항목(예: 수익원·가격 전략·비용 구조)을 자동으로 채웁니다. \"✦ AI 초안\" 배지가 붙은 항목이 AI가 채운 부분이에요." },
                  { title: "표 안 내용을 직접 클릭해서 고쳐 쓸 수 있어요", desc: "모든 항목이 편집 가능한 텍스트 영역이라, 마음에 안 드는 문장은 그 자리에서 바로 수정하면 됩니다. 자동 저장은 안 되니 다 고친 뒤엔 꼭 아래 저장 버튼을 눌러주세요." },
                  { title: "\"다시 생성하기\"로 처음부터 새로 받을 수도 있어요", desc: "AI 초안이 마음에 안 들면 우측 상단 버튼으로 완전히 새로운 초안을 다시 받을 수 있습니다." },
                ]}
              />
              <Shot
                src="roadmap-step-after-draft.jpg"
                alt="로드맵 STEP 페이지 — AI 초안 생성 완료 후 항목별 내용이 채워진 화면"
                caption="「AI 초안 생성 시작」을 누른 직후 상태. 초록 배너로 완료를 알려주고, 표의 각 항목에 실제 초안 문구가 채워집니다."
              />
            </div>

            <div className="grid items-start gap-9 md:grid-cols-[1fr_1fr]">
              <Shot
                src="roadmap-step-scrolled.jpg"
                alt="같은 STEP 페이지를 아래로 스크롤한 화면 — 완성도 채점, 코치 요다의 피드백, 저장 버튼"
                caption="같은 페이지를 아래로 내리면 나오는 영역. 점수·등급, 부족한 부분에 대한 코치 피드백, 그리고 저장 버튼이 있어요."
              />
              <StepList
                steps={[
                  { title: "\"완성도 채점\"이 자동으로 점수를 매겨요", desc: "0~100점과 A~D 등급으로 지금 작성한 내용의 완성도를 보여주고, \"보완 필요\" 항목과 구체적인 개선 팁을 함께 제시합니다." },
                  { title: "\"코치 요다의 피드백\"에서 근거 기반 피드백을 받으세요", desc: "TPCS·Vision Canvas 같은 실제 창업 방법론을 근거로 어떤 부분이 왜 부족한지 설명해줍니다. 내용을 고친 뒤 \"피드백 다시 받기\"를 누르면 새로 채점해요 — 이전/이후 비교도 볼 수 있어요." },
                  { title: "\"저장 후 다음 단계\"를 누르면 다음 STEP으로 이동합니다", desc: "당장 다음 단계로 넘어가고 싶지 않다면 \"임시 저장\"만 눌러 지금까지 쓴 내용만 저장할 수도 있어요. 7단계를 전부 완료하면 사업계획서가 자동으로 통합됩니다." },
                ]}
              />
            </div>
          </div>
        </section>

        {/* MATCHING */}
        <section id="match" className="landing-section-pad mx-auto max-w-[1200px] border-t border-border">
          <SectionHeader
            eyebrow="SMART MATCHING"
            title="지원사업, 검색 한 번으로 매칭"
            desc="아이템 정보를 입력하면 지금 신청 가능한 지원사업 중 조건에 맞는 것만 골라 보여줘요. 나머지도 사라지지 않고 그대로 남아있어서, 조건이 안 맞아도 다른 기회를 놓치지 않습니다."
          />

          <div className="flex flex-col gap-14">
            <div className="grid items-start gap-9 md:grid-cols-[1fr_1fr]">
              <Shot
                src="programs-form-filled.jpg"
                alt="지원사업 검색 폼 — 창업 아이템, 로드맵 STEP, 분야, 창업 단계, 지역 입력 필드"
                caption="상단 메뉴 '지원사업'에서 들어갈 수 있는 검색 화면. 로그인 상태라면 회원가입 때 입력한 값이 자동으로 채워져 있어요."
              />
              <StepList
                steps={[
                  { title: "\"창업 아이템\"에 아이템을 한 문장으로 설명하세요", desc: "예: \"지역 예술가 온라인 구독 큐레이션 플랫폼\" — 참고용 텍스트라 자유롭게 적으면 됩니다." },
                  { title: "\"로드맵 STEP\"에서 지금 진행 중인 단계를 선택하세요", desc: "1(아이디어 스파크)부터 7(런칭 데이)까지 — 각 지원사업이 어떤 단계에 맞는지 이미 태깅돼 있어서, 선택한 STEP과 겹치는 공고가 우선 노출됩니다." },
                  { title: "\"분야\"와 \"지역\"도 채워보세요", desc: "분야는 정확히 일치하는 것만, 지역은 \"서울\"처럼 적으면 그 지역이 들어간 공고까지 느슨하게 찾아줍니다 — 비워두면 전국 대상 공고만 기준이 돼요." },
                ]}
              />
            </div>

            <div className="grid items-start gap-9 md:grid-cols-[1fr_1fr]">
              <StepList
                steps={[
                  { title: "\"맞춤 지원사업 추천받기\"를 누르면 바로 결과가 나와요", desc: "서버에 물어보지 않고 그 자리에서 즉시 계산해서 보여주기 때문에 로딩 없이 바로 뜹니다." },
                  { title: "조건에 맞는 공고엔 보라색 테두리 + \"맞춤\" 배지가 붙어요", desc: "\"왜 지금 추천되었나요\" 박스를 펼치면 STEP·분야·지역 중 정확히 무엇이 일치했는지 문장으로 알려줍니다." },
                  { title: "\"신청 조건 확인하기\"를 누르면 실제 공고 페이지로 이동해요", desc: "K-Startup·기업마당·KOCCA·예술경영지원센터 등 각 기관의 진짜 공고 원문으로 바로 연결됩니다." },
                ]}
              />
              <Shot
                src="programs-results.jpg"
                alt="지원사업 검색 결과 — 조건에 맞는 공고 카드에 보라색 테두리와 맞춤 배지 표시"
                caption="검색 버튼을 누른 직후. #1 카드처럼 조건에 맞는 공고만 테두리로 강조되고, 나머지 공고도 아래에 그대로 남아있어요."
              />
            </div>
          </div>
        </section>

        {/* WRITING SCREEN */}
        <section id="write" className="landing-section-pad mx-auto max-w-[1200px] border-t border-border">
          <SectionHeader
            eyebrow="THE PRODUCT"
            title="사업계획서, 다듬는 것만 하면 됩니다"
            desc="7단계를 전부 완료하면 그동안 작성한 내용이 하나의 사업계획서로 자동 통합돼요. 그 문서를 직접 편집하고, 코치 피드백을 받아 완성도를 높일 수 있습니다."
          />

          <div className="flex flex-col gap-14">
            <div className="grid items-start gap-9 md:grid-cols-[1fr_1fr]">
              <Shot
                src="business-plan-top.jpg"
                alt="사업계획서 페이지 — 통합된 문서 보기 모드와 코치 요다의 피드백 패널"
                caption="7단계 완료 후 대시보드의 「사업계획서 보기」를 누르면 나오는 화면. 문제 발견부터 피치덱까지 순서대로 통합돼 있어요."
              />
              <StepList
                steps={[
                  { title: "완성된 문서를 위에서부터 훑어보세요", desc: "STEP 1~7에서 쓴 내용이 문제 발견 → 시장 분석 → ... → 피치덱 순서로 이어진 하나의 글로 합쳐져 있습니다." },
                  { title: "오른쪽 \"코치 요다의 피드백\"을 확인하세요", desc: "전체 사업계획서를 검토한 종합 피드백이 자동으로 표시됩니다." },
                  { title: "\"사업계획서 복사하기\"로 전체를 복사할 수 있어요", desc: "버튼을 누르면 전체 텍스트가 클립보드에 복사돼서, 실제 지원사업 신청서나 이메일에 바로 붙여넣을 수 있습니다." },
                ]}
              />
            </div>

            <div className="grid items-start gap-9 md:grid-cols-[1fr_1fr]">
              <StepList
                steps={[
                  { title: "\"편집\" 버튼을 누르면 전체 문서가 하나의 입력창으로 바뀝니다", desc: "표나 항목 구분 없이 자유 형식 텍스트로 어디든 고쳐 쓸 수 있어요." },
                  { title: "다 고쳤으면 \"저장 완료\", 그만두려면 \"취소\"", desc: "취소를 누르면 편집을 시작하기 전 상태로 그대로 되돌아갑니다 — 고친 내용은 저장하지 않는 이상 반영되지 않아요." },
                  { title: "고친 뒤엔 \"피드백 다시 받기\"를 눌러보세요", desc: "수정한 내용을 반영해서 코치 요다가 다시 검토해줍니다." },
                ]}
              />
              <Shot
                src="business-plan-edit.jpg"
                alt="사업계획서 편집 모드 — 전체 문서가 하나의 텍스트 입력창으로 전환된 화면"
                caption="「편집」을 누른 직후. 보라색 테두리의 입력창 안에서 자유롭게 고쳐 쓰고, 「저장 완료」로 반영합니다."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="landing-section-pad mx-auto max-w-[1200px]">
          <div className="relative overflow-hidden rounded-lg bg-text px-6 py-12 text-center md:p-[64px]">
            <div
              className="pointer-events-none absolute -top-[100px] right-[10%] h-[320px] w-[320px] rounded-full blur-[8px]"
              style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-secondary) 22%, transparent), transparent 70%)" }}
            />
            <div className="relative z-[2]">
              <h2 className="landing-cta-heading m-0 [font-family:var(--font-geist)] font-extrabold leading-[1.2] tracking-[-0.02em] text-background">
                이제 직접 써볼 차례예요.
              </h2>
              <p className="mt-4 text-[16px] text-[color-mix(in_srgb,var(--color-background)_65%,transparent)]">가입 후 7단계 전부 무료. 카드 등록 없이 바로 시작하세요.</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-[13px]">
                <Button
                  href="/dashboard"
                  variant="primary"
                  size="lg"
                  className={cn("whitespace-nowrap rounded-full bg-background text-[16px] font-bold text-text hover:opacity-90")}
                >무료로 시작하기 →</Button>
                <Button
                  href="/"
                  variant="secondary"
                  size="lg"
                  className="whitespace-nowrap rounded-full border-[1.5px] border-[color-mix(in_srgb,var(--color-background)_45%,transparent)] bg-transparent text-[16px] text-background hover:border-background"
                >홈으로 돌아가기</Button>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-border px-5 py-8 md:p-[48px_40px]">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-[9px]">
              <img src={`${BASE}/logo-icon.png`} alt="StepUp" width={28} height={28} className="block h-7 w-7 rounded-sm" />
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
