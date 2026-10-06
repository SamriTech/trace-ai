import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
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
  title: "ETHIOPIAN FEDERAL POLICE | AI Investigation Platform (TRACE AI)",
  description: "Forensic Person Re-ID and CCTV Spatio-Temporal Tracking Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex flex-col bg-[#F4F6FA] text-[#0F172A] font-sans selection:bg-[#D4AF37] selection:text-black">
        {children}
      </body>
    </html>
  );
}
