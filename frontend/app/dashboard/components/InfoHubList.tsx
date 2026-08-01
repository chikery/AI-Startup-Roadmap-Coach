import { ReactNode } from "react";
import Card from "@/app/components/ui/Card";
import Badge from "@/app/components/ui/Badge";
import Button from "@/app/components/ui/Button";
import { InfoHubItem, rankByStep } from "@/app/lib/info-hub-data";

interface Props {
  icon: ReactNode;
  title: string;
  items: InfoHubItem[];
  currentStep: number;
  moreHref: string;
  moreLabel: string;
}

/** Shared presentational list for the "창업 정보 허브" section — not one of the 3 named
    hub cards itself, just the rendering it factors out so they don't triplicate JSX. */
export default function InfoHubList({ icon, title, items, currentStep, moreHref, moreLabel }: Props) {
  const ranked = rankByStep(items, currentStep).slice(0, 4);

  return (
    <Card variant="glass" padding="md" className="flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-bold" style={{ color: "var(--color-text)" }}>{title}</span>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          {ranked.map((item, i) => {
            const matched = item.steps.includes(currentStep);
            return (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md p-2.5 no-underline transition-colors"
                style={{
                  background: matched ? "color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))" : "color-mix(in srgb, var(--color-surface) 60%, transparent)",
                  border: `1px solid ${matched ? "color-mix(in srgb, var(--color-primary) 30%, transparent)" : "var(--color-border)"}`,
                  opacity: matched ? 1 : 0.62,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[12.5px] font-bold leading-snug" style={{ color: "var(--color-text)" }}>{item.title}</span>
                  {matched && (
                    <Badge variant="default" className="flex-shrink-0 whitespace-nowrap text-[10px]">
                      {currentStep}단계 관련
                    </Badge>
                  )}
                </div>
                <div className="mt-1 text-[11px]" style={{ color: "var(--color-muted)" }}>
                  {item.source} · {item.date.slice(5).replace("-", "/")}
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <Button href={moreHref} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm" className="mt-3 w-full">
        {moreLabel}
      </Button>
    </Card>
  );
}
