// category는 programs/page.tsx·signup/page.tsx의 CATEGORIES와 동일한 6개 값 중 하나.
// region은 자유 텍스트 입력(비워두면 "전국")이라 정확 일치가 아니라 느슨한 부분일치로 매칭한다.
export interface SupportProgram {
  name: string;
  url: string;
  deadline: string; // YYYY-MM-DD
  steps: number[];
  description: string;
  maxSupport: string;
  category: string;
  region: string; // "전국" 또는 구체 지역명
}

export const SUPPORT_PROGRAMS: SupportProgram[] = [
  {
    name: "2026 예술산업아카데미 아트비즈니스챌린지 11기",
    url: "https://artmore.kr/moaa_sub/lecture/expert_lect_view.do?lecture_idx=680",
    deadline: "2026-07-06",
    steps: [1,2,3,4,5,6,7],
    description: "예술분야 창업 아이디어를 사업계획과 실행계획으로 고도화하는 창업 교육형 프로그램",
    maxSupport: "교육",
    category: "문화예술",
    region: "전국",
  },
  {
    name: "2026 예술기업을 위한 금융교육 및 1:1 상담",
    url: "https://www.gokams.or.kr/01_news/notice_view.aspx?Idx=4485",
    deadline: "2026-07-02",
    steps: [6],
    description: "예술기업의 정책자금 이해, 자금조달 전략, 1:1 상담 프로그램",
    maxSupport: "교육/상담",
    category: "문화예술",
    region: "전국",
  },
  {
    name: "2026 예술산업아카데미 예술산업 AI 트렌드 특강 I",
    url: "https://artmore.kr/moaa_sub/lecture/expert_lect_view.do?lecture_idx=687",
    deadline: "2026-07-01",
    steps: [2, 6],
    description: "AI 트렌드를 예술산업 아이템 리서치와 비즈니스 모델 고도화에 활용",
    maxSupport: "교육",
    category: "문화예술",
    region: "전국",
  },
  {
    name: "2026 아트코리아랩 오픈 프롬프트 커뮤니티 콜로키엄 1차",
    url: "https://www.gokams.or.kr/01_news/notice_view.aspx?Idx=4487",
    deadline: "2026-06-28",
    steps: [2, 4],
    description: "예술기술/AI 활용 아이템의 시장 트렌드 이해와 MVP 실험 아이디어 발굴",
    maxSupport: "커뮤니티/행사",
    category: "문화예술",
    region: "전국",
  },
  {
    name: "2026 국내 화랑 해외 아트페어 참가 하반기 공모",
    url: "https://www.gokams.or.kr/02_apply/introduction_view.aspx?Idx=2817",
    deadline: "2026-07-07",
    steps: [7],
    description: "해외 아트페어 참가를 통해 시각예술/화랑 비즈니스의 해외 유통과 판로 확장",
    maxSupport: "공고문 확인",
    category: "문화예술",
    region: "전국",
  },
  {
    name: "2026 아트코리아랩 글로벌 교류 유통 지원 자유형 공모",
    url: "https://www.gokams.or.kr/02_apply/introduction_view.aspx?Idx=2814",
    deadline: "2026-06-19",
    steps: [7],
    description: "예술기술 융합 프로젝트의 글로벌 교류, 유통, 해외 확산 지원",
    maxSupport: "공고문 확인",
    category: "문화예술",
    region: "전국",
  },
  {
    name: "2026 K-뮤지컬 영미권 뮤지컬 신작 발표지원(미국) 공모",
    url: "https://www.gokams.or.kr/01_news/notice_view.aspx?Idx=4492",
    deadline: "2026-07-06",
    steps: [7],
    description: "뮤지컬/공연 콘텐츠의 해외 발표와 글로벌 진출을 위한 발표지원형 공모",
    maxSupport: "공고문 확인",
    category: "문화예술",
    region: "전국",
  },
  {
    name: "2026년 부천문화재단 예술과 기업 동반성장 지원사업",
    url: "https://www.culture.go.kr/portal/cltBnf/cltSup/view.do?viewTp=2&rcrtSn=221740",
    deadline: "2026-06-18",
    steps: [6, 7],
    description: "예술과 기업 협업 기반으로 사업화/파트너십 가능성을 확장하는 지역 문화예술 지원사업",
    maxSupport: "공고문 확인",
    category: "문화예술",
    region: "부천",
  },
  {
    name: "공연예술인을 위한 비즈니스 교육 창업스쿨",
    url: "https://www.culture.go.kr/portal/cltBnf/cltSup/view.do?viewTp=2&rcrtSn=222130",
    deadline: "2026-06-18",
    steps: [1,2,3,4,5,6],
    description: "공연예술인의 창업 기초, 비즈니스 모델, 운영 역량을 키우는 교육 프로그램",
    maxSupport: "교육",
    category: "문화예술",
    region: "전국",
  },
  {
    name: "2026년 데이터 마케팅 컨설팅 지원 사업",
    url: "https://www.culture.go.kr/portal/cltBnf/cltSup/view.do?viewTp=2&rcrtSn=222193",
    deadline: "2026-06-18",
    steps: [2, 5, 6],
    description: "출판사의 데이터 기반 마케팅, 시장분석, 고객전략 수립을 돕는 컨설팅 지원",
    maxSupport: "공고문 확인",
    category: "콘텐츠",
    region: "전국",
  },
  {
    name: "2026년 청년 아트페어 UNDER 39 참여작가 모집",
    url: "https://www.culture.go.kr/portal/cltBnf/cltSup/view.do?viewTp=2&rcrtSn=222515",
    deadline: "2026-06-18",
    steps: [7],
    description: "만 39세 이하 청년 예술가의 작품/브랜드를 시장에 공개하고 판로를 만드는 아트페어형 공모",
    maxSupport: "공고문 확인",
    category: "문화예술",
    region: "전국",
  },
  {
    name: "2026 문화자치학교 수강생 모집",
    url: "https://www.culture.go.kr/portal/cltBnf/cltSup/view.do?viewTp=2&rcrtSn=222516",
    deadline: "2026-06-18",
    steps: [2],
    description: "지역문화, 문화정책, 로컬 커뮤니티 이해를 통해 문화예술 아이템의 맥락 리서치에 활용",
    maxSupport: "교육",
    category: "문화예술",
    region: "전국",
  },
  {
    name: "2026 예천 문화특화지역조성사업 예천 맛고을길 축제학교",
    url: "https://www.culture.go.kr/portal/cltBnf/cltSup/view.do?viewTp=2&rcrtSn=222617",
    deadline: "2026-06-18",
    steps: [2, 4, 6],
    description: "로컬 문화/F&B/축제 아이템의 지역 테스트와 운영모델 학습에 적합",
    maxSupport: "교육",
    category: "문화예술",
    region: "예천",
  },
  {
    name: "2026 스케일업 액셀러레이팅 콘텐츠 우수기업 모집",
    url: "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?schM=view&pbancSn=178183",
    deadline: "2026-06-30",
    steps: [6, 7],
    description: "충남 소재 콘텐츠 기업 대상 IR 컨설팅, 투자, Pre-TIPS/TIPS 추천을 연계하는 액셀러레이팅",
    maxSupport: "직접투자 1천만 원+",
    category: "콘텐츠",
    region: "충남",
  },
  {
    name: "2026 청년창업 레벨UP 프로그램",
    url: "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?schM=view&pbancSn=178179",
    deadline: "2026-07-10",
    steps: [1,2,3,4,5,6],
    description: "만 20-39세 청년 대상 창업 특강/멘토링으로 아이디어부터 사업모델까지 단계별 학습",
    maxSupport: "교육/멘토링",
    category: "기타",
    region: "전국",
  },
  {
    name: "예술산업 금융교육 예술기업을 위한 정책자금의 이해와 전략",
    url: "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?schM=view&pbancSn=178155",
    deadline: "2026-07-02",
    steps: [6],
    description: "예술기업의 정책자금, 재무관리, 자금조달 전략을 점검하는 교육 및 상담",
    maxSupport: "교육/상담",
    category: "문화예술",
    region: "전국",
  },
  {
    name: "2026년 공공시장 진출 교육 프로그램(10기)",
    url: "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?schM=view&pbancSn=177723",
    deadline: "2026-07-07",
    steps: [7],
    description: "창업기업 확인서 보유 기업이 조달/공공시장 진출을 준비하는 교육 프로그램",
    maxSupport: "교육",
    category: "기타",
    region: "전국",
  },
  {
    name: "2026년 팁스(TIPS) 창업기업 지원",
    url: "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?schM=view&pbancSn=176076",
    deadline: "2026-12-31",
    steps: [4,5,6,7],
    description: "투자/추천을 받은 창업기업의 R&D, 사업화, 해외마케팅을 지원하는 대표 민관협력 사업",
    maxSupport: "최대 8억 원 (딥테크 최대 15억)",
    category: "기술/IT",
    region: "전국",
  },
  {
    name: "2026 컴업스타즈 참가기업 모집",
    url: "https://www.k-startup.go.kr/web/contents/bizpbanc-ongoing.do?schM=view&pbancSn=178161",
    deadline: "2026-07-16",
    steps: [7],
    description: "글로벌 진출 희망 스타트업 대상 피칭, 부스, 액셀러레이팅, 해외 네트워킹 제공",
    maxSupport: "행사/네트워킹",
    category: "기타",
    region: "전국",
  },
  {
    name: "2026년 콘텐츠코리아 전시회 참가기업 모집",
    url: "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000124965",
    deadline: "2026-08-26",
    steps: [7],
    description: "고양시 소재 콘텐츠기업 대상, 국내외 판로 개척을 위한 공동관 부스(3m×3m) 조성 지원",
    maxSupport: "부스 조성 지원(국/영문 간판·조명·전기 포함)",
    category: "콘텐츠",
    region: "고양",
  },
  {
    name: "모두의 창업 : 사회혁신 소셜벤처 리그",
    url: "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000124908",
    deadline: "2026-08-19",
    steps: [1],
    description: "사회문제를 해결하는 혁신 기술·아이디어를 가진 예비창업자·초기기업(업력 7년 이내) 발굴·육성, 서류→발표→최종 3단계 평가",
    maxSupport: "임팩트 활동비 200만원 + 멘토링 지원 500만원 + 사업화 자금",
    category: "소셜임팩트",
    region: "전국",
  },
  {
    name: "2026년 청년창업제품 판로개척 지원사업",
    url: "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000124893",
    deadline: "2026-08-21",
    steps: [7],
    description: "경북 소재 만 19~39세 청년창업기업 대상 온라인 기획전 참가 지원 — 상세페이지 제작, 마케팅·광고 지원",
    maxSupport: "온라인 기획관 운영 + 마케팅 지원",
    category: "기타",
    region: "경북",
  },
  {
    name: "2026 예술분야 예비창업 프로그램",
    url: "https://www.gokams.or.kr/01_news/notice_view.aspx?Idx=4519",
    deadline: "2026-08-10",
    steps: [3],
    description: "예술분야 예비창업자·업력 3년 미만 기업 대상, 비즈니스모델 시장검증 기반 사업역량 강화 — 고객×시장검증 지원 + 역량강화 교육 + 전담 멘토링",
    maxSupport: "500만원 상당(시장검증 지원) + 멘토링·컨설팅",
    category: "문화예술",
    region: "전국",
  },
  {
    name: "제5회 김해스타트업 창업캠프",
    url: "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000124874",
    deadline: "2026-08-09",
    steps: [5, 7],
    description: "김해 소재 스타트업·예비창업자 대상, 인사이트 트립·투자사 1:1 밋업·대중견기업 매칭·IR 데모데이 지원",
    maxSupport: "프로그램 참가 지원(투자 매칭·IR 데모데이)",
    category: "기타",
    region: "김해",
  },
  {
    name: "시흥시 스타트업 통합 IR데이",
    url: "https://www.bizinfo.go.kr/sii/siia/selectSIIA200Detail.do?pblancId=PBLN_000000000124839",
    deadline: "2026-08-13",
    steps: [5, 7],
    description: "시흥시 소재(또는 연구소·지사) 업력 7년 이내 창업기업 대상, IR 기초·고도화 교육 후 통합 IR데이 본선 및 사후관리 지원",
    maxSupport: "IR 교육 + 데모데이 참가 지원",
    category: "기타",
    region: "시흥",
  },
  {
    name: "2026 콘텐츠IP 마켓 (CONTENT IP MARKET 2026)",
    url: "https://www.kocca.kr/kocca/pims/view.do?intcNo=326D00091012",
    deadline: "2026-08-19",
    steps: [7],
    description: "콘텐츠 IP 라이선싱·기획·제작·유통 기업 대상 B2B 비즈니스 마켓(총 80개사) — 1:1 비즈니스 미팅, 전시, 해외 바이어 매칭",
    maxSupport: "부스 조성 + 비즈매칭 + 통역 지원",
    category: "콘텐츠",
    region: "전국",
  },
  {
    name: "2026 예술산업보증 공모",
    url: "https://www.gokams.or.kr/01_news/notice_view.aspx?Idx=4523",
    deadline: "2026-08-10",
    steps: [4],
    description: "예술산업 분야 예술기업·프로젝트 대상 금융 접근성 향상을 위한 보증 지원(예술경영지원센터 추천 → 기술보증기금 심사), 매달 접수",
    maxSupport: "최대 10억원(보증한도), 보증비율 95~100%",
    category: "문화예술",
    region: "전국",
  },
];

export function getProgramsForStep(step: number): SupportProgram[] {
  return SUPPORT_PROGRAMS.filter(p => p.steps.includes(step));
}

export function isExpired(deadline: string): boolean {
  return new Date(deadline) < new Date(new Date().toDateString());
}

export function daysLeft(deadline: string): number {
  const diff = new Date(deadline).getTime() - new Date(new Date().toDateString()).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** region은 자유 텍스트라 정확 일치를 기대할 수 없다 — "전국"이거나 둘 중 하나가
    비어있으면 항상 매치, 그 외엔 대소문자 무시 부분 포함으로 느슨하게 비교한다. */
export function matchesRegion(programRegion: string, userRegion?: string): boolean {
  if (!userRegion || !userRegion.trim()) return true; // 미입력 = 전국으로 간주
  if (programRegion === "전국") return true;
  const a = programRegion.trim().toLowerCase();
  const b = userRegion.trim().toLowerCase();
  return a.includes(b) || b.includes(a);
}

/** 로그인 유저 프로필(category/region)과 얼마나 맞는지 점수화.
    step 일치와 독립적으로 더해지므로, 프로필 정보가 없는 유저는 항상 0점 —
    이 경우 호출부가 기존처럼 step 기준 정렬로만 동작해 결과가 0건이 되지 않는다.
    "전국"은 모든 유저에게 항상 참이라 실제 지역 개인화 신호가 아니므로 점수에서 제외 —
    그렇지 않으면 지역이 안 맞는 유저도 전국 사업 때문에 "맞춤"으로 잘못 표시된다. */
export function profileMatchScore(p: SupportProgram, user?: { category?: string; region?: string } | null): number {
  if (!user) return 0;
  let score = 0;
  if (user.category && p.category === user.category) score += 1;
  if (user.region && p.region !== "전국" && matchesRegion(p.region, user.region)) score += 1;
  return score;
}
