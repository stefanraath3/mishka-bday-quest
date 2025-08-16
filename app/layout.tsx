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
  title: "Mishka Birthday Quest",
  description:
    "A medieval birthday adventure game with riddles, puzzles, and interactive audio. Celebrate Mishka's birthday in a magical castle!",
  openGraph: {
    title: "Mishka Birthday Quest",
    description:
      "A medieval birthday adventure game with riddles, puzzles, and interactive audio. Celebrate Mishka's birthday in a magical castle!",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Mishka Birthday Quest - Medieval adventure game",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mishka Birthday Quest",
    description:
      "A medieval birthday adventure game with riddles, puzzles, and interactive audio. Celebrate Mishka's birthday in a magical castle!",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
