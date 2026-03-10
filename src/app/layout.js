import "./globals.css";
import Script from "next/script";
import LayoutClient from "./LayoutClient";

export const metadata = {
  title: "AngelX → Your USDT-to-INR Exchange Needs, One App!",
  description:
    "Log in to AngelX for instant USDT-to-INR conversions at the best market rates. Fast processing, secure payouts, reliable support—sell your crypto easily now!",
  keywords: [
    "angelx usdt price",
    "angelx crypto",
    "angelx usdt sell",
    "angelx login",
    "angelx pro",
    "angelx pro apk",
    "angelx usdt",
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
    title: "AngelX → Your USDT-to-INR Exchange Needs, One App!",
    description:
      "Log in to AngelX for instant USDT-to-INR conversions at the best market rates. Fast processing, secure payouts, reliable support—sell your crypto easily now!",
    url: "https://www.angelx.ind.in/",
    siteName: "AngelX",
    locale: "en_IN",
    images: [
      {
        url: "https://www.angelx.ind.in/images/logo-icon.png",
        width: 1200,
        height: 630,
        alt: "AngelX USDT Exchange Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AngelX → Your USDT-to-INR Exchange Needs, One App!",
    description:
      "Log in to AngelX for instant USDT-to-INR conversions at the best market rates. Fast processing, secure payouts, reliable support—sell your crypto easily now!",
    site: "@AngelX",
    images: ["https://www.angelx.ind.in/images/logo-icon.png"],
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
        <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "AngelX",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "7966",
              "reviewCount": "7966"
            }
          }
          `,
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
<Script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is AngelX?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "AngelX is a reliable India-based crypto exchange app launched in 2021, focused on quick USDT-to-INR swaps without any KYC hassle."
    }
  },{
    "@type": "Question",
    "name": "Can I exchange USDT for INR on AngelX without KYC?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Absolutely—AngelX skips KYC entirely for USDT-to-INR trades. No PAN, Aadhaar, or documents required. Sell your USDT anonymously at rates that beat market USD/INR levels, with speedy deposits and straight-to-bank payouts."
    }
  },{
    "@type": "Question",
    "name": "What are AngelX's top USDT rates?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "AngelX delivers superior USDT rates above market averages for bigger INR returns. Open the app for live, clear pricing pulled from Binance and WazirX, covering TRC20, BEP20, and ERC20—with zero hidden charges."
    }
  },{
    "@type": "Question",
    "name": "How fast are USDT deposits and INR withdrawals on AngelX?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Deposits to your USDT wallet (via TRC20, BEP20, or ERC20) confirm in just 1-2 minutes. Once you place a sell order, INR hits your Indian bank via IMPS or RTGS in about 30 minutes—way quicker than most platforms."
    }
  },{
    "@type": "Question",
    "name": "Is the AngelX Apk secure and free?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Yes, the AngelX Apk is completely free, secure, and auto-updates for peace of mind. Since 2021, countless users have trusted it for private USDT-to-INR exchanges and 24/7 portfolio monitoring, no fees or privacy risks involved."
    }
  },{
    "@type": "Question",
    "name": "What bank accounts work for AngelX INR withdrawals?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Connect any Indian bank account—personal or even rented—without verification. AngelX sends INR directly via fast transfers, compatible with all major banks for effortless USDT sales."
    }
  },{
    "@type": "Question",
    "name": "Does AngelX accept all USDT networks?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Yes, it supports TRC20, BEP20, ERC20, and others for effortless deposits from any wallet. Confirmations happen in 1-2 minutes, positioning AngelX as India's go-to for stablecoin-to-INR conversions."
    }
  },{
    "@type": "Question",
    "name": "How do I access 24/7 support on AngelX for USDT-to-INR queries?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "AngelX offers round-the-clock live chat and phone support from real agents. Track transactions in-app, grab instant statements, or reach out anytime for help with rates, deposits, or withdrawals."
    }
  }]
}`
  }}
/>
          
      </body>
    </html>
  );
}
