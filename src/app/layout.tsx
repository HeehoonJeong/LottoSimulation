import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lotto Lab — 행운을 실험하다",
  description:
    "매주 로또 100장을 산다면, 1등까지 얼마나 걸릴까요? 0.1초마다 한 주씩, 로또 6/45의 확률을 직접 실험해 보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
