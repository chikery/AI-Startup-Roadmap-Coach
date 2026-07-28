import Link from "next/link";

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
  const Cta = () => (
    <span
      className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[15px] font-bold sm:text-base"
      style={{ color: "var(--color-primary)" }}
    >
      {ctaLabel}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </span>
  );

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
          {externalCta ? (
            <a href={ctaHref} target="_blank" rel="noopener noreferrer"><Cta /></a>
          ) : (
            <Link href={ctaHref}><Cta /></Link>
          )}
        </div>
      </div>
    </div>
  );
}
