import "./globals.css";
import Script from "next/script";

// Replace G-XXXXXXXXXX with your actual GA4 Measurement ID
const GA_MEASUREMENT_ID = "G-S6T8QXLGFC";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ── Google Ads ── */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17331301984"
          strategy="afterInteractive"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', 'AW-17331301984');
          `}
        </Script>

        {/* ── Google Analytics GA4 ── */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-S6T8QXLGFC', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}