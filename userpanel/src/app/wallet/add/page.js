"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

// Function to validate TRC20 address format
const isValidTRC20Address = (address) => {
  // TRC20 addresses start with 'T' and are 34 characters long
  const trc20Regex = /^T[A-Za-z0-9]{33}$/;
  return trc20Regex.test(address);
};

function AddWalletPageInner() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const currencyFromUrl = searchParams.get("currency");
  const [currency, setCurrency] = useState("PAYX");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (currencyFromUrl) {
      setCurrency(currencyFromUrl);
    }
  }, [currencyFromUrl]);

  const currencyIcons = {
    PAYX: "/images/payx.jpg",
    USDT: "/images/tb-ic1.png",
  };

  const handleSubmit = async () => {
    if (!address) {
      setMessageType("error");
      setMessage("Please enter wallet address.");
      return;
    }

    if (!isValidTRC20Address(address)) {
      setMessageType("error");
      setMessage("Please enter a valid TRC20 wallet address.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/crypto-wallets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address, network: "TRC20", currency }),
      });

      if (response.status === 401 || response.status === 404) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const data = await response.json();

      if (response.ok) {
        setMessageType("success");
        setMessage("Crypto wallet added successfully! Redirecting...");
        setAddress("");

        setTimeout(() => {
          router.push("/wallet");
        }, 1500);
      } else {
        setMessageType("error");
        setMessage(data.error || "Failed to add crypto wallet.");
        setAddress("");
      }
    } catch (error) {
      console.error(error);
      setMessageType("error");
      setMessage("Something went wrong.");
      setAddress("");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className={styles.phoneContainer}>
      <header className={styles.header}>
        <div className={styles.backIcon}>
          <Link href="/wallet">
            <Image
              src="/images/back-btn.png"
              width={18}
              height={18}
              alt="Back"
            />
          </Link>
        </div>
        <h1 className={styles.headerTitle}>Bind wallet address</h1>
      </header>

      <div className={styles.formContent}>
        <div className={styles.formRowrap}>
          <div className={styles.formRow}>
            <span className={styles.label}>Network</span>
            <div className={styles.networkDisplay}>
              <img
                src={currencyIcons[currency]}
                alt={currency}
                className={styles.networkLogo}
              />
              TRC20–{currency}
            </div>
          </div>

          <div
            className={styles.formRow}
            style={{ alignItems: "flex-start" }}
          >
            <span className={styles.label}>
              Wallet
              <br />
              address
            </span>
            <textarea
              className={styles.addressInput}
              placeholder="Please enter wallet address"
              rows="2"
              style={{ resize: "none", backgroundColor: "#ffffff" }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        <div
          className={styles.actionContainer}
          style={{ paddingBottom: 0 }}
        >
          <button
            className={
              address
                ? `${styles.commitBtn} ${styles.commitBtnEnabled}`
                : styles.commitBtn
            }
            onClick={handleSubmit}
            disabled={!address || loading}
          >
            {loading ? "Adding..." : "Commit"}
          </button>
        </div>

        <div className={styles.warningBox}>
          <p className={styles.warningText}>
            Please check the information carefully before submission.
            If transfer issues occur due to incorrect information provided
            by user, it is the user's own responsibility.
          </p>
          {message && (
            <p
              className={`${styles.message} ${styles[messageType]}`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AddWalletPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddWalletPageInner />
    </Suspense>
  );
}