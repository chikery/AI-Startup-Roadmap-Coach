import InfoHubList from "./InfoHubList";
import { InfoHubItem } from "@/app/lib/info-hub-data";

interface Props {
  currentStep: number;
  items: InfoHubItem[];
}

// items는 플래텀/벤처스퀘어/바이라인네트워크 RSS 실데이터(hub_items, source_type="news").
// dashboard/page.tsx가 수집 결과가 비어있으면(수집 전/실패 시) STARTUP_NEWS 목업으로 폴백한다.
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
