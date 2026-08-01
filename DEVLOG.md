# 개발일지 — AI Startup Roadmap Coach

> AI 기반 창업 로드맵 코칭 플랫폼

---

## 2026-08-01

### 지원사업 데모 전 최종 점검 — 보안·재사용성·개인화·접근성 4그룹 하드닝

**배경:** 지원사업 데모를 앞두고 보안(JWT 만료/시크릿 노출/입력 검증), 재사용성(STEP2 프리미티브 미채택 잔여 패턴), 개인화(대시보드 추천이 정말 유저별로 다른가), 접근성(포커스/대비/ARIA) 4개 영역을 먼저 읽기 전용으로 조사한 뒤, 그룹별로 승인받고 순서대로 진행했다. 보안 그룹(그룹1, `45315d2`)은 하루 전(2026-07-30)에 먼저 끝나 있었고, 이번 날짜에는 나머지 3개 그룹을 처리했다.

---

### 1. 재사용성 그룹2 — 프리미티브 미채택 패턴 정리 + hero-chip 토큰화

**커밋:** `8e3b112`

STEP2에서 도입한 Button/Card/Badge를 여전히 안 쓰고 있던 곳들을 정리했다: ChatPopup의 raw `<input>`/`<button>` → `Input`/`Button`, business-plan·roadmap·랜딩에 남아있던 손수 `.glass` div 4곳 → `Card`(신규 `as` prop으로 roadmap 사이드바를 실제 `<aside>`로), roadmap의 이중 primary 버튼("AI 초안 생성 시작" vs "저장 후 다음 단계") 중 하나를 secondary로 강등, 손수 스타일한 배지 9곳 → `Badge`. `DraftFormEditor.tsx`는 이번에도 예외로 남겨뒀다 — 실제로는 2026-06-19 리디자인(`c84093c`) 이후 어디서도 import되지 않는 죽은 코드였다는 게 나중에 밝혀졌다(자세한 내용은 대화 기록 참고).

**부수 발견:** secondary로 내린 "AI 초안 생성 시작" 버튼에 적용한 "흰 배경 + primary 텍스트" 스타일이 `bg-white` 하드코딩이었다. STEP1의 하드코딩 색상·`.glass` 언레이어드 CSS 회귀와 같은 부류의 문제가 재발하지 않도록, `globals.css`에 다크/라이트 모드 모두 항상 밝은 값을 유지하는 `--color-hero-chip` 토큰을 새로 추가하고, 같은 패턴으로 하드코딩돼 있던 `TodayMissionCard`의 CTA와 roadmap 아이콘 칩까지 3곳을 이 토큰 하나로 통합했다.

---

### 2. 개인화 그룹3 — 프로필 기반 지원사업/정보허브 우선 노출

**커밋:** `7407612`

조사 결과 대시보드 추천은 로그인 여부와 무관하게 전부 `step` 기준으로만 정렬되고 있었다 — 회원가입 때 받는 `category`/`region`은 `/programs/recommend` RAG 검색에서만 쓰이고 대시보드에서는 한 번도 읽히지 않았다.

- `SUPPORT_PROGRAMS`에 `category`/`region` 필드를 추가하고 19개 항목 전부 태깅. `region`은 회원가입 폼이 자유 텍스트(`placeholder="서울 (비워두면 전국)"`)라 느슨한 부분일치로, `category`는 고정 `<Select>` 값이라 정확 일치로 비교하도록 `matchesRegion`/`profileMatchScore` 헬퍼를 분리했다.
- `GovernmentSupportCard`/`EligibleProgramsCard`가 프로필 매칭 항목을 우선 노출하되, `profileMatchScore`는 프로필이 없는 유저에게 항상 0을 반환해 기존 step 기준 정렬로 자동 폴백 — "결과 0건 금지" 요구사항을 충족.
- **버그 발견 및 수정:** 처음엔 `region: "전국"`인 사업도 지역 매칭 점수에 포함시켜서, 실제로는 관심 지역이 전혀 안 맞는 유저에게도 "맞춤" 배지가 잘못 붙었다. "전국"은 모든 유저에게 항상 참인 조건이라 개인화 신호가 아니므로 점수 계산에서 제외하도록 수정.
- `InfoHubList`의 `rankByStep`은 필터링 대신 비매칭 항목에 `opacity: 0.62`를 적용하는 방식으로 — 정보 허브 카드가 통째로 비어버리는 위험을 피했다.

---

### 3. 접근성 그룹4 — 포커스 링·색 대비·ARIA·포커스 이동/복귀

**커밋:** `200a010`

- roadmap/business-plan 편집용 textarea에 `focus-visible:ring-2 focus-visible:ring-primary` 추가(기존엔 `outline-none`만 있고 대체 포커스 표시가 전혀 없었음).
- `DraftFormEditor.tsx`의 하드코딩된 링 색 `#2D6A4F` → `focus:ring-primary` 토큰 참조로 교체.
- violet 팔레트 라이트 모드 `--color-muted`를 `#8B8894`(대비 3.47:1, AA 미달) → `#6C6976`(대비 5.36:1 / 4.77:1)로 조정. 다크모드·다른 팔레트는 그대로 뒀다.
- `ChatPopup`의 아이콘 전용 버튼 3곳(닫기 ×/전송/FAB 토글)에 `aria-label` 추가, `Escape`로 닫기 지원.
- `Drawer`/`ChatPopup` 모두 열릴 때 패널·입력창으로 포커스 이동, 닫힐 때(Escape·닫기 버튼·토글 재클릭 어떤 경로든) 트리거 요소로 포커스 복귀.

---

## 2026-07-30

### 창업 정보 허브 실데이터 연동 · Pricing 페이지 · 보안 그룹1 하드닝

---

### 1. Pricing 페이지 추가

**커밋:** `5a0d5b6`

Free/Pro/Business 3단 요금제 페이지 신규 추가.

---

### 2. 창업 정보 허브 실데이터 연동 (hub_items)

**커밋:** `7a33ab7`

그 전까지 "창업 정보 허브"(Startup News/정부지원사업 소식/추천 자료)는 전부 하드코딩 목업 배열이었다. K-Startup/기업마당/KOCCA 공고를 주기적으로 긁어와 `HubItem` 테이블에 적재하는 수집기(`backend/app/hub/`: `sources.py`/`tagging.py`/`collector.py`)와 `/hub/items` 조회 API를 신규 추가하고, GitHub Actions 크론(`hub-collect.yml`)으로 주기 실행하도록 구성했다. 프론트는 `GovSupportNewsCard`가 `/hub/items?category=gov_support`를 우선 호출하고, 응답이 비어있으면(수집 전이거나 실패 시) 기존 목업으로 조용히 폴백 — 실데이터가 없다고 화면이 깨지지 않게 했다.

---

### 3. 보안 그룹1 — 무음 401 · JWT 재발급 · 미사용 키 제거 · 입력 검증 · 레이트리밋

**커밋:** `45315d2`

사전 조사에서 나온 4가지를 그대로 구현:

- **무음 401 수정:** `dashboard/page.tsx`의 사업계획서 조회 fetch가 `res.ok`를 확인하지 않아, 401이 와도 에러 토스트 없이 그냥 "계획서 없음"으로 오인되고 있었다. `r.ok` 체크와 에러 토스트를 추가.
- **`POST /auth/refresh` 도입:** 완전히 새로운 리프레시 토큰 체계 대신, 기존 `get_current_user()`(만료 시 401)를 그대로 재사용하는 "재발급-while-valid" 패턴으로 구현 — 앱 로드 시 `AuthRefresher`(렌더링 없는 클라이언트 컴포넌트)가 한 번 조용히 갱신을 시도하고, 실패하면 기존 401 흐름을 그대로 탄다.
- **미사용 시크릿 제거:** `deploy.yml`의 프론트 빌드 스텝에서 실제로는 쓰이지 않던 `SOLAR_API_KEY`/`OPENAI_API_KEY` 환경변수 주입을 제거(둘 다 백엔드 전용 키라 프론트 번들에 들어갈 이유가 없었음).
- **입력 검증 + 레이트리밋:** `UserCreate.password`에 최소 8자 검증, 채팅/생성류 엔드포인트에 텍스트 길이 상한(`Field(max_length=...)` + Pydantic v2 `field_validator` 팩토리), `slowapi` 레이트리밋 미들웨어를 AI 엔드포인트들에 적용(`/chat` 30/분, `/generate`·`/feedback`·`/score`·`/compare` 20/분, `/business-plan` 10/분 등).

**버그 발견 및 수정:** 레이트리밋 테스트(`test_business_plan_rate_limit_triggers`)가 처음엔 11번 요청 모두 200을 반환하고 각 요청이 3~9초씩 걸렸다. 원인 추적 결과, 로컬 `backend/.env`에 실제 `SOLAR_API_KEY`가 들어있었는데 `conftest.py`가 `os.environ.setdefault(...)`로만 처리해 이미 로드된 실제 키를 덮어쓰지 못했고, 그 결과 테스트가 목(mock) 처리한 OpenAI 클라이언트가 아니라 **실제 Upstage Solar API를 매 테스트마다 호출**하고 있었다. `conftest.py`를 강제 할당(`os.environ["SOLAR_API_KEY"] = ""` 등)으로 바꿔 수정 — 테스트 스위트 전체 시간도 94초 → 1.8초로 줄었다.

---

## 2026-07-29

### 공용 UI 프리미티브 확장 · 언레이어드 CSS 근본 수정 · 모바일 UX 전면 재설계 · SOLAR 브랜딩 · 대시보드 재구성 · 정보 허브 · 모바일 알림

---

### 1. 공용 UI 프리미티브 확장 및 전 화면 적용

**커밋:** `6cecc2d`

Button/Card/Badge/Input/Textarea/Accordion/Drawer/Toast는 이미 존재하던 프리미티브. 스펙에 맞게 확장하고 전 화면의 제각각 버튼/카드/배지를 이 컴포넌트로 교체했다.

- **Button**: `href` prop 추가 — 있으면 `next/link` `Link`로, 없으면 `<button>`으로 렌더링(variant/size 클래스는 동일). 랜딩 페이지의 링크 기반 CTA와 앱 내부 버튼을 하나의 컴포넌트로 통일. `variant="success"` 추가(`--color-success` 토큰 사용). 전 사이즈에 `min-h-11`(44px) 터치 타겟 하한 추가.
- **Card**: `padding="none"` + `radius`(sm/md/lg/full) prop 추가 — 프레임워크 테이블처럼 자체 내부 패딩을 쓰는 컴포지트 컨테이너도 Card로 흡수해, `.glass` bespoke div가 화면마다 따로 노는 것을 방지.
- **Select**: signup/programs의 `<select>` 2곳을 위한 신규 공용 폼 프리미티브(Input/Textarea와 같은 묶음).
- 화면당 primary 버튼 1개 원칙 적용 — roadmap의 "저장 후 다음 단계"를 primary로, "AI 인사이트 받기"를 secondary로 재배치. programs의 "신청하기"(전환 액션)를 primary로.

---

### 2. 언레이어드 CSS 근본 원인 수정

**커밋:** `678cf07`

STEP 1에서 트래킹만 해두었던 두 가지 버그(`.roadmap-table-row`의 모바일 데스크톱 헤더 노출, `.glass` border 문제)의 공통 원인을 이번에 규명하고 정식 수정했다.

**원인:** CSS Cascade Layers 스펙상, `globals.css`에 평범하게 선언된(레이어 미지정) CSS 규칙은 **명시도·소스 순서와 무관하게** `@layer utilities`에 속한 Tailwind 유틸리티 클래스를 항상 이긴다. `.glass`와 `.roadmap-table-row`가 이 레이어 미지정 상태였기 때문에, `hidden`이나 `border-t-0` 같은 Tailwind 클래스를 아무리 붙여도 소용없었고, 지금까지는 매 충돌 지점마다 Tailwind의 trailing-`!`(important modifier)로 임시 봉합해 왔다.

**해결:** `globals.css`에서 두 클래스를 `@layer components { ... }`로 감싸 Tailwind가 선언한 레이어 순서(`theme, base, components, utilities`)에서 `utilities`보다 아래에 위치시켰다. 이제 Tailwind 클래스가 `!` 없이도 자연스럽게 이긴다.

```css
@layer components {
  .glass {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur)) saturate(180%);
    border: 1px solid var(--glass-border);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 10px 26px -14px rgba(22,21,28,0.22);
  }
}
```

**부수 발견:** 이 버그 때문에 Phase 2에서 추가한 배경 틴트 오버라이드(`AIRecommendationCard`의 `className="bg-[color-mix(...)]"` 등)도 `.glass`한테 조용히 묻혀 실제로는 적용되지 않고 있었다. `getComputedStyle().backgroundColor`로 수정 전/후 비교해 실제 틴트 색이 반영됨을 확인.

전 화면에 걸쳐 있던 `rounded-none!`, `border-t-0!`, `border-2!` 등 redundant bang 수정자도 이번 수정 이후 순차적으로 제거했다(랜딩, roadmap, 이후 business-plan).

---

### 3. 모바일 UX 전면 재설계 — BottomNav/FAB/Drawer/Accordion

**커밋:** `678cf07`, `08dc5f5`

데스크톱은 그대로 두고 모바일만 별도 UX로 재설계했다. 특히 로드맵 3분할 작업 화면이 모바일에서 완전히 깨지고 있어 최우선으로 손봤다.

- **전역**: `html, body { overflow-x: hidden; }` 세이프넷 추가.
- **BottomNav**(`app/components/ui/BottomNav.tsx`, 신규): 대시보드/지원사업/사업계획서 3탭 고정 하단바, `md:hidden`.
- **Drawer 채택**: 로그인 전엔 사용된 적 없던 기존 `Drawer` 컴포넌트를 처음 실사용하면서 스택킹 컨텍스트 버그를 발견했다 —

  **버그:** `position: sticky` + `z-index` + `backdrop-filter`(= `.glass`)를 가진 상위 `<nav>`가 새로운 스태킹 컨텍스트를 만들면서, 그 안에 렌더링된 Drawer의 `z-50` 오버레이가 nav의 형제 요소(`.roadmap-sticky-cta` z-20, `BottomNav` z-30)보다 항상 뒤에 깔렸다. 자식의 z-index는 조상의 스태킹 컨텍스트 안에서만 유효하기 때문.

  **수정:** `Drawer.tsx`에서 `createPortal(..., document.body)`로 오버레이를 항상 문서 루트로 탈출시킴 — 이후 추가되는 모든 Drawer 사용처에 영구적으로 적용되는 근본 수정.

- **로드맵 페이지**: 헤더를 로고 + 단계 배지 + 단일 "더보기" Drawer 트리거(테마+로그아웃)로 단순화. 모바일 전용 하단 고정 CTA(`bottom: 53px`)를 BottomNav(`bottom: 0`) 바로 위에 쌓아 두 고정 바가 겹치지 않게 조정.
- **ChatPopup FAB 충돌**: 새로 생긴 고정 하단 바들과 채팅 FAB이 겹치는 문제 발견 → 경로 기반으로 FAB `bottom` 오프셋을 조건부 상향(`useCurrentStep`). 이후 dashboard/business-plan/programs 3개 화면에도 BottomNav를 확장 적용하면서, 이 로직을 `useBottomBarClearance()` 훅으로 일반화(`"roadmap"` → 140px, `"bottomnav"` → 80px, 그 외 → 기본 24px).
- **dashboard**: 배지+아이콘 3개+테마 스위처가 320px에서 겹쳐 넘치던 것을 헤더 단순화(로고+배지+Drawer)로 해소. `sm:` 브레이크포인트를 BottomNav와 동일한 `md:`로 통일해 640~768px 구간에서 데스크톱 텍스트 내비와 BottomNav가 동시에 뜨는 것 방지.
- **business-plan/programs**: 동일한 BottomNav/Drawer 패턴 적용. business-plan은 `.glass` 수정 이후 불필요해진 `rounded-none!/border-*-0!/border-2!/border-primary!` bang도 함께 제거.

검증은 매 화면마다 타입체크·320px 콘솔 에러+스크린샷·실제 클릭·데스크톱 레이아웃 동일성·프로덕션 빌드까지 동일한 수준으로 진행했다.

---

### 4. SOLAR API 브랜딩 노출

**커밋:** `c7fdfb4`

Solar API 기반임을 브랜드로 드러내되, 방금 좁혀 놓은 320px 헤더 세이프마진을 다시 깨지 않는 게 관건이었다.

- 신규 `PoweredBySolar` 컴포넌트: border-only pill(`⚡` + 라벨), STEP1 토큰만 사용해 semantic 배지(진행률·마감 등)와 시각적으로 경쟁하지 않게 절제.
- **로그인**: 로그인 버튼 아래 중앙 정렬 "⚡ Continue with SOLAR" 배지(장식용 — 실제 SOLAR OAuth가 없는 상태에서 클릭 가능한 버튼처럼 보이게 만드는 것은 기만적이라 판단해 비대화형 배지로 처리).
- **ChatPopup**: 그라데이션 헤더 바로 아래 얇은 띠로 "⚡ Powered by SOLAR" — 전역 컴포넌트라 모든 화면에 자동 적용.
- **랜딩**: 기존 footer의 저작권 문구 옆에 배치(이미 `flex-wrap`이라 모바일에서도 안전).
- **dashboard/business-plan/programs/roadmap**: 데스크톱은 헤더의 ThemeSwitcher 앞에 `hidden md:inline-flex`로 추가, 모바일은 헤더를 건드리지 않고 기존 Drawer 맨 아래(로그아웃 버튼 아래, 구분선 추가)에 배치 — 방금 확보한 320px 세이프마진을 그대로 유지.

---

### 5. 대시보드 "오늘 할 일" 중심 재구성

**커밋:** `b3118e7`

기존 대시보드는 로드맵 진행률/사업계획서/지원사업을 나열식으로만 보여줬다. "지금 뭘 해야 하는지"를 최상단 히어로 카드(`TodayMissionCard`) 하나로 집약하는 구조로 재구성 — 로그인 전(게스트)/로드맵 진행 중/7단계 완료했지만 계획서 미작성/마감 임박 지원사업 존재/전부 완료의 5가지 상태를 우선순위 순으로 판별해 미션 하나만 노출한다.

---

### 6. 데스크톱 정보 허브 섹션 추가

**커밋:** `5d35037`

Startup News/정부지원사업 소식/추천 자료 3열 섹션을 데스크톱 대시보드에 신규 추가(당시엔 전부 목업 데이터 — 실데이터 연동은 다음날 `7a33ab7`). 320px 세이프마진을 지키기 위해 모바일에서는 이 섹션 자체를 렌더링하지 않기로 결정.

---

### 7. 모바일 알림 UI + 무음 실패 토스트 + 코치 요다 노출 경로 통일

**커밋:** `58c626b`

모바일 Drawer 상단에 알림 목록(`NotificationList`)을 추가하고, 그동안 실패해도 조용히 넘어가던 API 호출 몇 곳에 에러 토스트를 노출하도록 정리. 로드맵 페이지마다 제각각이던 "AI 인사이트"/코치 요다 진입 경로를 하나로 통일했다.

---

## 2026-07-28

### 디자인 시스템 전면 도입 — 토큰 체계 확립 · 5색 팔레트 · 반응형 재설계

**배경:** 9개 페이지가 인라인 `style={{}}`·커스텀 헥스값·Tailwind 기본 팔레트 3가지 방식으로 뒤섞여 있었고 "브랜드 블루"만 3가지 다른 값이 혼재했다. 지원사업 데모를 앞두고 Linear/Cursor/Vercel 수준의 절제된 UI로 리디자인하기로 하고, 10-Phase 계획(디자인 토큰 → 글로벌 테마 → 타이포 → 컴포넌트 → 레이아웃 → 반응형 → 대시보드 → 모바일 UX → 브랜딩 → 최종 폴리시)을 세워 Phase 완료마다 확인받으며 진행했다.

---

### 1. Phase 1 — 디자인 토큰 정의, 그리고 방향 전환

**커밋:** `cdd7a4a`, `e3a2794`

당초 스펙은 다크 네이비(`#0F172A`) 기반 SaaS 대시보드 톤이었다. 토큰을 정의하고 실제 화면에 적용해서 보여준 결과 "AI가 만든 화면 냄새가 난다"는 반응 — 애플 지갑(Apple Wallet) 스크린샷을 레퍼런스로 받아 "글래스모피즘 + 플루언트 디자인 + 애플 HIG" 방향으로 전면 전환했다. 라이트 배경(`#F2F1F7`) 기본, 카드는 `backdrop-filter` 블러+반투명(글래스) 재질, 보라(`#6C5CE7`)·앰버(`#F5A623`) 그라데이션은 히어로 요소 한 곳에만 절제해서 사용하는 것으로 최종 승인받았다. 다크 배경을 기본값으로 강제하지 않고, 라이트를 기본으로 다크는 토글로 지원하는 방향으로 정리.

---

### 2. Phase 2 — 글래스/네이티브 디자인 전체 확장

**커밋:** `3e8cac2`, `f18b599`

Phase 1 토큰을 대시보드에 먼저 적용해 검증한 뒤, 랜딩·로그인·로드맵·사업계획서·지원사업 전 페이지로 확장. 글래스 카드가 실제로 반투명하게 보이려면 배경에 은은한 컬러 블롭(보라·앰버, blur 처리)이 필요하다는 것을 이때 확인 — 텍스트가 많은 사업계획서 페이지에서는 블롭 강도를 낮춰 가독성을 우선했다.

---

### 3. 대시보드 Task-driven UI 재설계 + 반응형

**커밋:** `b4e31b4`

이 시점까지 유일한 반응형 처리는 `/programs` 페이지의 `md:grid-cols-2` 하나뿐이었다. 대시보드를 "지금 할 일이 무엇인지"가 최상단에 오는 태스크 중심 레이아웃으로 재설계하면서, 실질적인 첫 반응형 그리드 구조를 도입했다.

---

### 4. 로드맵/랜딩 모바일 레이아웃 전면 수정

**커밋:** `d4c8ce3`, `35a8338`

로드맵 스텝 페이지와 랜딩(첫 화면) 모바일에서 동일한 원인(고정 폭 요소·플렉스 오버플로)으로 레이아웃이 깨지고 있던 것을 각각 수정.

---

### 5. 디자인 시스템 정식화 + 공용 프리미티브 도입 + 지원사업/사업계획서 재설계

**커밋:** `ff4c794`

Button/Card/Badge/Input/Textarea/Accordion/Drawer/Toast 공용 프리미티브를 이때 처음 도입하고, 지원사업/사업계획서 페이지를 task-driven 톤으로 재설계했다(다음날 `6cecc2d`에서 전 화면으로 확장 적용).

---

### 6. 5가지 컬러 팔레트 + 라이트/다크 모드 전환

**커밋:** `73b28d8`

violet(기본)/ocean/forest/sunset/slate 5개 팔레트 각각의 라이트/다크 페어를 `[data-palette]`/`[data-theme]` 속성 기반으로 정의하고, 전환 UI(`ThemeSwitcher`)를 추가했다.

---

### 7. 로고/파비콘을 실제 브랜드 아이콘으로 교체

**커밋:** `08ced88`, `66d58c8`

---

### 8. 인라인 스타일 → Tailwind 유틸리티 클래스 통일 (자정 전후로 이어짐)

**커밋:** `449b909`, `744e151`, `6b67c8c`, `45e6f88`

ChatPopup → 랜딩(`page.tsx`) → business-plan → RoadmapPageClient 순서로, 페이지 대부분을 차지하던 인라인 `style={{}}`를 Tailwind 유틸리티 클래스로 옮겼다. 다음날(`6cecc2d`) 공용 프리미티브를 전 화면에 적용하기 위한 사전 정리 작업.

---

## 2026-07-14

### AI 활용 깊이 강화 — 완성도 채점 · 근거 기반 피드백 · 이전/이후 비교

**커밋:** `ac7c1da` — feat: AI 활용 깊이 강화  
**변경 파일:** `backend/app/api/ai.py` · `frontend/app/lib/api.ts` · `frontend/app/roadmap/[step]/RoadmapPageClient.tsx`

---

### 문제 1 — 피드백이 "느낌" 수준이어서 설득력이 없었다

**기존 방식의 한계:**  
`/ai/feedback` 엔드포인트는 Solar에게 단순히 "잘된 점과 보완점을 2~3문장으로"만 요청했다. 피드백이 나오긴 했지만 "Target과 Problem의 연결이 명확하네요" 같은 선언에 그쳐 — '왜 그 기준으로 보는지', '어떤 원칙에서 비롯된 피드백인지'가 없었다. 심사위원 앞에서 코치가 근거 없이 말하는 것과 같다.

**해결 방식 — METHODOLOGY_REFS 라이브러리 내장:**

```python
METHODOLOGY_REFS = {
    1: {
        "name": "린 스타트업 — 검증된 학습 원칙",
        "principles": """
[참조 방법론: 린 스타트업 (Eric Ries)]
- "의견이 아닌 검증 가능한 가설로 시작하라"
- "가족·친구의 호의적 반응은 증거가 아님, 낯선 사람의 행동 변화가 증거임"
- Problem 진술은 '고객이 현재 어떻게 해결하고 있는가'를 포함해야 함 (Jobs-to-be-Done)
""",
    },
    2: { "name": "블루오션 전략 — 가치 혁신 원칙", ... },
    ...
}
```

각 단계에 해당 방법론 원칙 전문을 프롬프트에 주입하고, 피드백 마지막 문장에 `[근거: 린 스타트업 — 검증된 학습 원칙]` 형태로 출처를 명시하도록 시스템 프롬프트에 강제했다:

```python
# STEP_FEEDBACK_PROMPTS[1] 중
"마지막 문장은 반드시 '[근거: {methodology_name}]' 형태로 어떤 원칙에 근거한 피드백인지 명시하세요."
```

응답에도 `methodology_ref` 필드를 추가해 프론트가 별도 파싱 없이 출처를 바로 받도록 했다:

```python
return {
    "feedback": raw,
    "methodology_ref": ref["name"],   # 신규
}
```

**프론트엔드:** 피드백 텍스트에서 `[근거: ...]` 패턴을 strip하고 별도 배지로 렌더링. 프론트가 텍스트 파싱에 의존하지 않고 `methodology_ref` 필드를 신뢰하도록 분리했다.

```tsx
{feedback.replace(/\[근거:.*?\]/g, "").trim()}
{methodologyRef && (
  <div style={{ background: "#2F3E72", color: "#A8B8D8", ... }}>
    근거: {methodologyRef}
  </div>
)}
```

**7단계 방법론 매핑:**
| 단계 | 방법론 |
|------|--------|
| STEP 1 | 린 스타트업 (Eric Ries) — 검증된 학습, JTBD |
| STEP 2 | 블루오션 전략 (김위찬) + Zero to One (피터 틸) |
| STEP 3 | Crossing the Chasm (제프리 무어) + 포터의 경쟁 우위론 |
| STEP 4 | 단위 경제학 — LTV/CAC 황금률 + Zero to One |
| STEP 5 | 린 스타트업 런웨이 최적화 + 한국 정부지원사업 생태계 |
| STEP 6 | Team Canvas + High Output Management (엔드류 그로브) |
| STEP 7 | Guy Kawasaki 10/20/30 Rule + Simon Sinek WHY 원칙 |

---

### 문제 2 — 대시보드 "완성도 %" 수치의 근거가 없었다

**기존 방식의 한계:**  
대시보드에서 보여주는 완성도 비율은 단순히 "완료된 STEP 수 / 7"이었다. 한 단계를 완료했다고 해서 그 내용이 충실한지는 별개 문제인데, 숫자가 표시되면 사용자는 그것을 품질 지표로 오해한다.

**해결 방식 — `/ai/score` 신규 엔드포인트:**

단계별 작성 내용을 Solar에게 해당 방법론 기준으로 채점하도록 요청. 점수·등급·잘된 점·보완 항목·개선 힌트를 JSON으로 반환받는다:

```python
@router.post("/score")
def score_step(body: ScoreRequest):
    # STEP_SCORE_PROMPTS[step]에 작성 내용을 삽입
    # Solar에게 JSON 형식으로만 응답 요청
    # 응답 파싱 후 반환
    return {
        "score": int(result.get("score", 0)),      # 0~100
        "grade": result.get("grade", "D"),          # A/B/C/D
        "strengths": result.get("strengths", []),
        "missing_items": result.get("missing_items", []),
        "improvement_hint": result.get("improvement_hint", ""),
        "methodology_ref": METHODOLOGY_REFS.get(step, {}).get("name", ""),
    }
```

채점 프롬프트는 방법론 기준을 명시하고 temperature를 0.3으로 낮춰 편차를 줄였다 (`/ai/feedback`은 0.7 — 표현은 유연하게):

```python
# STEP_SCORE_PROMPTS[1] 예시
"""...린 스타트업 원칙으로 채점하세요.
아래 JSON 형식으로만 응답하세요:
{
  "score": 0~100 사이 정수 (구체성·검증가능성·연결성 기준),
  "grade": "A/B/C/D 중 하나 (90+: A, 70~89: B, 50~69: C, 50미만: D)",
  ...
}"""
```

**응답 파싱 로직:** Solar가 간혹 코드블록(```` ``` ````)을 붙이거나 JSON 앞뒤에 텍스트를 삽입하는 케이스가 있다. 기존 `/ai/generate`에서 검증된 파싱 패턴을 동일하게 적용했다:

```python
raw = response.choices[0].message.content.strip()
if "```" in raw:
    raw = re.sub(r"```(?:json)?", "", raw).replace("```", "").strip()
start = raw.find("{")
end = raw.rfind("}") + 1
if start != -1 and end > start:
    raw = raw[start:end]
result = json.loads(raw)
```

**프론트엔드 UI — 완성도 카드:**
- 점수 숫자 + 등급 배지 (A: 초록, B: 보라, C: 주황, D: 빨강)
- 애니메이션 게이지 바 (CSS `transition: width 0.8s ease`)
- 잘된 점 / 보완 필요 두 컬럼 그리드
- 가장 시급한 개선 힌트 강조 배너

---

### 문제 3 — 재생성 후 "무엇이 나아졌는지" 알 수 없었다

**기존 방식의 한계:**  
"다시 생성하기" 버튼을 누르면 새 초안이 나오지만, 이전 것과 무엇이 달라졌는지는 사용자가 스스로 읽고 비교해야 했다. Build-Measure-Learn 사이클에서 Learn 단계가 없는 것과 같다.

**해결 방식 — `/ai/compare` 신규 엔드포인트:**

재생성 전 콘텐츠를 `before`, 새 콘텐츠를 `after`로 받아 Build-Measure-Learn 관점에서 비교 분석을 반환:

```python
@router.post("/compare")
def compare_versions(body: CompareRequest):
    # body.before, body.after를 프롬프트에 삽입
    # 나아진 점·잔여 과제·전체 진전·progress_delta 반환
    return {
        "improvements": [...],        # 나아진 점 1~3가지
        "remaining_issues": [...],    # 아직 보완 필요 1~2가지
        "overall_progress": "...",    # 한 문장 총평
        "progress_delta": 15,         # 이번 수정으로 향상된 포인트 추정
    }
```

**호출 시점:** `handleGenerate()` 내에서 이전 content가 있을 때만 비교를 요청. 첫 생성 시에는 compare 호출을 건너뛴다 (비교 대상이 없으므로):

```tsx
const previousContent = content;  // 재생성 전 snapshot
// ...AI 생성 완료 후...
if (previousContent && Object.keys(previousContent).length > 0) {
  setPrevContent(previousContent);
  api.ai.compare(step, previousContent, res.draft)
    .then(setCompareResult)
    .catch(() => {});  // 비교 실패해도 재생성 자체는 영향 없음
}
```

비교는 fire-and-forget으로 백그라운드에서 처리 — 재생성의 메인 흐름(초안 표시)을 막지 않는다.

**프론트엔드 UI — 비교 분석 카드:**
- 초록 배경 카드로 피드백 카드 위에 표시
- "+N점 향상" 배지 (`progress_delta > 0`일 때만)
- 나아진 점(▸) / 아직 보완 필요(△) 구분 표시
- 전체 진전 총평을 이탤릭 인용 형식으로

---

### 전체 데이터 흐름

```
초안 생성(handleGenerate)
  │
  ├─ /ai/generate  → 새 초안 콘텐츠
  ├─ /ai/feedback  → 피드백 + methodology_ref     (병렬)
  ├─ /ai/score     → 점수·등급·잘된점·보완항목    (병렬)
  └─ /ai/compare   → 이전/이후 비교 (이전 콘텐츠 있을 때만)

페이지 첫 로딩(저장된 콘텐츠 있을 때)
  ├─ /ai/feedback  → 기존 콘텐츠 기반 피드백
  └─ /ai/score     → 기존 콘텐츠 기반 점수

피드백 다시 받기 버튼
  ├─ /ai/feedback  → 재요청
  └─ /ai/score     → 재채점 (동시 호출)
```

---

### 현재 구현 완료 기능 (누적)

**AI 엔드포인트**
- [x] `POST /ai/generate` — 7단계 전용 Solar 초안 생성
- [x] `POST /ai/chat` — 단계별 코칭 챗봇 (Solar)
- [x] `POST /ai/feedback` — 방법론 근거 기반 피드백 (방법론 출처 포함)
- [x] `POST /ai/score` — 0~100점 완성도 채점 + A/B/C/D 등급
- [x] `POST /ai/compare` — 재생성 전후 비교 분석

**로드맵 스텝 페이지**
- [x] 완성도 채점 카드 (게이지 바 + 잘된 점/보완 항목 그리드)
- [x] 방법론 출처 배지 (피드백 하단)
- [x] 재생성 비교 분석 카드 (+N점 향상 표시)
- [x] 피드백 다시 받기 → 점수도 함께 갱신

---

## 2026-06-21

### 백엔드 클라우드 배포 · 사업계획서 고도화 · 지원사업 매칭 · 발표 시연 스크립트

---

### 1. 백엔드 Render 배포 (CORS 문제 해결)

**배경:** GitHub Pages(정적)에서 `localhost:8000` 호출 → CORS 차단으로 사업계획서 페이지 동작 불가

**시도 1 — Railway:**
- `railway up` → 환경변수 미설정으로 크래시 반복
- PostgreSQL 추가 (`railway add` CLI 버그로 웹 대시보드 직접 추가)
- 환경변수 설정 후 배포 성공했으나 비용 발생 → Render로 전환 결정

**Render 최종 배포:**
- `render.yaml` 작성 — Web Service(Docker) + PostgreSQL Free 플랜 정의
- Blueprint 연동으로 GitHub push 시 자동 재배포
- 공개 URL: `https://stepup-backend-rnlj.onrender.com`
- GitHub Secret `NEXT_PUBLIC_API_URL` 등록 → 프론트 재빌드

| 항목 | 이전 | 이후 |
|------|------|------|
| 백엔드 위치 | localhost:8000 (로컬 Docker) | Render (클라우드) |
| DB | Docker PostgreSQL | Render PostgreSQL Free |
| 배포 방식 | 수동 docker compose | GitHub push → 자동 재배포 |
| CORS | localhost만 허용 | `https://chikery.github.io` 추가 |

**변경 파일:** `render.yaml` (신규), `backend/app/main.py` (CORS origins 유지)

---

### 2. `import json` 누락 버그 수정 (business-plan 500 에러)

**증상:** `/ai/business-plan` 호출 시 500 Internal Server Error → CORS 헤더도 누락되어 CORS 오류처럼 보임

**원인:** `ai.py` 최상단에 `import json` 없음 → `generate_business_plan()` 내 `json.dumps()` 호출 시 `NameError`

```python
# 수정 전
import re
from fastapi import APIRouter, HTTPException
...

# 수정 후
import re
import json
from fastapi import APIRouter, HTTPException
...
```

**교훈:** FastAPI의 500 에러는 CORS 헤더를 포함하지 않아 브라우저에서 CORS 오류로 오인됨 — 실제 원인은 서버 내부 오류

---

### 3. `/roadmap/business-plan` 라우트 충돌 수정

**원인:** `GET /roadmap/{step}` 라우트가 `/roadmap/business-plan` 요청을 가로챔 → `step="business-plan"` → int 파싱 실패 → 422

**수정 (`backend/app/api/roadmap.py`):** 고정 경로(`/business-plan`, `/business-plan/save`)를 파라미터 경로(`/{step}`) 보다 먼저 선언

**추가 수정:** `body: dict` → `body: BusinessPlanSaveBody(BaseModel)` 로 타입 명시 (FastAPI 422 방지)

---

### 4. 사업계획서 저장·불러오기 기능

**배경:** 사업계획서 페이지 진입 시마다 Solar AI 재생성 → 30초 대기 + 비용 낭비

**구현:**

**백엔드:**
- `BusinessPlan` 모델 신규 (`backend/app/models/business_plan.py`)
  - `user_id` (FK, unique) · `content` (Text) · `updated_at`
- `GET /roadmap/business-plan?token=` — 저장된 계획 조회
- `POST /roadmap/business-plan/save?token=` — 저장/업데이트

**프론트엔드 (`business-plan/page.tsx`):**
- 페이지 진입 시 저장된 계획 먼저 조회 → 있으면 바로 표시 (AI 재생성 생략)
- 새로 생성한 경우 즉시 자동 저장
- 대시보드 사이드바에 **내 사업계획서 보기** 링크 추가 (저장 여부에 따라 초록/회색)

---

### 5. 사업계획서 저장 버튼 및 편집 모드

**저장 버튼:** 툴바에 저장 아이콘 버튼 추가 — 클릭 시 `POST /roadmap/business-plan/save` 호출 → "저장됨!" 피드백

**편집 모드:**
- **편집** 버튼 클릭 → 읽기 전용 렌더링 → textarea 전환 (파란색 테두리)
- **저장 완료** — `editText` 상태를 `businessPlan`에 반영 + 서버 저장
- **취소** — 원본 내용 그대로 읽기 모드 복귀

```
읽기 모드: [편집] [저장] [전체 복사]
편집 모드: [취소] [저장 완료]
```

---

### 6. 코치 요다 피드백 다시 받기

**배경:** 사용자가 내용 수정 후 새 피드백을 받을 방법이 없었음

**스텝 페이지 (`RoadmapPageClient.tsx`):**
- 피드백 하단에 구분선 + 안내 문구: *"내용을 수정했다면 피드백을 다시 받아보세요."*
- **피드백 다시 받기** 버튼 → `fetchFeedback(step, content)` 재호출

**사업계획서 페이지 (`business-plan/page.tsx`):**
- 코치 요다 패널 하단에 안내 문구: *"사업계획서를 편집한 후 새 피드백을 받고 싶다면 아래 버튼을 눌러주세요."*
- **피드백 다시 받기** 버튼 (전체 너비) → `handleRefreshFeedback()` 재호출

---

### 7. 지원사업 매칭 기능

**배경:** `support-program-roadmap-matching.md` 데이터 기반으로 단계별 지원사업 자동 연결

**데이터 파일 (`frontend/app/lib/support-programs.ts`):**
- 19개 지원사업 (예술경영지원센터 · 문화체육관광부 · K-Startup 기준, 2026-06-18 조회)
- 각 항목: `name`, `url`, `deadline`, `steps[]`, `description`, `maxSupport`
- 유틸 함수: `getProgramsForStep()`, `isExpired()`, `daysLeft()`

**스텝 페이지 사이드바 (`RoadmapPageClient.tsx`):**
- "AI 인사이트 받기" 버튼 아래에 해당 단계 매칭 지원사업 최대 4개 표시
- 마감된 항목: 흐리게 + "마감" 표시
- D-7 이내 임박 항목: 빨간색 날짜 표시
- 카드 클릭 시 원문 공고 페이지로 이동

**대시보드 (`dashboard/page.tsx`):**
- 전체 19개 지원사업 그리드 카드로 표시
- 사용자의 현재 단계(completedCount + 1)와 매칭되는 카드: 노란 배경 + "현재 단계" 뱃지 + 그림자
- 기존 더미 "추천 지원사업" 카드 제거

---

### 8. 발표 시연 스크립트 작성

**파일:** `DEMO_SCRIPT.md` (신규)

- 시연 소요 시간: 8~12분
- 시연 캐릭터: 공연예술인-공연장 매칭 플랫폼 예비창업자
- 6개 단계별 시연 흐름 + 멘트 + 강조 포인트
- 핵심 차별점 표, 예상 Q&A 포함
- 사전 준비사항 체크리스트 (미리 저장할 단계 안내)

---

### 9. 기술 스택 업데이트

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 15 (App Router, Static Export) · TypeScript |
| Backend | FastAPI · Python (Docker) |
| Database | PostgreSQL · SQLAlchemy |
| AI | Solar API (`solar-pro`) — 초안·챗봇·피드백·사업계획서 |
| Auth | JWT, localStorage |
| Deploy | GitHub Pages (frontend) · **Render Free** (backend) |

---

### 10. 현재 구현 완료 기능

**Frontend**
- [x] 로그인 후 대시보드 자동 이동
- [x] 대시보드 — 전체 지원사업 매칭 (현재 단계 강조)
- [x] 사이드바 — 단계별 매칭 지원사업 (마감일·D-day 표시)
- [x] 로드맵 스텝 — 피드백 다시 받기 버튼
- [x] 사업계획서 페이지 — 저장·불러오기·편집·피드백 재요청
- [x] 대시보드 사이드바 — 내 사업계획서 보기 링크

**Backend**
- [x] `GET/POST /roadmap/business-plan` — 사업계획서 저장·조회
- [x] `BusinessPlan` DB 모델 (user당 1개, upsert)
- [x] `/roadmap/business-plan` 라우트 우선순위 수정
- [x] `import json` 누락 버그 수정

**Infra**
- [x] Render 클라우드 배포 (`render.yaml`)
- [x] GitHub Secret `NEXT_PUBLIC_API_URL` 등록
- [x] GitHub push → Render 자동 재배포

---

## 2026-06-19

### AI 기능 고도화 · GitHub Pages 안정화

---

### 1. Solar API 기반 AI 초안 생성 전환

**배경:** OpenAI 크레딧 소진(429 오류)으로 `/ai/generate` 엔드포인트를 Solar API로 교체

| 항목 | 이전 | 이후 |
|------|------|------|
| AI 초안 생성 | OpenAI GPT-4o-mini | Solar `solar-pro` |
| 챗봇 | Solar `solar-pro` (이미 전환) | 유지 |
| API Base URL | `api.openai.com` | `api.upstage.ai/v1` |

**변경 파일:** `backend/app/api/ai.py`
- `solar_client = OpenAI(api_key=settings.solar_api_key, base_url="https://api.upstage.ai/v1")`
- `/ai/generate` 엔드포인트: `client` → `solar_client`, 모델 `solar-pro`
- 응답 JSON 파싱 강화: 코드블록 제거 → `{...}` 추출 → 파싱 실패 시 문자 단위 이스케이프 파서 실행

---

### 2. PRD 기반 단계별 AI 코칭 프롬프트 연동

**변경 파일:** `backend/app/api/ai.py`, `frontend/app/components/ChatPopup.tsx`

**백엔드 — 7개 단계별 프롬프트 딕셔너리 3종 추가:**

| 딕셔너리 | 용도 |
|---------|------|
| `STEP_PROMPTS` | `/ai/generate` — 단계별 JSON 초안 생성 |
| `STEP_CHAT_PROMPTS` | `/ai/chat` — 단계별 챗봇 시스템 프롬프트 (PRD 코칭 철학) |
| `STEP_FEEDBACK_PROMPTS` | `/ai/feedback` — 단계별 코치 피드백 프롬프트 |

**각 단계별 프레임워크:**
- STEP 1: TPCS (Target / Problem / Cause / Solution)
- STEP 2: 비전 캔버스 (핵심가치 / 독창성 / 미학방향 / 시장적의미)
- STEP 3: 시장분석 (TAM / SAM / SOM / 경쟁우위)
- STEP 4: 수익모델 (수익원 / 가격전략 / 비용구조 / 단위경제)
- STEP 5: 자금계획 (소요자금 / 조달전략 / 마일스톤 / 추천지원사업)
- STEP 6: 팀설계 (핵심역할 / 현재팀 / 보완영역 / 협업방식)
- STEP 7: 런칭준비 (피치덱 / 예상Q&A / GTM / KPI)

**프론트엔드 — ChatPopup 단계 인식:**
- `usePathname()` → `/roadmap/(\d+)` 에서 현재 step 추출
- 단계별 첫 메시지 자동 변경 (`STEP_GREETINGS` 딕셔너리)
- step 변경 시 대화 내역 초기화
- POST body에 `step` 값 포함

---

### 3. `/ai/feedback` 엔드포인트 신규 추가

**목적:** "코치 요다의 피드백" 섹션을 Solar AI로 동적 생성

```python
class FeedbackRequest(BaseModel):
    step: int
    content: dict

POST /ai/feedback → {"feedback": str}
```

**프론트엔드 연동 (`RoadmapPageClient.tsx`):**
- AI 초안 생성 성공 후 자동으로 `fetchFeedback()` 호출
- 기존 저장된 콘텐츠 로드 시에도 자동 피드백 조회
- 피드백 로딩 중 점 애니메이션 표시
- 단계별 맞춤 피드백 (2~3문장, 잘된 점 + 보완점)

---

### 4. AI 초안 버튼 UX 개선

**문제:** 초안 생성 후 버튼이 비활성화되어 재생성 불가

**수정 (`RoadmapPageClient.tsx`):**
- `draftGenerated` 상태 분리 — `hasAnyField`(수동 입력 감지)와 구분
- "AI 초안이 생성되었습니다" 배너에 "다시 생성하기" 버튼 추가
- 버튼은 항상 활성화 상태 유지

**문제:** 텍스트박스에 직접 타이핑해도 배너가 "생성 완료" 상태로 전환되던 버그

**수정:** `draftGenerated`는 오직 AI 생성 완료 또는 API 데이터 로드 시에만 `true` 설정

---

### 5. GitHub Pages 배포 안정화

#### 5-1. 라우팅 404 수정 (pages 3~7)
**원인:** Next.js가 `/roadmap/N.html`로 파일 생성 → URL에 `.html` 없으면 404

**수정 (`next.config.ts`):** `trailingSlash: true` 추가 → `/roadmap/N/index.html` 로 생성

#### 5-2. 브라우저 캐시 "This page couldn't load" 오류
**원인:** `trailingSlash` 변경 후 브라우저가 구버전 HTML(구 JS 청크 해시 참조)을 캐시에서 서빙 → 새 청크 로드 실패

**해결 1 (`frontend/app/layout.tsx`):** `<script>` 자동 하드 리프레시

```js
window.addEventListener('error', function(e) {
  var t = e.target;
  if (t && (t.tagName === 'SCRIPT' || t.tagName === 'LINK')) {
    var key = '__chunk_err_' + location.pathname;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      location.reload(true);
    }
  }
}, true);
```

**해결 2 (`frontend/public/404.html`):** SPA 리다이렉트 — 캐시된 404 URL을 trailing slash 붙인 올바른 경로로 이동

#### 5-3. 로그인 → 7페이지 이동 버그
**원인:** 로그인 후 `/dashboard`로 이동 → 대시보드가 `completedCount + 1` 계산 → 7단계 모두 완료 시 7페이지로 이동

**수정 (`login/page.tsx`):** `router.push("/dashboard")` → `router.push("/roadmap/1")`

---

### 6. Solar JSON 파싱 오류 수정

**증상:** 7페이지 AI 초안 생성 시 `Expecting ',' delimiter: line 16 column 22` 오류

**원인:** Solar `solar-pro`가 긴 문자열 값(예: `qa` 필드의 Q&A 목록) 안에 리터럴 줄바꿈(`\n`)을 이스케이프 없이 삽입

**기존 방식(실패):** 정규식으로 문자열 범위 찾아 치환 → `qa` 같은 복잡한 콘텐츠에서 경계 오탐

**새 방식:** 문자 단위 상태머신 파서

```python
def escape_strings(s: str) -> str:
    in_string, escape_next = False, False
    for ch in s:
        if escape_next: ...           # 이미 이스케이프된 문자 통과
        if ch == '\\': ...            # 다음 문자 이스케이프 예고
        if ch == '"': in_string = ... # 문자열 내부 진입/탈출 토글
        if in_string and ch == '\n': result.append('\\n')  # 리터럴 줄바꿈 → \n
        if in_string and ch == '\t': result.append('\\t')
```

---

### 7. 기술 스택 업데이트

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 15 (App Router, Static Export) · TypeScript · Tailwind CSS |
| Backend | FastAPI · Python (Docker Compose) |
| Database | PostgreSQL · SQLAlchemy |
| AI | Solar API (`solar-pro`) — 초안 생성 · 챗봇 · 피드백 |
| Auth | JWT, localStorage |
| Deploy | GitHub Pages (frontend) · Docker (backend) |

---

### 8. 현재 구현 완료 기능

**Frontend**
- [x] 랜딩 페이지 (`/`)
- [x] 로그인 · 회원가입 (로그인 후 `/roadmap/1`로 이동)
- [x] 대시보드 (`/dashboard`) — 7단계 진행률
- [x] 로드맵 스텝 페이지 (`/roadmap/[1~7]`) — 목업 기반 UI
- [x] AI 초안 생성 · 재생성 버튼 (항상 활성)
- [x] 초안 내용 텍스트박스 자동 표시
- [x] 코치 요다의 피드백 (Solar AI 동적 생성)
- [x] 단계별 AI 챗봇 팝업 (step 컨텍스트 인식)
- [x] GitHub Pages 정적 배포 (trailingSlash, SPA 리다이렉트)
- [x] 브라우저 캐시 오류 자동 복구

**Backend**
- [x] JWT 인증 (register / login / profile)
- [x] 로드맵 진행 저장·조회
- [x] `/ai/generate` — Solar `solar-pro` JSON 초안 생성 (7단계 전용 프롬프트)
- [x] `/ai/chat` — Solar 단계별 코칭 챗봇
- [x] `/ai/feedback` — Solar 단계별 피드백 생성

---

## 2026-06-08

### 프로젝트 재개 · UI 전면 리디자인

---

### 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | AI Startup Roadmap Coach |
| 목적 | 예술인·초기 창업자가 아이디어에서 사업계획서까지 스스로 완성할 수 있게 돕는 AI 창업 가이드 플랫폼 |
| 레포지토리 | https://github.com/chikery/AI-Startup-Roadmap-Coach |

---

### 2. 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 15 (App Router) · TypeScript · Tailwind CSS |
| Backend | FastAPI · Python |
| Database | PostgreSQL · SQLAlchemy (Docker Compose) |
| AI | OpenAI GPT-4o-mini / Solar API |
| Auth | JWT (python-jose), localStorage |
| Infra | Docker Compose (로컬), GitHub Pages (프론트) |

---

### 3. 누적 개발 내역

#### [ee1d356] 프로젝트 초기 스캐폴딩
- Next.js + FastAPI 풀스택 프로젝트 초기 구조 세팅
- Docker Compose 구성 (PostgreSQL + FastAPI)
- 기본 라우터 구성: `/auth`, `/programs`, `/roadmap`, `/ai`
- LangChain + FAISS 기반 RAG 파이프라인 초안
- 샘플 지원사업 데이터 (`sample_programs.json`) 작성

#### [50706d1] 백엔드 기동 오류 및 회원가입 프로필 저장 수정
- FastAPI 기동 시 모델 미등록 오류 수정
- 회원가입 2단계 프로필 저장 로직 수정
- `/auth/profile` PATCH 엔드포인트 token 처리 수정

#### [bf7b923] 로드맵 스텝 페이지 UI 전면 리디자인
**배경:** 기존 JSON textarea 노출 방식이 사용자 비친화적 → 목업 기반 전면 재설계

| 항목 | 이전 | 이후 |
|------|------|------|
| 배경 컬러 | 흰색/회색 | 크림 베이지 `#F5F0E8` |
| 레이아웃 | 단일 컬럼 | 2컬럼 (스텝 정보 2 : 지원사업 3) |
| 진행 표시 | 텍스트 "STEP X / 7" | 7개 세그먼트 바 (포레스트 그린) |
| 체크리스트 | 없음 | 단계별 태스크 |
| 초안 편집 | Raw JSON textarea | 항목별 폼 (DraftFormEditor) |

**신규 파일:**
- `frontend/app/roadmap/[step]/DraftFormEditor.tsx` — Step1Form ~ Step7Form 7개 전용 폼

---

### 4. 실행 방법

```bash
# 환경변수 설정
cp backend/.env.example backend/.env
# backend/.env에 SOLAR_API_KEY 입력

# 백엔드 + DB 기동
docker compose up -d

# 프론트엔드 개발 서버
cd frontend && npm install && npm run dev
```

- 프론트엔드: http://localhost:3000
- 백엔드 API 문서: http://localhost:8000/docs
- GitHub Pages 배포: https://chikery.github.io/AI-Startup-Roadmap-Coach/

---

### 5. 다음 개발 예정

- [ ] 사업계획서 통합 다운로드 (STEP 7 완료 시 PDF 생성)
- [ ] 지원사업 데이터 실시간 크롤링 연동
- [ ] 사용자 프로필 수정 페이지
- [ ] 반응형 모바일 UI 최적화
