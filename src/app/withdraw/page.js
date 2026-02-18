"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WithdrawUSDT() {
  const router = useRouter();
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
    fetchWallets();
    fetchBalance();
  }, [router]);

  const fetchWallets = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/crypto-wallets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.wallets && data.wallets.length > 0) {
        setWallets(data.wallets);
        // Select the first wallet or the selected one
        const selected = data.wallets.find(w => w.isSelected) || data.wallets[0];
        setSelectedWallet(selected);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBalance(data.usdtAvailable || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !selectedWallet) return;

    setSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/sell-usdt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          walletId: selectedWallet.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Sell request submitted successfully!");
        setAmount("");
        fetchBalance(); // Refresh balance
        router.push("/history");
      } else {
        alert(data.error || "Failed to submit sell request");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="withdraw-container">
      {/* Top Header */}
      <header className="main-header">
        <Link href="/exchange" className="back-link">
          <img src="/images/back-btn.png" alt="back" />
        </Link>
        <h3 className="header-title">Withdraw USDT</h3>
        <Link href="/history" className="history-link">
          <img src="/images/undo.png" alt="history" />
        </Link>
      </header>

      {/* AngelX Pro Banner */}
      <div className="pro-banner">
        <div className="pro-info">
          <img src="/images/pro-avatar.jpeg" alt="pro" className="avatar" />
          <div className="text-content">
            <p className="pro-name">AngelX Pro</p>
            <p className="pro-desc">Be the India leading digital currency exchange</p>
          </div>
        </div>
        <span className="arrow-right">›</span>
      </div>

      <div className="main-content">
        {/* Select Address Header */}
        <div className="content-row select-address-header">
          <h4 className="label-bold">Select address</h4>
          <Link href="/wallet/add">
            <img src="/images/add-wallet-icon.jpeg" alt="add" className="add-icon" />
          </Link>
        </div>

        {/* Currency Row */}
        <div className="content-row currency-row">
          <span className="field-label">Currency</span>
          <div className="currency-badges">
            <div className="badge disabled">
              <img src="/images/payx.jpeg" alt="payx" /> PAYX
            </div>
            <div className="badge active">
              <img src="/images/uic.png" alt="usdt" /> USDT
            </div>
          </div>
        </div>

        {/* Wallet Address Display */}
        <div className="wallet-display-section">
          <label className="field-label">Wallet address</label>
          <div className="wallet-address">
            {selectedWallet ? selectedWallet.address : "No wallet address available"}
          </div>
          {selectedWallet && (
            <div className="network-info">
              Network: {selectedWallet.network} {selectedWallet.label && `(${selectedWallet.label})`}
            </div>
          )}
        </div>

        {/* Withdraw Amount Section */}
        <div className="amount-input-section">
          <label className="field-label">Withdraw amount</label>
          <div className="input-group">
            <input
              type="number"
              placeholder="Please enter the amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="amount-input"
            />
            <div className="usdt-suffix">
              <img src="/images/uic.png" alt="usdt" /> USDT
            </div>
          </div>
          <div className="input-footer">
            <span className="available-text">
              Available: {balance.toFixed(2)} <img src="/images/uic.png" alt="usdt" className="mini-icon" />
            </span>
            <span className="fee-text">Refund Fee: 1 USDT</span>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          className={`confirm-btn ${amount && selectedWallet ? "ready" : ""}`}
          disabled={!amount || !selectedWallet || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting..." : "Confirm"}
        </button>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .withdraw-container {
          font-family: 'Inter', -apple-system, sans-serif;
          background-color: #ffffff;
          min-height: 100vh;
          color: #111;
        }

        .main-header {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #f1f1f1;
        }

        .back-link img { width: 18px; }
        .history-link img { width: 22px; }
        .header-title { flex: 1; text-align: center; font-size: 17px; font-weight: 600; margin: 0; }

        .pro-banner {
          background-color: #2b2b2b;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pro-info { display: flex; align-items: center; }
        .avatar { width: 32px; height: 32px; border-radius: 4px; margin-right: 12px; }
        .pro-name { color: #fdfdfd; font-size: 13px; font-weight: 700; margin: 0; }
        .pro-desc { color: #b0b0b0; font-size: 10.5px; margin: 0; }
        .arrow-right { color: #b0b0b0; font-size: 24px; font-weight: 300; }

        .main-content { padding: 24px 16px; }

        .content-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .label-bold { font-size: 17px; font-weight: 700; margin: 0; }
        .add-icon { width: 44px; }

        .field-label { font-size: 14px; color: #8a8a8a; margin-bottom: 12px; display: block; }
        
        .currency-badges { display: flex; gap: 10px; }
        .badge {
          display: flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid #e5e5e5;
        }
        .badge img { width: 14px; margin-right: 6px; }
        .badge.active { 
          color: #00c087; 
          border-color: #00c087; 
          background-color: #f6fffb; 
        }
        .badge.disabled { opacity: 0.5; }

        .wallet-display-section { margin-bottom: 28px; }
        .wallet-address { font-size: 15px; font-weight: 700; word-break: break-all; line-height: 1.4; color: #111; }
        .network-info { font-size: 12px; color: #8a8a8a; margin-top: 4px; }

        .input-group {
          display: flex;
          align-items: center;
          border-bottom: 1.5px solid #f4f4f4;
          padding-bottom: 10px;
        }
        .amount-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 16px;
          font-weight: 400;
          color: #111;
        }
        .amount-input::placeholder { color: #d1d1d1; }
        .usdt-suffix { display: flex; align-items: center; font-weight: 700; font-size: 14px; }
        .usdt-suffix img { width: 16px; margin-right: 6px; }

        .input-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          font-size: 13px;
        }
        .available-text { color: #3573e6; font-weight: 600; display: flex; align-items: center; }
        .mini-icon { width: 12px; margin-left: 4px; }
        .fee-text { color: #8a8a8a; }

        .confirm-btn {
          width: 100%;
          padding: 14px;
          border-radius: 30px;
          border: none;
          background-color: #f1f1f1;
          color: #c1c1c1;
          font-size: 16px;
          font-weight: 700;
          margin-top: 35px;
        }
        .confirm-btn.ready {
          background-color: #e2e2e2;
          color: #8a8a8a;
        }
      `}</style>
    </div>
  );
}