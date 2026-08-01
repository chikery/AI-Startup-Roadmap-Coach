# StepUp — AI Startup Roadmap Coach

> 아이디어에서 사업계획서까지 — 예술·콘텐츠 창업자를 위한 AI 로드맵 코치

**Live:** [chikery.github.io/AI-Startup-Roadmap-Coach](https://chikery.github.io/AI-Startup-Roadmap-Coach/) · **Backend:** Render (FastAPI)

---

## 기획 의도

예술·콘텐츠 분야 창업자에게 부족한 건 아이디어가 아니라 **그 아이디어를 사업으로 번역하는 프레임워크**다. "예쁘다", "의미있다"는 확신은 있어도 이걸 시장 언어(TAM/SAM/SOM, 유닛 이코노믹스, 피치덱)로 바꾸는 법을 모르는 경우가 대부분이다. StepUp은 이 번역 과정을 7단계 로드맵과 AI 코치 "요다"가 단계마다 함께 채워가는 방식으로 돕는다.

## 사용자 문제 정의

- **프레임워크 부재:** 문제 정의부터 피치덱까지 뭘 먼저 해야 하는지 순서 자체를 모른다.
- **막막한 첫 문장:** 빈 화면 앞에서 "TAM이 뭔가요" 수준부터 막힌다 — AI가 초안을 먼저 채워주고 다듬는 방식이 필요하다.
- **정보 파편화:** 지원사업 공고, 창업 뉴스, 참고 자료가 여기저기 흩어져 있어 놓치기 쉽다.
- **일반적인 조언의 한계:** 시중 창업 가이드는 IT/테크 스타트업 기준이라, 예술·콘텐츠 창업자의 맥락(작품성과 사업성 사이의 번역)을 짚어주지 못한다.

## 해결 방식

### 핵심 기능

| 기능 | 설명 |
|------|------|
| 🗺️ 7단계 창업 로드맵 | 문제 발견 → 시장 리서치 → MVP → 시장 분석 → 비즈니스 모델 → 팀 빌딩 → 피치덱 |
| ✨ AI 초안 자동 생성 | 각 단계에서 Solar API(Upstage)가 TPCS·가설·BMC 등 프레임워크별 초안을 즉시 생성 |
| 📊 완성도 채점 · 근거 기반 피드백 | 코치 "요다"가 등급(A~D)과 근거를 들어 피드백, 재생성 시 이전/이후 비교 제공 |
| 📄 사업계획서 자동 통합 | STEP 7 완료 시 전 단계 내용이 피치덱 문서로 자동 통합, 편집 가능 |
| 🎯 지원사업 프로필 매칭 | 회원 프로필(관심분야/지역)과 매칭되는 지원사업·정보를 우선 노출(프로필 없으면 단계 기준 폴백) |
| 📰 창업 정보 허브 | K-Startup·기업마당·KOCCA 공고를 자동 수집해 실데이터로 노출 |
| 💬 AI 코칭 챗봇 | 현재 보고 있는 단계 맥락을 아는 상시 챗봇 |

### 로드맵 STEP 구성

| STEP | 주제 | AI 생성 내용 |
|------|------|-------------|
| 1 | 문제 발견과 솔루션 | TPCS 프레임 + WHY 분석 |
| 2 | 고객과 시장 리서치 | 잠재고객 프로파일 + 리서치 플랫폼 추천 |
| 3 | 고객 인터뷰 설계 | 가설 9개 + 인터뷰 질문지 |
| 4 | MVP 테스트 설계 | 핵심 가설 + 추천 도구 |
| 5 | 시장 및 경쟁사 분석 | TAM·SAM·SOM + SWOT |
| 6 | 비즈니스 모델 | BMC 9블록 + 모순 피드백 |
| 7 | 피치덱 완성 | 섹션별 초안 + 예상 Q&A |

### 아키텍처

```
frontend/  Next.js (App Router, 정적 export) → GitHub Pages
backend/   FastAPI → Render (+ PostgreSQL)
           ├── Solar API(Upstage) 기반 AI 초안/피드백/채점
           ├── 지원사업 RAG 파이프라인 (LangChain + FAISS)
           └── 정보허브 수집기 (GitHub Actions 크론 → hub_items 테이블)
```

디자인은 5색 팔레트(violet 기본/ocean/forest/sunset/slate) × 라이트/다크 모드를 CSS 변수 토큰으로 관리하고, Button/Card/Badge/Input/Textarea/Select 등 공용 프리미티브로 전 화면을 통일했다.

## 사용자 피드백과 피벗

실제로 있었던 반려·전환의 기록. 처음 계획대로 쭉 간 게 아니라, 중간중간 되돌아간 지점들이다.

- **다크 SaaS → 글래스모피즘 전환.** 디자인 토큰을 다크 네이비(Linear/Vercel 톤) 기준으로 먼저 정의하고 실제 화면에 입혀 봤더니 "AI가 만든 화면 냄새가 난다"는 반응. 애플 지갑 스크린샷을 레퍼런스로 받아 글래스모피즘 + 애플 HIG 방향으로 전면 전환했다(`v0.5`).
- **Railway → Render.** 백엔드를 처음엔 Railway에 배포했으나 비용이 발생해 무료 플랜이 있는 Render로 재배포(`v0.3`).
- **하드코딩 색상 재발 방지 요청.** 이중 primary 버튼을 정리하며 새로 적용한 스타일이 `bg-white` 하드코딩이라는 지적을 받고, 이전에도 있었던 하드코딩 색상·CSS 레이어 회귀와 같은 종류의 문제가 반복되지 않도록 다크모드에서도 항상 밝은 값을 유지하는 전용 토큰(`--color-hero-chip`)을 만들어 중복 3곳을 통합했다(`v0.8`).
- **DraftFormEditor 폐기.** STEP1 단계별 항목 폼으로 설계했던 `DraftFormEditor` 컴포넌트는 이후 "프레임워크 테이블" 레이아웃으로 전면 교체되며 연결이 끊겼고, 그 뒤로 재연결 없이 죽은 코드로 남아있던 것을 확인 후 삭제했다.
- **개인화 없음 발견.** 대시보드의 지원사업 추천이 로그인 여부와 무관하게 전부 로드맵 단계 기준으로만 정렬되고 있었다는 걸 재사용성 점검 중 발견 — 회원가입 때 받는 관심분야/지역 정보가 대시보드에서는 한 번도 쓰이지 않고 있었다(`v0.8`).

## 개선 과정

버전 태그는 실제 작업 흐름 기준으로 매겼다(당초 "v0.1 Landing/v0.2 Roadmap/..." 식 기능 단위 계획과는 다르게, 실제로는 하루 단위 작업 세션이 곧 버전 경계가 됐다).

| 버전 | 요약 |
|------|------|
| [`v0.1`](https://github.com/chikery/AI-Startup-Roadmap-Coach/releases/tag/v0.1) | 초기 스캐폴딩 + 로드맵 UI 리디자인 |
| [`v0.2`](https://github.com/chikery/AI-Startup-Roadmap-Coach/releases/tag/v0.2) | 챗봇/GitHub Pages 배포 + StepUp 디자인 + Solar 전환 + 사업계획서 |
| [`v0.3`](https://github.com/chikery/AI-Startup-Roadmap-Coach/releases/tag/v0.3) | 백엔드 클라우드(Render) 배포 + 사업계획서 고도화 + 지원사업 매칭 |
| [`v0.4`](https://github.com/chikery/AI-Startup-Roadmap-Coach/releases/tag/v0.4) | AI 활용 깊이 강화 — 완성도 채점·근거 기반 피드백·이전/이후 비교 |
| [`v0.5`](https://github.com/chikery/AI-Startup-Roadmap-Coach/releases/tag/v0.5) | 디자인 시스템 전면 재구축 — 팔레트·프리미티브·모바일 UX·SOLAR 브랜딩 |
| [`v0.6`](https://github.com/chikery/AI-Startup-Roadmap-Coach/releases/tag/v0.6) | 대시보드 재구성 + 정보허브 + 모바일 알림 |
| [`v0.7`](https://github.com/chikery/AI-Startup-Roadmap-Coach/releases/tag/v0.7) | 요금제 + 정보허브 실데이터 연동 + 보안 하드닝 |
| [`v0.8`](https://github.com/chikery/AI-Startup-Roadmap-Coach/releases/tag/v0.8) | 재사용성 + 개인화 하드닝 |
| [`v1.0`](https://github.com/chikery/AI-Startup-Roadmap-Coach/releases/tag/v1.0) | 접근성 하드닝 — 지원사업 데모 준비 완료 |

각 버전의 배경·문제·해결 과정은 커밋 단위로 [DEVLOG.md](./DEVLOG.md)에 기록되어 있다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js (App Router, 정적 export) · TypeScript · Tailwind CSS v4 |
| Backend | FastAPI · Python |
| Database | PostgreSQL · SQLAlchemy |
| AI / RAG | Solar API(Upstage) · LangChain · FAISS |
| Auth | JWT (python-jose) |
| Rate Limiting | slowapi |
| Infra | Docker Compose(로컬) · Render(백엔드) · GitHub Pages(프론트) · GitHub Actions(배포/정보허브 수집) |

## 로컬 실행

### 1. 환경변수 설정

```bash
cp backend/.env.example backend/.env
# backend/.env에 SOLAR_API_KEY(또는 OPENAI_API_KEY) 입력

cp frontend/.env.local.example frontend/.env.local
```

### 2. DB + 백엔드 실행 (Docker)

```bash
docker-compose up -d
```

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

백엔드 API 문서: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 프로젝트 구조

```
AI-Startup-Roadmap-Coach/
├── frontend/                    # Next.js
│   └── app/
│       ├── (auth)/login|signup  # 인증 페이지
│       ├── dashboard/           # 메인 대시보드
│       ├── programs/            # 지원사업 추천
│       ├── roadmap/[step]/      # STEP 1~7
│       ├── business-plan/       # 사업계획서
│       ├── components/ui/       # 공용 프리미티브 (Button/Card/Badge/Input 등)
│       └── lib/                 # API 클라이언트, 지원사업/정보허브 데이터
├── backend/                     # FastAPI
│   └── app/
│       ├── api/                 # 라우터 (auth, programs, roadmap, ai, hub)
│       ├── models/               # DB 모델 (User, RoadmapProgress, Program, HubItem)
│       ├── schemas/              # Pydantic 스키마
│       ├── rag/pipeline.py       # 지원사업 RAG 파이프라인
│       ├── hub/                  # 정보허브 수집기 (sources/tagging/collector)
│       └── main.py
├── .github/workflows/            # 배포(deploy.yml) · 정보허브 수집(hub-collect.yml)
├── docker-compose.yml
├── render.yaml
├── DEVLOG.md                     # 커밋 단위 개발일지
└── README.md
```
