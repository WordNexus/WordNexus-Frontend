import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LayoutContent } from "./layout-content";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WordNexus",
  description: "영어 단어 학습을 위한 최고의 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
