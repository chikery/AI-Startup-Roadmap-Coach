import InfoHubList from "./InfoHubList";
import { InfoHubItem } from "@/app/lib/info-hub-data";

interface Props {
  currentStep: number;
  items: InfoHubItem[];
}

/** Policy/공고 news feed — distinct from GovernmentSupportCard, which shows
    personalized deadline-matched programs for the user to apply to.
    `items` comes from the dashboard page: real hub_items data if the backend
    has any collected, otherwise the GOV_SUPPORT_NEWS mock (see dashboard/page.tsx). */
export default function GovSupportNewsCard({ currentStep, items }: Props) {
  return (
    <InfoHubList
      icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" stroke="var(--color-accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      title="정부지원사업 소식"
      items={items}
      currentStep={currentStep}
      moreHref="https://www.k-startup.go.kr/"
      moreLabel="더 많은 공고 보기"
    />
  );
}
