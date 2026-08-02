export interface PricingPlan {
  id: "free" | "pro" | "business";
  name: string;
  price: string;
  priceUnit: string;
  tagline: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
}

// Pro/Business 유료 전환은 베타 기간 이후로 예정 — 지금은 3개 플랜 버튼 전부
// /beta(베타 안내 페이지)로 연결해 실제로는 전부 무료로 이용 가능함을 알린다.
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "0원",
    priceUnit: "",
    tagline: "아이디어를 처음 검증하는 분들을 위해",
    features: ["로드맵 3회", "AI 질문 10개"],
    ctaLabel: "무료로 시작하기",
    ctaHref: "/beta",
  },
  {
    id: "pro",
    name: "Pro",
    price: "9,900원",
    priceUnit: "/ 월",
    tagline: "본격적으로 사업계획서를 완성하는 분들을 위해",
    features: ["로드맵 무제한", "AI 질문 무제한", "PDF Export", "멘토 추천", "AI Daily Coach"],
    ctaLabel: "Pro로 시작하기",
    ctaHref: "/beta",
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    price: "55,000원",
    priceUnit: "/ 월",
    tagline: "팀 단위로 함께 창업을 준비하는 분들을 위해",
    features: ["팀 공유", "관리자 대시보드", "기업용 온보딩"],
    ctaLabel: "문의하기",
    ctaHref: "/beta",
  },
];
