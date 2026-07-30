import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChatPopup from "./components/ChatPopup";
import AuthRefresher from "./components/AuthRefresher";
import { ToastProvider } from "./components/ui/Toast";
import { ThemeProvider } from "./components/ui/ThemeProvider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "StepUp — AI 창업 로드맵 코치",
  description: "아이디어에서 사업계획서까지, AI 창업 로드맵 코치",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${geist.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* 구버전 JS 청크 로드 실패 시 자동 하드 리프레시 */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.addEventListener('error', function(e) {
            var t = e.target;
            if (t && (t.tagName === 'SCRIPT' || t.tagName === 'LINK')) {
              var key = '__chunk_err_' + location.pathname;
              if (!sessionStorage.getItem(key)) {
                sessionStorage.setItem(key, '1');
                location.reload(true);
              }
            }
          }, true);
        ` }} />
        {/* 팔레트/다크모드 적용 — hydration 전에 실행해 깜빡임(FOUC) 방지 */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var palette = localStorage.getItem('stepup_palette') || 'violet';
              var mode = localStorage.getItem('stepup_mode') || 'system';
              var resolved = mode === 'system'
                ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                : mode;
              document.documentElement.setAttribute('data-palette', palette);
              document.documentElement.setAttribute('data-theme', resolved);
            } catch (e) {}
          })();
        ` }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <ToastProvider>
            {children}
            <ChatPopup />
            <AuthRefresher />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
