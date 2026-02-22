export const metadata = {
  title: "Angelx Official – Best Platform to Buy & Sell USDT | Angelx",

  metadescription:
    "Convert USDT to INR at premium rates with AngelX. Fast processing, instant payouts, strong security, reliable support, and easy crypto selling—your seamless exchange solution.",

  keywords: [
    "angelx usdt price",
    "angelx crypto",
    "angelx usdt sell",
    "angelx login",
    "angelx pro",
    "angelx pro apk",
    "angelx exchange",
  ],

  alternates: {
    canonical: "https://www.angelx.ind.in/",
  },

  robots: {
    index: true,
    follow: true,
    maxSnippet: -1,
    maxImagePreview: "large",
    maxVideoPreview: -1,
  },

  authors: [{ name: "AngelX" }],
  publisher: "AngelX",

  openGraph: {
    type: "website",
    title: "Welcome to AngelX — India's Trusted USDT Exchange Platform",
    description:
      "Convert USDT to INR at premium rates with AngelX. Fast processing, instant payouts, strong security, reliable support, and easy crypto selling—your seamless exchange solution.",
    url: "https://www.angelx.ind.in/",
    siteName: "AngelX",
    locale: "en_IN",
    images: [
      {
        url: "https://www.angelx.ind.in/images/og-image.png", // IMPORTANT
        width: 1200,
        height: 630,
        alt: "AngelX USDT Exchange Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Welcome to AngelX — India's Trusted USDT Exchange Platform",
    description:
      "Convert USDT to INR at premium rates with AngelX. Fast processing, instant payouts, strong security, reliable support, and easy crypto selling—your seamless exchange solution.",
    site: "@AngelX",
    images: ["https://www.angelx.ind.in/images/og-image.png"],
  },
}

export default function RootLayout({ children }) {
 return (
   <html lang="en">
      <body>{children}</body>
    </html>
 );
    
 
}
