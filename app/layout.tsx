import type { Metadata } from "next";
import { Inter, Space_Mono } from "next/font/google";
import { Background } from "@/components/layout/background";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Pulse — ISP Auditor",
  description: "Calculate what your ISP owes you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceMono.variable} antialiased`}>
        <Background />
        {children}
      </body>
    </html>
  );
}
