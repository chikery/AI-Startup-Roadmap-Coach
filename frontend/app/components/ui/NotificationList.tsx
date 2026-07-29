"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { NotificationItem } from "@/app/lib/notifications-data";

const TYPE_ICON: Record<NotificationItem["type"], ReactNode> = {
  program: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" fill="var(--color-accent)"/></svg>
  ),
  schedule: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke="var(--color-primary)" strokeWidth="1.6"/><path d="M3 9h18M8 3v4M16 3v4" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round"/></svg>
  ),
  ai_feedback: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2a1 1 0 011 1v1.06A8 8 0 0120 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a8 8 0 017-7.94V3a1 1 0 011-1z" stroke="var(--color-secondary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="13" r="1" fill="var(--color-secondary)"/><circle cx="15" cy="13" r="1" fill="var(--color-secondary)"/></svg>
  ),
};

interface Props {
  items: NotificationItem[];
}

/** Notification row list — program/schedule items link out via next/link;
    ai_feedback items dispatch the existing "open-chat" event so tapping one
    opens the same ChatPopup used on desktop, without any new chat storage. */
export default function NotificationList({ items }: Props) {
  function handleFeedbackClick() {
    // Close the enclosing Drawer (if any) via its own backdrop click-handler,
    // so it doesn't sit on top of the ChatPopup we're about to open — both
    // render at the same z-index and Drawer's portal mounts later in the DOM.
    const dialog = document.querySelector('[role="dialog"][aria-modal="true"]');
    (dialog?.previousElementSibling as HTMLElement | null)?.click();
    window.dispatchEvent(new Event("open-chat"));
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((n) =>
        n.action === "open-chat" ? (
          <button
            key={n.id}
            onClick={handleFeedbackClick}
            className="flex w-full items-start gap-2.5 rounded-md p-2.5 text-left border-none bg-transparent"
            style={{ background: "color-mix(in srgb, var(--color-surface) 60%, transparent)", border: "1px solid var(--color-border)" }}
          >
            <span className="mt-0.5 flex-shrink-0">{TYPE_ICON[n.type]}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-bold leading-snug" style={{ color: "var(--color-text)" }}>{n.title}</span>
              <span className="mt-0.5 block text-[11.5px] leading-snug" style={{ color: "var(--color-muted)" }}>{n.message}</span>
              <span className="mt-1 block text-[10.5px]" style={{ color: "var(--color-muted)" }}>{n.date.slice(5).replace("-", "/")}</span>
            </span>
          </button>
        ) : (
          <Link
            key={n.id}
            href={n.href ?? "#"}
            className="flex items-start gap-2.5 rounded-md p-2.5 no-underline"
            style={{ background: "color-mix(in srgb, var(--color-surface) 60%, transparent)", border: "1px solid var(--color-border)" }}
          >
            <span className="mt-0.5 flex-shrink-0">{TYPE_ICON[n.type]}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[12.5px] font-bold leading-snug" style={{ color: "var(--color-text)" }}>{n.title}</span>
              <span className="mt-0.5 block text-[11.5px] leading-snug" style={{ color: "var(--color-muted)" }}>{n.message}</span>
              <span className="mt-1 block text-[10.5px]" style={{ color: "var(--color-muted)" }}>{n.date.slice(5).replace("-", "/")}</span>
            </span>
          </Link>
        )
      )}
    </div>
  );
}
