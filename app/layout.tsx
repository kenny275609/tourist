import type { Metadata } from "next";
import { Hachi_Maru_Pop, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

const hachiMaruPop = Hachi_Maru_Pop({
  weight: "400",
  variable: "--font-handwritten",
  subsets: ["latin"],
  display: "swap",
});

const zenMaruGothic = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  variable: "--font-handwritten-alt",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "武陵四秀 - 登山行程規劃",
  description: "武陵四秀登山行程與裝備清單規劃",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body
        className={`${hachiMaruPop.variable} ${zenMaruGothic.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
