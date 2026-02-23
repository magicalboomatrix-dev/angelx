import "./globals.css";
import Script from "next/script";
import LayoutClient from "./LayoutClient";

export const metadata = {
  title: "Welcome to AngelX → India’s #1 Trusted USDT Exchange Platform",
  description:
    "Log in to AngelX for instant USDT to INR conversions at the best market rates. Fast processing, secure payouts, reliable support—quickly access your account and sell crypto easily.",
  keywords: [
    "angelx usdt price",
    "angelx crypto",
    "angelx usdt sell",
    "angelx login",
    "angelx pro",
    "angelx pro apk",
    "angelx ind in",
    "angelx exchange",
  ],
  alternates: {
    canonical: "https://www.angelx.ind.in/",
  },
  robots: {
    index: true,
    follow: true,
    content: "index, follow",
    maxSnippet: -1,
    maxImagePreview: "large",
    maxVideoPreview: -1,
  },
  googleBot: {
    index: true,
    follow: true,
    content: "index, follow",
    maxSnippet: -1,
    maxImagePreview: "large",
    maxVideoPreview: -1,
  },
  bingbot: {
    index: true,
    follow: true,
    content: "index, follow",
    maxSnippet: -1,
    maxImagePreview: "large",
    maxVideoPreview: -1,
  },
  authors: [{ name: "AngelX" }],
  publisher: "AngelX",
  openGraph: {
    type: "website",
    title: "Welcome to AngelX → India’s #1 Trusted USDT Exchange Platform",
    description:
      "Log in to AngelX for instant USDT to INR conversions at the best market rates. Fast processing, secure payouts, reliable support—quickly access your account and sell crypto easily.",
    url: "https://www.angelx.ind.in/",
    siteName: "AngelX",
    locale: "en_IN",
    images: [
      {
        url: "https://www.angelx.ind.in/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "AngelX USDT Exchange Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Welcome to AngelX → India’s #1 Trusted USDT Exchange Platform",
    description:
      "Log in to AngelX for instant USDT to INR conversions at the best market rates. Fast processing, secure payouts, reliable support—quickly access your account and sell crypto easily.",
    site: "@AngelX",
    images: ["https://www.angelx.ind.in/images/og-image.png"],
  },
};


export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/images/fav.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Monda:wght@400..700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="/css/style.css" type="text/css" />
    
        <meta name="google-site-verification" content="jUO7Efs6MP1aBNCrvKVjToVHeq5FzBJR5jpVmoDxSiY" />
        {/* Google Analytics (G-ZZFB2YV2JH) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZZFB2YV2JH"
          strategy="afterInteractive"
        />
        <Script id="ga-main" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZZFB2YV2JH');
          `}
        </Script>
        {/* Google Ads (AW-17927547758) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17927547758"
          strategy="afterInteractive"
        />
        <Script id="ga-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17927547758');
          `}
        </Script>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "AngelX",
              "url": "https://www.angelx.ind.in/",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.angelx.ind.in/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FinancialService",
              "@id": "https://www.angelx.ind.in/#organization",
              "name": "AngelX",
              "url": "https://www.angelx.ind.in/",
              "logo": "https://www.angelx.ind.in/images/logo-icon.png",
              "description": "Exchange USDT for INR instantly on AngelX—high rates, fast processing, immediate payouts, strong security, reliable support, and easy crypto selling for seamless trades.",
              "areaServed": {
                "@type": "Country",
                "name": "India"
              },
              "sameAs": [
                "https://www.instagram.com/angelxexchange",
                "https://twitter.com/angelxexchange"
              ]
            })
          }}
        />
      </head>
      <body>
        <LayoutClient>{children}</LayoutClient>
        <Script
          src="https://code.jquery.com/jquery-3.6.0.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/bxslider/4.2.12/jquery.bxslider.min.js"
          strategy="afterInteractive"
        />
        {/* Register Service Worker for PWA/offline support */}
        <Script id="sw-register" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  // Registration successful
                  // console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                  // Registration failed
                  // console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
