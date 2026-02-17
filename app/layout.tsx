import type { Metadata } from "next";
import { Geist, Geist_Mono, M_PLUS_1p } from "next/font/google";
import { SessionProvider } from "@/components/providers/SessionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const mPlus1p = M_PLUS_1p({
  variable: "--font-m-plus-1p",
  subsets: ["latin", "japanese"] as unknown as (
    | "cyrillic"
    | "latin"
    | "latin-ext"
    | "vietnamese"
  )[],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ちよプラブックスペース",
  description: "企業図書館向け図書貸出管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${mPlus1p.variable} antialiased`}
      >
        <a
          href="#main"
          className="skip-link"
        >
          メインコンテンツへスキップ
        </a>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
