# 개발일지 — AI Startup Roadmap Coach

> AI 기반 창업 로드맵 코칭 플랫폼

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
| Frontend | Next.js 16 (App Router) · TypeScript · Tailwind CSS |
| Backend | FastAPI · Python |
| Database | PostgreSQL · SQLAlchemy (Docker Compose) |
| AI / RAG | LangChain · FAISS · OpenAI GPT-4o-mini |
| Auth | JWT (python-jose), localStorage |
| Infra | Docker Compose (로컬), Vercel (프론트) |

---

### 3. 누적 개발 내역

#### [ee1d356] 프로젝트 초기 스캐폴딩
- Next.js + FastAPI 풀스택 프로젝트 초기 구조 세팅
- Docker Compose 구성 (PostgreSQL + FastAPI)
- 기본 라우터 구성: `/auth`, `/programs`, `/roadmap`, `/ai`
- LangChain + FAISS 기반 RAG 파이프라인 초안
- 샘플 지원사업 데이터 (`sample_programs.json`) 작성

#### [e1f5a61] .env.example API 키 플레이스홀더 교체
- `.env.example` 내 실제 키 → 플레이스홀더로 치환 (보안)

#### [50706d1] 백엔드 기동 오류 및 회원가입 프로필 저장 수정
- FastAPI 기동 시 모델 미등록 오류 수정 (`import app.models` noqa 추가)
- 회원가입 2단계 프로필(아이템 키워드·분야·단계·지역·팀) 저장 로직 수정
- `/auth/profile` PATCH 엔드포인트 token 쿼리 파라미터 처리 수정

#### [bf7b923] 로드맵 스텝 페이지 UI 전면 리디자인 ← **오늘**
- **배경**: 기존 JSON textarea 노출 방식이 사용자 비친화적
- 목업 이미지 기반으로 전면 재설계

**변경 사항:**

| 항목 | 이전 | 이후 |
|------|------|------|
| 배경 컬러 | 흰색/회색 | 크림 베이지 `#F5F0E8` |
| 레이아웃 | 단일 컬럼 | 2컬럼 (스텝 정보 2 : 지원사업 3) |
| 진행 표시 | 텍스트 "STEP X / 7" | 7개 세그먼트 바 (포레스트 그린) |
| 체크리스트 | 없음 | 단계별 태스크 (완료 ✓ / 진행 ✏️ / 미시작 ○) |
| 우측 패널 | 없음 | 지원사업 추천 카드 (D-day, 매칭 이유) |
| 초안 편집 | Raw JSON textarea | 항목별 폼 (DraftFormEditor) |

**신규 파일:**
- `frontend/app/roadmap/[step]/DraftFormEditor.tsx`
  - 7개 스텝별 전용 폼 컴포넌트 (Step1Form ~ Step7Form)
  - 문자열/배열/중첩 객체/오브젝트 리스트 필드 처리
  - AI 재생성 시 `useEffect`로 내부 상태 자동 리셋
  - `onChange(json)` 콜백으로 백엔드 JSON 포맷 그대로 전달

#### [6bc1102] 이미지 파일 gitignore 추가
- `*.png`, `*.jpg`, `mockup*` → `.gitignore` 추가

---

### 4. 현재 구현 완료 기능

**Frontend**
- [x] 랜딩 페이지 (`/`)
- [x] 로그인 · 회원가입 (2단계: 계정 + 프로필)
- [x] 대시보드 (`/dashboard`) — 7단계 진행률 표시
- [x] 로드맵 스텝 페이지 (`/roadmap/[step]`) — 목업 기반 UI
- [x] 지원사업 추천 페이지 (`/programs`) — RAG 기반

**Backend**
- [x] JWT 인증 (register / login / profile update)
- [x] 로드맵 진행 저장 · 조회 (단계별 잠금 로직 포함)
- [x] AI 초안 생성 (`/ai/generate`) — GPT-4o-mini JSON 응답
- [x] 지원사업 RAG 추천 (`/programs/recommend`) — FAISS + LangChain

---

### 5. 실행 방법

```bash
# 1. 환경변수 설정
cp backend/.env.example backend/.env
# backend/.env에 OPENAI_API_KEY 입력

# 2. 백엔드 + DB 기동
docker compose up -d

# 3. 프론트엔드 기동
cd frontend && npm install && npm run dev
```

- 프론트엔드: http://localhost:3000
- 백엔드 API 문서: http://localhost:8000/docs

---

### 6. 다음 개발 예정

- [ ] 로드맵 각 스텝 상세 뷰 (저장된 초안 카드형 렌더링)
- [ ] 사업계획서 통합 다운로드 (STEP 7 완료 시 PDF 생성)
- [ ] 지원사업 데이터 실시간 크롤링 연동
- [ ] 사용자 프로필 수정 페이지
- [ ] 반응형 모바일 UI 최적화
