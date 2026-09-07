import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
});

const featherBold = localFont({
  src: "../fonts/DuolingoFeatherBold.ttf",
  variable: "--font-feather",
  display: "swap",
});

const dinNextBold = localFont({
  src: "../fonts/DINNextRoundedLTProBold.ttf",
  variable: "--font-din-next",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Duolingo - The world's best way to learn a language",
  description: "Learn Spanish, practice skills, earn XP, maintain your streak, and level up with Duo!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${featherBold.variable} ${dinNextBold.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[#4b4b4b] selection:bg-[#d7ffb8]">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
