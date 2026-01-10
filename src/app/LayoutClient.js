"use client";
import { usePathname } from "next/navigation";
import Footer from "./components/footer";
import InstallPrompt from "./components/InstallPrompt";

export default function LayoutClient({ children }) {
  const pathname = usePathname();
  const hideFooter = pathname?.startsWith("/admin");

  return (
    <>
      {children}
      {!hideFooter && <Footer />}
      <InstallPrompt />
    </>
  );
}
