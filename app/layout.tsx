import "./globals.css";
import Script from "next/script";
import { Suspense } from "react";
import type { Metadata } from "next";
import AnalyticsPageView from "@/app/components/AnalyticsPageView";

const GA_ID = "G-N3RCLB7DWC";
const AW_ID  = "AW-17331301984";

// Root metadata — individual pages override title/description as needed
export const metadata: Metadata = {
  metadataBase: new URL("https://deckmargin.com"),
  title: {
    default: "DeckMargin: Deck Estimating Software for Contractors",
    template: "%s | DeckMargin",
  },
  description:
    "Deck estimating and proposal software built for contractors. Price a job in 10 minutes, protect your margin, send a professional proposal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ── Single gtag.js load — both GA4 + Ads share one script ── */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function