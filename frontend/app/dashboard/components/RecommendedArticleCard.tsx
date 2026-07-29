import InfoHubList from "./InfoHubList";
import { RECOMMENDED_ARTICLES } from "@/app/lib/info-hub-data";

interface Props {
  currentStep: number;
}

export default function RecommendedArticleCard({ currentStep }: Props) {
  return (
    <InfoHubList
      icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z" stroke="var(--color-secondary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      title="Recommended Articles"
      items={RECOMMENDED_ARTICLES}
      currentStep={currentStep}
      moreHref="https://brunch.co.kr/"
      moreLabel="더 많은 아티클 보기"
    />
  );
}
