// Fill in real prices here once pricing is finalized — everything else on this
// page (features, CTAs, layout) is production content, only the numbers are TBD.
export const PRICE_PLACEHOLDER = "TBD";

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

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "0원",
    priceUnit: "",
    tagline: "아이디어를 처음 검증하는 분들을 위해",
    features: ["로드맵 3회", "AI 질문 10개"],
    ctaLabel: "무료로 시작하기",
    ctaHref: "/signup",
  },
  {
    id: "pro",
    name: "Pro",
    price: PRICE_PLACEHOLDER,
    priceUnit: "/ 월",
    tagline: "본격적으로 사업계획서를 완성하는 분들을 위해",
    features: ["로드맵 무제한", "AI 질문 무제한", "PDF Export", "멘토 추천", "AI Daily Coach"],
    ctaLabel: "Pro로 시작하기",
    ctaHref: "/signup",
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    price: PRICE_PLACEHOLDER,
    priceUnit: "/ 월",
    tagline: "팀 단위로 함께 창업을 준비하는 분들을 위해",
    features: ["팀 공유", "관리자 대시보드", "기업용 온보딩"],
    ctaLabel: "문의하기",
    ctaHref: "/signup",
  },
];
