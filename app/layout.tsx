import type { Metadata } from "next";
import { DynaPuff, Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Brand wordmark font — used only for the sidebar logo (font-dynapuff
// utility), not the rest of the UI, which stays on Geist Sans.
const dynaPuff = DynaPuff({
  variable: "--font-dynapuff",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://admin.goconverto.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Go Converto Admin",
  description: "Internal admin panel for managing the Go Converto platform.",
  openGraph: {
    title: "Go Converto Admin",
    description: "Internal admin panel for managing the Go Converto platform.",
    url: SITE_URL,
    siteName: "Go Converto Admin",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Go Converto Admin",
    description: "Internal admin panel for managing the Go Converto platform.",
  },
  // Internal staff tool — never index it.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${dynaPuff.variable} antialiased`}
      >
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: { fontSize: "0.875rem", fontWeight: 500 },
            success: { style: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" } },
            error: { style: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" } },
          }}
        />
      </body>
    </html>
  );
}
