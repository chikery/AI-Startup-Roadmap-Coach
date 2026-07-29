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

export const RECOMMENDED_ARTICLES: InfoHubItem[] = [
  {
    title: "린 스타트업으로 '진짜 문제'를 검증하는 5단계",
    source: "브런치스토리",
    date: "2026-06-20",
    url: "https://brunch.co.kr/",
    steps: [1],
  },
  {
    title: "블루오션 전략 — '다르게 만드는 것'은 어떻게 찾는가",
    source: "브런치스토리",
    date: "2026-06-18",
    url: "https://brunch.co.kr/",
    steps: [2],
  },
  {
    title: "TAM·SAM·SOM 제대로 계산하는 실전 가이드",
    source: "브런치스토리",
    date: "2026-06-15",
    url: "https://brunch.co.kr/",
    steps: [3],
  },
  {
    title: "LTV/CAC 3배 법칙, 초기 창업자가 오해하는 것들",
    source: "브런치스토리",
    date: "2026-06-12",
    url: "https://brunch.co.kr/",
    steps: [4],
  },
  {
    title: "런웨이 계산법 — 12~18개월 확보를 위한 자금 전략",
    source: "브런치스토리",
    date: "2026-06-09",
    url: "https://brunch.co.kr/",
    steps: [5],
  },
  {
    title: "팀 캔버스로 보완 관계 설계하기",
    source: "브런치스토리",
    date: "2026-06-06",
    url: "https://brunch.co.kr/",
    steps: [6],
  },
  {
    title: "Guy Kawasaki의 10/20/30 법칙으로 피치덱 완성하기",
    source: "브런치스토리",
    date: "2026-06-03",
    url: "https://brunch.co.kr/",
    steps: [7],
  },
];

/** Stable sort: items tagged for `step` float to the top; original order preserved otherwise. */
export function rankByStep(items: InfoHubItem[], step: number): InfoHubItem[] {
  return [...items].sort((a, b) => Number(b.steps.includes(step)) - Number(a.steps.includes(step)));
}
