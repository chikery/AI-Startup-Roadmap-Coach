import InfoHubList from "./InfoHubList";
import { STARTUP_NEWS } from "@/app/lib/info-hub-data";

interface Props {
  currentStep: number;
}

export default function StartupNewsCard({ currentStep }: Props) {
  return (
    <InfoHubList
      icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 5a1 1 0 011-1h11a1 1 0 011 1v13a2 2 0 002 2H6a2 2 0 01-2-2V5z" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 4h2a1 1 0 011 1v14a2 2 0 01-2 2" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 8h6M7 11.5h6M7 15h3" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round"/></svg>}
      title="Startup News"
      items={STARTUP_NEWS}
      currentStep={currentStep}
      moreHref="https://www.venturesquare.net/"
      moreLabel="더 많은 소식 보기"
    />
  );
}
