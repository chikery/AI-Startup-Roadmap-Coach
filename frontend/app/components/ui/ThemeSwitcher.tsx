"use client";

import { useEffect, useRef, useState } from "react";
import { Palette as PaletteIcon, Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme, PALETTES, Mode } from "./ThemeProvider";
import { cn } from "@/app/lib/cn";

const MODE_OPTIONS: { id: Mode; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "라이트", icon: Sun },
  { id: "dark", label: "다크", icon: Moon },
  { id: "system", label: "시스템", icon: Monitor },
];

export default function ThemeSwitcher({ className }: { className?: string }) {
  const { palette, mode, setPalette, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="테마 설정"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full sm:h-10 sm:w-10"
        style={{ color: "var(--color-muted)" }}
      >
        <PaletteIcon size={18} />
      </button>

      {open && (
        <div
          className="glass absolute right-0 top-full z-50 mt-2 w-64 rounded-lg p-4"
          role="dialog"
          aria-label="테마 설정"
        >
          <div className="mb-1.5 text-[12px] font-[600]" style={{ color: "var(--color-muted)" }}>모드</div>
          <div className="mb-4 flex gap-1.5">
            {MODE_OPTIONS.map(({ id, label, icon: Icon }) => {
              const active = mode === id;
              return (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className="flex flex-1 flex-col items-center gap-1 rounded-md py-2 text-[11px] font-[600] transition-colors"
                  style={{
                    background: active ? "var(--color-primary-subtle)" : "transparent",
                    color: active ? "var(--color-primary)" : "var(--color-muted)",
                  }}
                >
                  <Icon size={15} />
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mb-1.5 text-[12px] font-[600]" style={{ color: "var(--color-muted)" }}>컬러 팔레트</div>
          <div className="flex gap-2.5">
            {PALETTES.map((p) => {
              const active = palette === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPalette(p.id)}
                  aria-label={p.name}
                  aria-pressed={active}
                  title={p.name}
                  className="relative flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-105"
                  style={{
                    background: p.swatch,
                    outline: active ? "2px solid var(--color-text)" : "2px solid transparent",
                    outlineOffset: 2,
                  }}
                >
                  {active && <Check size={14} color="#fff" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
