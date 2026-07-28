"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Palette = "violet" | "ocean" | "forest" | "sunset" | "slate";
export type Mode = "light" | "dark" | "system";

export const PALETTES: { id: Palette; name: string; swatch: string }[] = [
  { id: "violet", name: "바이올렛", swatch: "#6C5CE7" },
  { id: "ocean", name: "오션", swatch: "#2563EB" },
  { id: "forest", name: "포레스트", swatch: "#2D8659" },
  { id: "sunset", name: "선셋", swatch: "#E0575A" },
  { id: "slate", name: "슬레이트", swatch: "#3F4451" },
];

const PALETTE_KEY = "stepup_palette";
const MODE_KEY = "stepup_mode";

interface ThemeContextValue {
  palette: Palette;
  mode: Mode;
  resolvedMode: "light" | "dark";
  setPalette: (p: Palette) => void;
  setMode: (m: Mode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveMode(mode: Mode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

function apply(palette: Palette, mode: Mode) {
  const resolved = resolveMode(mode);
  document.documentElement.setAttribute("data-palette", palette);
  document.documentElement.setAttribute("data-theme", resolved);
  return resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [palette, setPaletteState] = useState<Palette>("violet");
  const [mode, setModeState] = useState<Mode>("system");
  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedPalette = (localStorage.getItem(PALETTE_KEY) as Palette) || "violet";
    const savedMode = (localStorage.getItem(MODE_KEY) as Mode) || "system";
    setPaletteState(savedPalette);
    setModeState(savedMode);
    setResolvedMode(apply(savedPalette, savedMode));

    if (savedMode === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => setResolvedMode(apply(savedPalette, "system"));
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
  }, []);

  const setPalette = useCallback((p: Palette) => {
    setPaletteState(p);
    localStorage.setItem(PALETTE_KEY, p);
    setResolvedMode(apply(p, mode));
  }, [mode]);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    localStorage.setItem(MODE_KEY, m);
    setResolvedMode(apply(palette, m));
  }, [palette]);

  return (
    <ThemeContext.Provider value={{ palette, mode, resolvedMode, setPalette, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
