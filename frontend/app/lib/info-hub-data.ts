// Mock/sample data for the desktop-only "창업 정보 허브" dashboard section.
// TODO: replace with real scraping/API integration in a follow-up phase.

export interface InfoHubItem {
  title: string;
  source: string;
  date: string; // YYYY-MM-DD
  url: string;
  steps: number[]; // roadmap steps this item is most relevant to
}

export const STARTUP_NEWS: InfoHubItem[] = [
  {
    title: "2026년 초기 스타트업 투자, '검증된 문제 정의'가 최우선 기준으로",
    source: "플래텀",
    date: "2026-07-20",
    url: "https://platum.kr/",
    steps: [1],
  },
  {
    title: "예술·콘텐츠 분야 창업, 브랜드 차별화가 투자 유치의 핵심 변수로",
    source: "벤처스퀘어",
    date: "2026-07-18",
    url: "https://www.venturesquare.net/",
    steps: [2],
  },
  {
    title: "국내 시드 투자 시장, TAM·SAM·SOM 근거 자료 요구 강화",
    source: "더벨",
    date: "2026-07-15",
    url: "https://www.thebell.co.kr/",
    steps: [3],
  },
  {
    title: "유닛 이코노믹스 못 챙기면 시리즈 A도 없다 — 초기 창업 자금조달 트렌드",
    source: "플래텀",
    date: "2026-07-10",
    url: "https://platum.kr/",
    steps: [4],
  },
  {
    title: "2026 하반기 예비창업패키지, 역대 최대 규모로 모집",
    source: "벤처스퀘어",
    date: "2026-07-08",
    url: "https://www.venturesquare.net/",
    steps: [5],
  },
  {
    title: "1인 창업자도 괜찮다 — 초기 팀 구성 성공 사례 분석",
    source: "더벨",
    date: "2026-07-03",
    url: "https://www.thebell.co.kr/",
    steps: [6],
  },
  {
    title: "데모데이 피칭, 3분 안에 '왜 지금 이 팀인가'를 설득해야",
    source: "플래텀",
    date: "2026-06-29",
    url: "https://platum.kr/",
    steps: [7],
  },
];

export const GOV_SUPPORT_NEWS: InfoHubItem[] = [
  {
    title: "중기부, 2026년 예비창업패키지 통합공고 발표",
    source: "K-Startup",
    date: "2026-07-21",
    url: "https://www.k-startup.go.kr/",
    steps: [1, 5],
  },
  {
    title: "문체부, 예술경영지원센터 통한 예술창업 지원사업 확대 공고",
    source: "예술경영지원센터",
    date: "2026-07-17",
    url: "https://www.gokams.or.kr/",
    steps: [2],
  },
  {
    title: "중진공, 시장조사·사업성 분석 컨설팅 바우처 사업 공고",
    source: "중소벤처기업진흥공단",
    date: "2026-07-14",
    url: "https://www.kosmes.or.kr/",
    steps: [3],
  },
  {
    title: "정책자금 상담주간 운영 — 초기 재무모델 1:1 컨설팅 신청 접수",
    source: "K-Startup",
    date: "2026-07-11",
    url: "https://www.k-startup.go.kr/",
    steps: [4],
  },
  {
    title: "K-Startup, TIPS 프로그램 2026년 2차 모집 공고",
    source: "K-Startup",
    date: "2026-07-09",
    url: "https://www.k-startup.go.kr/",
    steps: [5],
  },
  {
    title: "중진공, 초기 창업팀 인재 매칭 프로그램 참가자 모집",
    source: "중소벤처기업진흥공단",
    date: "2026-07-05",
    url: "https://www.kosmes.or.kr/",
    steps: [6],
  },
  {
    title: "K-Startup 데모데이 2026 하반기 참가기업 모집 공고",
    source: "K-Startup",
    date: "2026-06-30",
    url: "https://www.k-startup.go.kr/",
    steps: [7],
  },
];

// 자동 수집 대상이 아니라(RSS/API로는 "이 단계에 맞는 좋은 글"을 찾을 수 없음),
// 실제 존재하는 글을 하나하나 확인하고(제목·저자·URL 실검증, 2026-08-02) 직접
// 큐레이션했다 — 이전엔 브런치 홈(brunch.co.kr) 링크에 지어낸 제목을 붙여뒀었다.
export const RECOMMENDED_ARTICLES: InfoHubItem[] = [
  {
    title: "린 스타트업(Lean Startup)이란?",
    source: "브런치스토리 · 라라",
    date: "2021-05-01",
    url: "https://brunch.co.kr/@yeonjoola/21",
    steps: [1],
  },
  {
    title: "블루오션 전략",
    source: "브런치스토리 · 라인하트",
    date: "2019-03-21",
    url: "https://brunch.co.kr/@linecard/227",
    steps: [2],
  },
  {
    title: "경쟁력있는 시장조사 법, TAM·SAM·SOM",
    source: "브런치스토리 · theBricks 이재무",
    date: "2023-03-15",
    url: "https://brunch.co.kr/@marketer-ceo/11",
    steps: [3],
  },
  {
    title: "기획자라면 꼭 알아야 할 LTV/CAC의 진짜 의미",
    source: "브런치스토리 · 심플리파이어 한성희",
    date: "2025-04-29",
    url: "https://brunch.co.kr/@simplifier/490",
    steps: [4],
  },
  {
    title: "스타트업의 재무(Finance) 관리",
    source: "브런치스토리 · 황성재",
    date: "2017-12-16",
    url: "https://brunch.co.kr/@uxinventor/116",
    steps: [5],
  },
  {
    title: "스타트업이 망하는 이유(5) — 순서가 뒤바뀐 잘못된 팀빌딩",
    source: "브런치스토리 · 최민수",
    date: "2017-05-15",
    url: "https://brunch.co.kr/@533campus/11",
    steps: [6],
  },
  {
    title: "스타트업 IR Pitch Deck 정복하기",
    source: "브런치스토리 · 재영",
    date: "2025-01-17",
    url: "https://brunch.co.kr/@jaeywriter/114",
    steps: [7],
  },
];

/** Stable sort: items tagged for `step` float to the top; original order preserved otherwise. */
export function rankByStep(items: InfoHubItem[], step: number): InfoHubItem[] {
  return [...items].sort((a, b) => Number(b.steps.includes(step)) - Number(a.steps.includes(step)));
}
