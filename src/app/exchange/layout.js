export const metadata = {
  title: "Welcome to AngelX — India’s #1 Trusted USDT Exchange Platform",
  description:
             "Exchange USDT for INR instantly on AngelX—high rates, fast processing, immediate payouts, strong security, reliable support, and easy crypto selling for seamless trades",
  keywords: [
    "angelx usdt price",
    "angelx usdt price",
    "angelx crypto",
    "angelx usdt sell",
    "angelx login",
    "angelx pro",
    "angelx pro apk",
    "angelx exchange",
  ],
  alternates: {
    canonical: "https://www.angelx.ind.in/exchange",
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
    title: "Welcome to AngelX — India’s #1 Trusted USDT Exchange Platform",
    description:
      "Exchange USDT for INR instantly on AngelX—high rates, fast processing, immediate payouts, strong security, reliable support, and easy crypto selling for seamless trades.",
    url: "https://www.angelx.ind.in/exchange",
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
    title: "Welcome to AngelX — India’s #1 Trusted USDT Exchange Platform",
    description:
      "Exchange USDT for INR instantly on AngelX—high rates, fast processing, immediate payouts, strong security, reliable support, and easy crypto selling for seamless trades.",
    site: "@AngelX",
    images: ["https://www.angelx.ind.in/images/og-image.png"],
  },
};

export default function ExchangeLayout({ children }) {
  return (
    <>
     
      {children}
    </>
  );
}
