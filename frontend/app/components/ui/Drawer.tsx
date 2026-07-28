"use client";

import { ReactNode, useEffect, useState } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  trigger: (open: () => void) => ReactNode;
  title?: string;
  children: ReactNode;
}

export default function Drawer({ trigger, title, children }: DrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {trigger(() => setOpen(true))}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="glass relative w-full max-h-[75vh] overflow-y-auto rounded-t-lg p-5"
            style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full" style={{ background: "var(--color-border-strong)" }} />
            <div className="flex items-center justify-between mb-3">
              {title && <span className="text-[15px] font-[800] text-text">{title}</span>}
              <button
                onClick={() => setOpen(false)}
                aria-label="닫기"
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-muted"
              >
                <X size={18} />
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
