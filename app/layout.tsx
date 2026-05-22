import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIBE PROJECT",
  description: "비전공자 대학생을 위한 AI 코딩 기획서, 프롬프트, 에러 해결 가이드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
