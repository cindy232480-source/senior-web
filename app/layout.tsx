import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav"; // ⬅️ 新增這行，引入導覽列

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "樂齡交友平台",
  description: "字體大、按鈕大、操作簡單",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-amber-50`}
      >
        <TopNav /> {/* ⬅️ 新增這行：導覽列 */}
        <main id="main" className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
