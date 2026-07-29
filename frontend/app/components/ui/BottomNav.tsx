"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/app/lib/cn";
import { NOTIFICATIONS, unreadCount } from "@/app/lib/notifications-data";

const ITEMS = [
  {
    href: "/dashboard",
    label: "대시보드",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor"/></svg>
    ),
  },
  {
    href: "/programs",
    label: "지원사업",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="currentColor"/></svg>
    ),
  },
  {
    href: "/business-plan",
    label: "사업계획서",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
  },
];

/** Mobile-only fixed tab bar for the app's three primary sections. Desktop nav stays in each page's own header. */
export default function BottomNav() {
  const pathname = usePathname();
  const hasUnread = unreadCount(NOTIFICATIONS) > 0;

  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-border pb-[env(safe-area-inset-bottom)] md:hidden">
      {ITEMS.map((item) => {
        const active = !!pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-semibold no-underline",
              active ? "text-primary" : "text-muted"
            )}
          >
            <span className="relative">
              {item.icon}
              {item.href === "/dashboard" && hasUnread && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-error" />
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
