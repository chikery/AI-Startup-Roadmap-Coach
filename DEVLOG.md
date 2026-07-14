# 개발일지 — AI Startup Roadmap Coach

> AI 기반 창업 로드맵 코칭 플랫폼

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
