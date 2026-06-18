import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import ChatPopup from "./components/ChatPopup";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "StepUp — AI 창업 로드맵 코치",
  description: "아이디어에서 사업계획서까지, AI 창업 로드맵 코치",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <ChatPopup />
      </body>
    </html>
  );
}
