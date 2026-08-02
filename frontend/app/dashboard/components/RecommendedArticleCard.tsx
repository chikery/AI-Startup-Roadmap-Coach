import InfoHubList from "./InfoHubList";
import { InfoHubItem } from "@/app/lib/info-hub-data";

interface Props {
  currentStep: number;
  items: InfoHubItem[];
}

// "이번 주 최신 글"이 아니라 "단계별로 계속 유효한 좋은 글"이 필요해 RSS/API
// 자동 수집 대상이 아니다 — info-hub-data.ts에 실제 존재하는 글을 직접
// 큐레이션해뒀고(제목·저자·URL 실검증 완료), 이 카드는 그 값을 그대로 받는다.
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
