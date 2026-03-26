export const metadata = {
  title: "AngelX → Your USDT-to-INR Exchange Needs, One App!",
  description:
             "Fast-track USDT-to-INR conversions on AngelX: Best market rates, robust security, quick processing. Reliable team ready—access account, sell crypto now!",
  keywords: [
    "angelx usdt price",
    "angelx usdt",
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
    title: "AngelX → Your USDT-to-INR Exchange Needs, One App!",
    description:
      "Fast-track USDT-to-INR conversions on AngelX: Best market rates, robust security, quick processing. Reliable team ready—access account, sell crypto now!.",
    url: "https://www.angelx.ind.in/exchange",
    siteName: "AngelX",
    locale: "en_IN",
    images: [
      {
        url: "https://www.angelx.ind.in/images/logo-icon.png",
        width: 1200,
        height: 630,
        alt: "AngelX → Your USDT-to-INR Exchange Needs, One App!",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AngelX → Your USDT-to-INR Exchange Needs, One App!",
    description:
      "Fast-track USDT-to-INR conversions on AngelX: Best market rates, robust security, quick processing. Reliable team ready—access account, sell crypto now!.",
    site: "@AngelX",
    images: ["https://www.angelx.ind.in/images/logo-icon.png"],
  },
};

export default function ExchangeLayout({ children }) {
  return (
    <>
     
      {children}
    </>
  );
}
