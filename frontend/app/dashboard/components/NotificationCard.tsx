import { SUPPORT_PROGRAMS, isExpired, daysLeft } from "@/app/lib/support-programs";

interface Props {
  currentStep: number;
}

export default function NotificationCard({ currentStep }: Props) {
  const urgent = SUPPORT_PROGRAMS
    .map((p) => ({ ...p, expired: isExpired(p.deadline), left: daysLeft(p.deadline) }))
    .filter((p) => !p.expired && p.left <= 14 && p.steps.includes(currentStep))
    .sort((a, b) => a.left - b.left)
    .slice(0, 3);

  if (urgent.length === 0) return null;

  return (
    <div className="glass rounded-lg p-5">
      <div className="flex items-center gap-2">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" stroke="var(--color-warning)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>마감 임박</span>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {urgent.map((p, i) => (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-md px-3 py-2 text-[12.5px] font-semibold no-underline"
            style={{ background: "color-mix(in srgb, var(--color-warning) 14%, var(--color-surface))", color: "var(--color-text)" }}
          >
            <span className="truncate pr-2">{p.name}</span>
            <span className="flex-shrink-0 font-extrabold" style={{ color: "var(--color-warning)" }}>D-{p.left}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
