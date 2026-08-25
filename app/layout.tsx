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

const PRIMARY_SITE_URL = "https://dashboard.fishmeaqua.com";
const deploymentHost =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL;
const SITE_URL = deploymentHost
  ? deploymentHost.startsWith("http")
    ? deploymentHost
    : `https://${deploymentHost}`
  : PRIMARY_SITE_URL;
const META_TITLE = "Fish Me Aqua Dashboard";
const META_DESCRIPTION =
  "Secure staff dashboard for managing Fish Me Aqua products, orders, customers, reviews, messages, and commerce analytics.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: META_TITLE,
  title: {
    default: META_TITLE,
    template: `%s | ${META_TITLE}`,
  },
  description: META_DESCRIPTION,
  alternates: {
    canonical: PRIMARY_SITE_URL,
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: META_TITLE,
    description: META_DESCRIPTION,
    url: PRIMARY_SITE_URL,
    siteName: META_TITLE,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image.png",
        width: 2400,
        height: 1260,
        alt: "Fish Me Aqua Dashboard",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: META_TITLE,
    description: META_DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false, noimageindex: true },
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
