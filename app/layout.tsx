import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "0GPilot — Autonomous AI Software Engineer for Web3",
  description:
    "0GPilot is an AI-native autonomous Web3 software engineering platform built on 0G infrastructure for generating, deploying, and managing decentralized applications using intelligent AI agents.",

  keywords: [
    "0G",
    "0GPilot",
    "AI",
    "Web3",
    "Blockchain",
    "AI Agents",
    "DeFi",
    "Smart Contracts",
    "Autonomous AI",
    "0G APAC Hackathon",
    "OpenClaw",
    "AI Infrastructure",
    "Next.js",
  ],

  openGraph: {
    title: "0GPilot",
    description:
      "Autonomous AI Software Engineer for Web3 built on 0G infrastructure.",

    url: "https://0gpilot.vercel.app",

    siteName: "0GPilot",

    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "0GPilot",
      },
    ],

    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "0GPilot",
    description:
      "AI-native autonomous Web3 software engineering platform built on 0G.",

    images: ["/logo.png"],
  },

  metadataBase: new URL("https://0gpilot.vercel.app"),
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
