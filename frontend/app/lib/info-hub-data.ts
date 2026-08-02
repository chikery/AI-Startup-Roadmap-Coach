// 창업 정보 허브 대시보드 섹션의 fallback 데이터. 실데이터(hub_items)가 비어있을 때만
// (수집 전/실패 시) 쓰인다 — dashboard/page.tsx 참고.
export interface InfoHubItem {
  title: string;
  source: string;
  date: string; // YYYY-MM-DD
  url: string;
  steps: number[]; // roadmap steps this item is most relevant to
}

// STARTUP_NEWS는 "이번 주 최신 뉴스"라 원래 자동 수집(RSS) 대상이다 —
// 실데이터가 없을 때만 잠깐 보이는 fallback이라, 지어낸 헤드라인+홈페이지 링크 대신
// 실제 존재하는 기사로 2026-08-02 시점 스냅샷을 박아뒀다(제목/URL 라이브 확인 완료).
// 시간이 지나면 "최신"이라기엔 오래된 기사가 되지만, 그래도 "제목과 링크가 실제로
// 일치하는 진짜 기사"라는 게 핵심 — 실데이터 수집이 정상화되면 이 배열은 거의 안 보인다.
export const STARTUP_NEWS: InfoHubItem[] = [
  {
    title: "중기부, '모두의 창업' 아이디어 보호 지원 확대…플랫폼 보안체계 전면 개편",
    source: "플래텀",
    date: "2026-07-31",
    url: "https://platum.kr/archives/291754",
    steps: [1],
  },
  {
    title: "[커머스BN] 김봉진 \"브랜드 시대 끝났다…조직이 중요\"",
    source: "바이라인네트워크",
    date: "2026-07-31",
    url: "https://byline.network/2026/07/31_2182773/",
    steps: [2],
  },
  {
    title: "윤슬기 언어발전소 대표, \"기술보다 사람…AI로 언어재활의 공백 메운다\"",
    source: "벤처스퀘어",
    date: "2026-08-01",
    url: "https://www.venturesquare.net/1093775/",
    steps: [3],
  },
  {
    title: "특허부터 투자계약까지…스타트업 대표가 놓치기 쉬운 4가지 성장 전략",
    source: "벤처스퀘어",
    date: "2026-08-01",
    url: "https://www.venturesquare.net/1102792/",
    steps: [4],
  },
  {
    title: "피지컬 AI 스타트업 에니그마, 7,100만 달러 시드 유치",
    source: "플래텀",
    date: "2026-07-28",
    url: "https://platum.kr/archives/291536",
    steps: [5],
  },
  {
    title: "사업계획서 접수 하루 만에 투자 검토 결과 나온다",
    source: "플래텀",
    date: "2026-07-27",
    url: "https://platum.kr/archives/291460",
    steps: [5],
  },
  {
    title: "충청권 초기창업기업 15개사 투자 무대 올라… '2026 충청권 엔젤 웨이브 IR 캠프' 성료",
    source: "스타트업엔",
    date: "2026-07-31",
    url: "https://www.startupn.kr/news/articleView.html?idxno=59155",
    steps: [5],
  },
  {
    title: "프라이머, 29세 이하 창업자 커뮤니티 'U29 파운더스 클럽' 성장세…7월 밋업에 200명 모였다",
    source: "벤처스퀘어",
    date: "2026-08-01",
    url: "https://www.venturesquare.net/1102785/",
    steps: [6],
  },
  {
    title: "디캠프, 배치 3기 디데이 열어… 참여 5개사 성과 공개",
    source: "플래텀",
    date: "2026-07-31",
    url: "https://platum.kr/archives/291743",
    steps: [7],
  },
];

// 기업마당·KOCCA 실제 공고를 라이브로 확인(2026-08-02, 전부 7/20 이후)해서
// 제목·URL을 그대로 옮겼다 — 이전엔 지어낸 제목 + 기관 홈페이지 링크였다.
export const GOV_SUPPORT_NEWS: InfoHubItem[] = [
  {
    title: "[경북] 영주시 2026년 소상공인 재창업 지원사업 참여자 추가모집 재공고",
    source: "경상북도경제진흥원",
    date: "2026-07-31",
    url: "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000124968",
    steps: [1],
  },
  {
    title: "2026년 CKL스테이지 수시대관(2차) 공고",
    source: "한국콘텐츠진흥원",
    date: "2026-07-22",
    url: "https://www.kocca.kr/kocca/pims/view.do?intcNo=326D00068009",
    steps: [2],
  },
  {
    title: "2026년 3차 사회적가치 창출 역량강화 사회적가치지표(SVI) 측정 지원사업 모집 공고",
    source: "강원지속가능경제지원센터",
    date: "2026-07-31",
    url: "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000124967",
    steps: [3],
  },
  {
    title: "2026년 4차 예술산업 금융지원 시범사업(융자) 연장 공고",
    source: "예술경영지원센터",
    date: "2026-07-31",
    url: "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000124963",
    steps: [4],
  },
  {
    title: "2026년 G-Bio Funding Lab 경기 바이오스타트업 투자유치 역량강화 참가기업 모집 공고",
    source: "경기도경제과학진흥원",
    date: "2026-07-31",
    url: "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000124964",
    steps: [5],
  },
  {
    title: "2026 대한민국 콘텐츠대상(애니메이션) 국민심사위원 모집 공고",
    source: "한국콘텐츠진흥원",
    date: "2026-07-31",
    url: "https://www.kocca.kr/kocca/pims/view.do?intcNo=326D00037012",
    steps: [6],
  },
  {
    title: "2026 대한민국 콘텐츠대상(캐릭터 부문) 정부시상 후보작 추천 공고",
    source: "한국콘텐츠진흥원",
    date: "2026-07-31",
    url: "https://www.kocca.kr/kocca/pims/view.do?intcNo=326D00091013",
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
