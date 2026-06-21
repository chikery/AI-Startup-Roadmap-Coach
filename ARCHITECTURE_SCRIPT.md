# 시스템 아키텍처 발표 스크립트

> **슬라이드**: 05 · 시스템 아키텍처  
> **목표**: 사용자 브라우저 중심으로 프론트 · 백엔드 · DB · AI 연결 구조를 설명  
> **원칙**: 두괄식 — 핵심 결론 먼저, 기술 세부사항 후  
> **소요 시간**: 약 2분

---

## 슬라이드 수정 내용 (실제 스택 기준)

### 제목 제안
```
Next.js · FastAPI · PostgreSQL · Solar AI로 연결된 서비스 구조.
```

### 각 박스 실제 스택

| 박스 | 현재 슬라이드 | 실제 내용 |
|------|-------------|---------|
| CENTER · 사용자 | 사용자 브라우저 | 사용자 브라우저 (동일) |
| FRONTEND | 프론트엔드 (예: Vite + React) | **Next.js 15** · GitHub Pages 정적 배포 |
| BACKEND · API | 백엔드 API 서버 (예: API 서버) | **FastAPI (Python)** · Render.com |
| DATABASE | DB · 인증 | **PostgreSQL** · Render Free |
| AI · EXTERNAL API | Solar LLM · 지원사업 API | **Solar API (solar-pro)** · Upstage |

---

## 발표 스크립트

### [오프닝 — 결론 먼저]

> "StepUp은 프론트엔드만 만든 게 아닙니다.  
> 사용자 브라우저를 중심으로, Next.js · FastAPI · PostgreSQL · Solar AI가  
> 실제로 연결되어 동작하는 풀스택 서비스입니다."

---

### [사용자 브라우저 → 프론트엔드]

> "사용자가 브라우저에서 접속하는 주소는 GitHub Pages입니다.  
> Next.js 15로 만든 정적 사이트로, 별도 서버 비용 없이 무료 배포됩니다.  
> 사용자가 단계별 화면을 보고 입력하면, 브라우저가 직접 백엔드 API를 호출합니다."

---

### [사용자 브라우저 → 백엔드 API]

> "백엔드는 FastAPI로 만든 Python 서버이고, Render.com 클라우드에서 실행됩니다.  
> 브라우저에서 세 가지 요청이 옵니다.
>
> 첫째, 로그인 요청 — JWT 토큰을 발급해 브라우저 localStorage에 저장합니다.  
> 둘째, 로드맵 저장 요청 — 사용자가 작성한 7단계 내용을 DB에 저장합니다.  
> 셋째, AI 생성 요청 — Solar AI를 호출해 초안과 피드백을 받아 브라우저로 돌려줍니다."

---

### [백엔드 → DB]

> "FastAPI는 PostgreSQL 데이터베이스와 SQLAlchemy로 연결됩니다.  
> 저장하는 데이터는 세 가지입니다.  
> 회원 인증 정보, 7단계 로드맵 콘텐츠, 그리고 최종 사업계획서입니다.  
> DB 덕분에 사용자가 다음에 다시 접속해도 이전 작업이 그대로 유지됩니다."

---

### [백엔드 → Solar AI]

> "AI 기능은 Upstage의 Solar API를 사용합니다. 모델명은 solar-pro입니다.  
> FastAPI가 Solar API를 직접 호출하고, 결과를 받아 브라우저로 전달하는 구조입니다.  
> AI가 하는 일은 세 가지 — 단계별 초안 생성, 코치 요다 피드백, 사업계획서 통합 작성입니다."

---

### [클로징 — 구조 요약]

> "정리하면 이렇습니다.  
> 브라우저가 Next.js 화면을 렌더링하고,  
> FastAPI가 인증과 데이터 처리를 담당하고,  
> PostgreSQL이 사용자 데이터를 저장하고,  
> Solar AI가 창업 코칭 콘텐츠를 생성합니다.  
> 이 네 개가 실제로 연결되어 서비스가 동작합니다."

---

## 데이터 흐름 요약 (슬라이드 보강용)

```
사용자 브라우저
  │
  ├─▶ GET chikery.github.io          → Next.js 정적 파일 (GitHub Pages)
  │
  ├─▶ POST /auth/login               → FastAPI (Render)
  │         └─▶ JWT 토큰 발급        → localStorage 저장
  │
  ├─▶ GET/POST /roadmap/{1~7}        → FastAPI (Render)
  │         └─▶ SELECT/INSERT        → PostgreSQL (Render DB)
  │
  ├─▶ POST /ai/draft                 → FastAPI
  │         └─▶ Solar API (solar-pro) → 초안 텍스트 반환
  │
  ├─▶ POST /ai/feedback              → FastAPI
  │         └─▶ Solar API (solar-pro) → 코치 요다 피드백 반환
  │
  └─▶ POST /ai/business-plan         → FastAPI
            └─▶ Solar API (solar-pro) → 사업계획서 통합 생성
```

---

## 슬라이드 텍스트 교체 가이드

### ARCHITECTURE NOTE 박스
```
프론트만 만든 게 아니라,
데이터 · AI까지 직접 연결했습니다.
```

### FRONTEND 박스
```
FRONTEND
Next.js 15
GitHub Pages 정적 배포 · 사용자 인터페이스
7단계 진행 화면 · 결과물 뷰어
```

### BACKEND · API 박스
```
BACKEND · API
FastAPI (Python)
Render.com 클라우드 배포
JWT 인증 · 로드맵 저장 · Solar AI 호출 게이트웨이
```

### DATABASE 박스
```
DATABASE
PostgreSQL
Render Free DB
회원 인증 · 7단계 콘텐츠 · 사업계획서 저장
```

### AI · EXTERNAL API 박스
```
AI · EXTERNAL API
Solar API (solar-pro) · Upstage
초안 생성 · 코치 요다 피드백 · 사업계획서 통합 작성
```
