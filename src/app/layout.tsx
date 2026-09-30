import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/layout/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IT Stack — Developer Portfolio Platform",
    template: "%s · IT Stack",
  },
  description:
    "Create your professional developer portfolio in minutes. Showcase your skills, experience and projects with a beautiful, customizable profile page.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://my.itstck.com"
  ),
  keywords: [
    "developer portfolio", "tech resume", "developer profile",
    "programming CV", "software engineer portfolio",
  ],
  authors: [{ name: "IT Stack" }],
  creator: "IT Stack",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "IT Stack — Developer Portfolio Platform",
    description: "Create your professional developer portfolio in minutes.",
    siteName: "IT Stack",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IT Stack — Developer Portfolio Platform",
    description: "Create your professional developer portfolio in minutes.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
