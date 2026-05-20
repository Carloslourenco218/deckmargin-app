import "./globals.css";
import Script from "next/script";
import { Suspense } from "react";
import AnalyticsPageView from "@/app/components/AnalyticsPageView";

const GA_ID  = "G-S6T8QXLGFC";
const AW_ID  = "AW-17331301984";

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
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { send_page_view: false });
            gtag('config', '${AW_ID}');
          `}
        </Script>
      </head>
      <body>
        {/* Tracks page views on every client-side route change */}
        <Suspense fallback={null}>
        <AnalyticsPageView gaId={GA_ID} />
        </Suspense>
        {children}
      </body>
    </html>
  );
}