"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Footer from "./components/footer";
import { ensureValidToken } from "./utils/auth";

const PUBLIC_PATHS = new Set(["/", "/login", "/login-account", "/exchange"]);
const SESSION_SYNC_INTERVAL_MS = 5 * 60 * 1000;

function isProtectedPath(pathname) {
  return pathname ? !PUBLIC_PATHS.has(pathname) : false;
}

export default function LayoutClient({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const hideFooter = pathname?.startsWith("/admin");
  const [authReady, setAuthReady] = useState(() => !isProtectedPath(pathname));

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      const protectedPath = isProtectedPath(pathname);

      if (protectedPath) {
        setAuthReady(false);
      }

      const token = await ensureValidToken();
      if (cancelled) {
        return;
      }

      if (protectedPath && !token) {
        router.replace("/login");
        return;
      }

      setAuthReady(true);
    }

    bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncSession = () => {
      ensureValidToken().catch(() => {});
    };

    const intervalId = window.setInterval(syncSession, SESSION_SYNC_INTERVAL_MS);
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  if (isProtectedPath(pathname) && !authReady) {
    return <div className="page-wrappers" />;
  }

  return (
    <>
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}
