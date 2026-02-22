export const metadata = {
  title: "Welcome to AngelX",
  /*description:
    "Log in to AngelX for instant USDT to INR conversions at top rates. Fast processing, secure payouts, reliable support—quickly access your account and sell crypto easily.",*/
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
    canonical: "https://www.angelx.ind.in/login",
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
};

export default function LoginLayout({ children }) {
  return (
    <>
      <head>
        <meta
          name="description"
          content="Log in to AngelX for instant USDT to INR conversions at top rates. Fast processing, secure payouts, reliable support—quickly access your account and sell crypto easily."
        />
      </head>
      {children}
    </>
  );
}
