import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { FontLoader } from "@/components/FontLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Loopin",
  description: "Loopin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ fontFamily: "'SUIT Variable', sans-serif" }}
      >
        <FontLoader />
        <Providers>
          <main className="mx-auto flex min-h-screen w-full max-w-[500px] flex-col">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
