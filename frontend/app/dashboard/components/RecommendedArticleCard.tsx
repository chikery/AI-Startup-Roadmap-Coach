import InfoHubList from "./InfoHubList";
import { InfoHubItem } from "@/app/lib/info-hub-data";

interface Props {
  currentStep: number;
  items: InfoHubItem[];
}

// K-Startup/기업마당/KOCCA는 전부 지원사업 공고 API라 학습 아티클을 주지 않는다 —
// 이 카드는 실데이터 수집기가 없고, dashboard/page.tsx가 항상 RECOMMENDED_ARTICLES
// 목업을 그대로 items로 내려준다.
export default function RecommendedArticleCard({ currentStep, items }: Props) {
  return (
    <InfoHubList
      icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" stroke="var(--color-secondary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      title="Recommended Articles"
      items={items}
      currentStep={currentStep}
      moreHref="https://brunch.co.kr/"
      moreLabel="더 많은 아티클 보기"
    />
  );
}
