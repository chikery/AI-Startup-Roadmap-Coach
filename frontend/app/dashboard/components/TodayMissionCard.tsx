import Button from "@/app/components/ui/Button";

export type MissionVariant = "guest" | "roadmap" | "plan" | "support" | "polish";

interface Props {
  variant: MissionVariant;
  eyebrow: string;
  title: string;
  desc: string;
  ctaLabel: string;
  ctaHref: string;
  externalCta?: boolean;
}

export default function TodayMissionCard({ variant, eyebrow, title, desc, ctaLabel, ctaHref, externalCta }: Props) {
  return (
    <div
      className="relative overflow-hidden rounded-lg p-6 text-white sm:p-8"
      style={{
        background: "linear-gradient(150deg, var(--color-primary) 0%, var(--color-secondary) 55%, var(--color-accent) 100%)",
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 20px 40px -20px color-mix(in srgb, var(--color-primary) 55%, transparent)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(115deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 32%, rgba(255,255,255,0) 68%, rgba(255,255,255,0.12) 100%)" }}
      />
      <div className="relative">
        <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-bold tracking-wide backdrop-blur-sm">
          {eyebrow}
        </span>
        <h1 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight sm:text-[32px]">{title}</h1>
        <p className="mt-2 max-w-md text-sm text-white/85 sm:text-[15px]">{desc}</p>
        <div className="mt-6">
          <Button
            href={ctaHref}
            target={externalCta ? "_blank" : undefined}
            rel={externalCta ? "noopener noreferrer" : undefined}
            variant="primary"
            size="lg"
            className="rounded-full bg-hero-chip text-[15px] text-primary hover:opacity-90 sm:text-base"
          >
            {ctaLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
