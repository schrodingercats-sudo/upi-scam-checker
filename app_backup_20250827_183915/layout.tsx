import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { CosmicAnalyticsProvider } from "cosmic-analytics";
import Navbar from "@/app/components/Navbar";

const primaryFont = Geist({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

// Change the title and description to your own.
export const metadata: Metadata = {
  title: "UPI Guard – Detect Fake UPI SMS & Suspicious Links",
  description: "Privacy-first protection from scam UPI messages and dangerous links. Android & iOS.",
};

export default function RootLayout({
  children,
  
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={primaryFont.className}>
      <body className="antialiased">
        <Navbar />
        <main className="min-h-screen">
          <CosmicAnalyticsProvider>
            {children}
          </CosmicAnalyticsProvider>
        </main>
      </body>
    </html>
  );
}