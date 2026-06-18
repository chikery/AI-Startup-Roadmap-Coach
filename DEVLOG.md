# 개발일지 — AI Startup Roadmap Coach

> AI 기반 창업 로드맵 코칭 플랫폼

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
