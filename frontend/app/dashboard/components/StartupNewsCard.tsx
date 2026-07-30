import InfoHubList from "./InfoHubList";
import { InfoHubItem } from "@/app/lib/info-hub-data";

interface Props {
  currentStep: number;
  items: InfoHubItem[];
}

// 이번 단계에서 확정한 수집 대상(K-Startup/기업마당/KOCCA)은 전부 정부지원사업
// 공고이지, 창업 생태계 일반 뉴스가 아니다 — 그래서 이 카드는 실데이터 수집기가
// 없고, dashboard/page.tsx가 항상 STARTUP_NEWS 목업을 그대로 items로 내려준다.
export default function StartupNewsCard({ currentStep, items }: Props) {
  return (
    <InfoHubList
      icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 5a1 1 0 011-1h11a1 1 0 011 1v13a2 2 0 002 2H6a2 2 0 01-2-2V5z" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 4h2a1 1 0 011 1v14a2 2 0 01-2 2" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 8h6M7 11.5h6M7 15h3" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round"/></svg>}
      title="Startup News"
      items={items}
      currentStep={currentStep}
      moreHref="https://www.venturesquare.net/"
      moreLabel="더 많은 소식 보기"
    />
  );
}
