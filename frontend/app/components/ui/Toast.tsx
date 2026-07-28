"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, AlertCircle, Info, XCircle } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICON: Record<ToastVariant, React.ComponentType<{ size?: number; color?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const COLOR: Record<ToastVariant, string> = {
  success: "var(--color-success)",
  error: "var(--color-error)",
  info: "var(--color-info)",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const show = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className="fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:pr-6"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const Icon = ICON[t.variant];
          return (
            <div
              key={t.id}
              className="glass flex items-center gap-2.5 rounded-full px-4 py-3 text-[13.5px] font-[600] text-text shadow-md"
              style={{ boxShadow: "var(--shadow-md)" }}
            >
              <Icon size={17} color={COLOR[t.variant]} />
              {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
