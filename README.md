# AI Startup Roadmap Coach

> 아이디어에서 사업계획서까지 — AI 기반 창업 로드맵 코칭 플랫폼

---

## 서비스 개요

창업 아이디어를 가진 예술인·초기 창업자가 아이디어 구체화부터 사업계획서 완성까지 스스로 해낼 수 있게 돕는 AI 기반 창업 가이드 플랫폼입니다.

### 핵심 기능

| 기능 | 설명 |
|------|------|
| 🎯 창업지원사업 자동 추천 | RAG 엔진이 아이템·단계·지역 기반으로 적합한 공고 순위 추천 |
| 🗺️ 7단계 창업 로드맵 | 문제 발견 → 시장 리서치 → MVP → 비즈니스 모델 → 피치덱 |
| ✨ AI 초안 자동 생성 | 각 단계에서 GPT-4o-mini가 TPCS·가설·BMC 등 초안 즉시 생성 |
| 📄 사업계획서 자동 통합 | STEP 7 완료 시 전 단계 내용이 피치덱으로 자동 통합 |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Next.js (App Router) · TypeScript · Tailwind CSS |
| Backend | FastAPI · Python |
| Database | PostgreSQL · SQLAlchemy |
| AI / RAG | LangChain · FAISS · OpenAI GPT-4o-mini |
| Auth | JWT (python-jose) |
| Infra | Docker Compose |

---

## 로컬 실행

### 1. 환경변수 설정

```bash
cp backend/.env.example backend/.env
# backend/.env에 OPENAI_API_KEY 입력

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
│       ├── components/          # 공통 컴포넌트
│       └── lib/api.ts           # API 클라이언트
├── backend/                     # FastAPI
│   └── app/
│       ├── api/                 # 라우터 (auth, programs, roadmap, ai)
│       ├── models/              # DB 모델 (User, RoadmapProgress, Program)
│       ├── schemas/             # Pydantic 스키마
│       ├── rag/pipeline.py      # 지원사업 RAG 파이프라인
│       ├── data/                # 샘플 지원사업 데이터
│       └── main.py
├── docker-compose.yml
└── README.md
```

---

## 로드맵 STEP 구성

| STEP | 주제 | AI 생성 내용 |
|------|------|-------------|
| 1 | 문제 발견과 솔루션 | TPCS 프레임 + WHY 분석 |
| 2 | 고객과 시장 리서치 | 잠재고객 프로파일 + 리서치 플랫폼 추천 |
| 3 | 고객 인터뷰 설계 | 가설 9개 + 인터뷰 질문지 |
| 4 | MVP 테스트 설계 | 핵심 가설 + 추천 도구 8가지 |
| 5 | 시장 및 경쟁사 분석 | TAM·SAM·SOM + SWOT |
| 6 | 비즈니스 모델 | BMC 9블록 + 모순 피드백 |
| 7 | 피치덱 완성 | 10섹션 초안 + 예상 Q&A 8문항 |
