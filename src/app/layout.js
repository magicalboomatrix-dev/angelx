import "./globals.css";
import Script from "next/script";
import LayoutClient from "./LayoutClient";

export const metadata = {
  title: "AngelX - USDT Exchange Platform",
  description: "Buy and sell USDT seamlessly with AngelX",
  manifest: "/manifest.json",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AngelX",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  verification: {
    google: "jUO7Efs6MP1aBNCrvKVjToVHeq5FzBJR5jpVmoDxSiY",
  },
};


export default function Layout({ children }) {
  return (
    <html lang="en">
      <head>
      <link rel="icon" type="image/x-icon" href="/images/fav.png" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/icon-192x192.png" />
      <meta name="mobile-web-app-capable" content="yes" />
       
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
        <meta name="description" content="" />
        <meta meta name="viewport" content="width=device-width, user-scalable=no" />

         {/* Google tag */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17927547758"
          strategy="afterInteractive"
        />
        <Script id="google-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17927547758');
          `}
        </Script>

        {/* Google Analytics (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ZZFB2YV2JH"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-ZZFB2YV2JH');
          `}
        </Script>  
            
      </head>
      <body >
        <LayoutClient>{children}</LayoutClient>

        <Script src="https://code.jquery.com/jquery-3.6.0.js" strategy="beforeInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js" strategy="afterInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/bxslider/4.2.12/jquery.bxslider.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}



