"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from './page.module.css';

export default function WalletPage() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    // Get selected wallet from localStorage
    const storedWallet = localStorage.getItem("selectedWallet");
    if (storedWallet) {
      const parsedWallet = JSON.parse(storedWallet);
      setSelectedWalletId(parsedWallet.id);
      // If you want to sync tab state, do it in the Withdraw page, not here.
    }
    // Wallet fetching is handled in the next useEffect
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fetchWallets = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("/api/crypto-wallets", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401 || res.status === 404) {
          // Token invalid or user not found - redirect to login
          localStorage.removeItem("token");
          localStorage.removeItem("selectedWallet");
          router.push("/login");
          return;
        }

        if (!res.ok) {
          const data = await res.json();
          setMessage(data.error || "Failed to fetch wallets.");
          return;
        }

        const data = await res.json();
        setWallets(data.wallets || []);
      } catch (err) {
        console.error(err);
        setMessage("Something went wrong. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, [router]);

  const handleSelectWallet = async (wallet) => {
    setSelectedWalletId(wallet.id);
    localStorage.setItem("selectedWallet", JSON.stringify(wallet));
    router.push("/withdraw");
  };

  const deleteWallet = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch(`/api/crypto-wallets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 404) {
        // Token invalid or user not found - redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("selectedWallet");
        router.push("/login");
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to delete wallet.");
        return;
      }

      setWallets(wallets.filter((wallet) => wallet.id !== id));

      if (selectedWalletId === id) {
        localStorage.removeItem("selectedWallet");
        setSelectedWalletId(null);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again later.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString('en-US', { hour12: false });
    return `Create time: ${day} ${month} ${year} at ${time}`;
  };

  return (
    <div className={styles.phoneContainer}>
      <header className={styles.header}>
        <Link href="/withdraw">
          <img src="/images/back-btn.png" className={styles.backBtn} alt="Back" />
        </Link>
        <h1 className={styles.headerTitle}>Select wallet address</h1>
      </header>

      <div className={styles.listContent}>
        {loading ? (
          <p>Loading wallets...</p>
        ) : message ? (
          <p style={{ color: "red", marginTop: "10px" }}>{message}</p>
        ) : wallets.length === 0 ? (
          <div className={styles.noData}>No more data</div>
        ) : (
          wallets.map((wallet) => (
            <div key={wallet.id} className={styles.walletCard} onClick={() => handleSelectWallet(wallet)}>
              <div className={styles.cardMain}>
                <img src="/images/tb-ic1.png" className={styles.tokenIcon} alt="TRC20 Logo" />
                <div className={styles.details}>
                  <div className={styles.tokenName}>
                    TRC20–{wallet.currency || "USDT"}
                    <img src={wallet.currency === "PAYX" ? "/images/payx.jpg" : "/images/uic.png"} className={styles.usdtSmall} alt={wallet.currency || "USDT"} />
                  </div>
                  <div className={styles.addressText}>
                  <div className={styles.flexitem}> {wallet.address}</div>
                  {selectedWalletId === wallet.id && (
                  <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="12" fill="#00c853"/>
                    <path d="M7 12l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                  </div>
                </div>
                
              </div>

              <div className={styles.cardFooter}>
                <span className={styles.timeLabel}>
                  {wallet.createdAt ? formatDate(wallet.createdAt) : ''}
                </span>
                <svg
                  className={styles.deleteBtn}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#666"
                  strokeWidth="2"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteWallet(wallet.id);
                  }}
                >
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                </svg>
              </div>
            </div>
          ))
        )}
        <div className={styles.bottomAction}>
        <Link href="/wallet/add">
          <button className={styles.addBtn}>+Add wallet address</button>
        </Link>
      </div>
      </div>

      
    </div>
  );
}
