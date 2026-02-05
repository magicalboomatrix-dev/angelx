'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
export const metadata = {
  title: "Welcome to AngelX",
  description:
    "Log in to AngelX for instant USDT to INR conversions at top rates. Fast processing, secure payouts, reliable support—quickly access your account and sell crypto easily.",

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


export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');

    if (token) {
      router.replace('/home'); // redirect if logged in
    } else {
      setLoading(false); // show login page if not
    }
  }, [router]);

  if (loading) {
    return (
      <div className="page-wrappers">
        <div className="loader">
          <Image
            src="/images/loading.webp" // ✅ Leading / ensures Vercel finds it
            alt="loader"
            width={50}
            height={50}
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <main>
        <div className="page-wrappers">
          <div className="page-wrapperss page-wrapper-ex page-wrapper-login">
            <section className="section-1">
              <div className="image">
                <img
                  src="/images/login-img.png" // ✅ Added leading /
                  style={{ width: "100%" }}
                  alt="Login Illustration"
                />
              </div>
            </section>
            <section className="section-3">
              <p className="title" style={{ textAlign: "center" }}>
                <b>Welcome to AngelX</b>
              </p>
              <p style={{ textAlign: "center" }}>
                AngelX is the most trustable and exchange partner, the more you
                exchange, the more you earn!
              </p>
              <div className="login-bx">
                <Link href="/login-account" className="login-btn">
                  Login
                </Link>
                <p className="text">
                  First time login will register new account for you
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

