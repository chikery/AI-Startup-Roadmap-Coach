# 개발일지 — AI Startup Roadmap Coach

> AI 기반 창업 로드맵 코칭 플랫폼

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
