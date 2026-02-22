"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WithdrawUSDT() {
  const [activeTab, setActiveTab] = useState("PAYX");
  const router = useRouter();
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);

  const icons = {
    PAYX: "/images/payx.jpg",
    USDT: "/images/uic.png",
  };

  // Keep activeTab in sync with selectedWallet.currency
  useEffect(() => {
    if (selectedWallet && selectedWallet.currency && activeTab !== selectedWallet.currency) {
      setActiveTab(selectedWallet.currency);
    }
  }, [selectedWallet]);

  // When user switches tab, update selectedWallet to first wallet of that currency
  const handleTabSwitch = (currency) => {
    setActiveTab(currency);
    const match = wallets.find((w) => (w.currency || "USDT") === currency);
    if (match) setSelectedWallet(match);
    else setSelectedWallet(null);
  };

  // When wallets are fetched, ensure selectedWallet is valid and has currency
  useEffect(() => {
    if (!wallets.length) {
      setSelectedWallet(null);
      return;
    }
    // Try to keep selectedWallet in wallets, else pick first wallet
    let current = selectedWallet && wallets.find(w => w.id === selectedWallet.id);
    if (!current) {
      // Try to restore from localStorage if available
      const stored = localStorage.getItem("selectedWallet");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          current = wallets.find(w => w.id === parsed.id);
        } catch {}
      }
    }
    if (!current) {
      // Default: first wallet
      current = wallets[0];
    }
    setSelectedWallet(current);
  }, [wallets]);

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
        // Add fallback currency if missing
        const walletsWithCurrency = data.wallets.map(w => ({
          ...w,
          currency: w.currency || "USDT" // fallback to USDT if not present
        }));
        setWallets(walletsWithCurrency);
      } else {
        setWallets([]);
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
    <div className="withdraw-container page-wrappers page-wrapper-ex home-wrapperss setting-wrapper">
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
      <div className="pro-banners">
        <div className="pro-info">
          <img
            src="/images/pro-avatar.jpg"
            alt="pro"
            className="avatars"
            style={{ width: "100%" }}
          />
          {/*<div className="text-content">
            <p className="pro-name">AngelX Pro</p>
            <p className="pro-desc">Be the India leading digital currency exchange</p>
          </div> 
        </div>
        <span className="arrow-right">›</span>*/}
        </div>
      </div>

      <div className="main-content">
        {/* Select Address Header */}
        <div className="content-row select-address-header">
          <h4 className="label-bold">Select address</h4>
          {/*<Link href={`/wallet/add?currency=${activeTab}`}>
            <img
              src="/images/add-wallet-icon.jpg"
              alt="add"
              className="add-icon"
            />
          </Link>*/}

          <Link href={`/wallet`}>
            <img
              src="/images/add-wallet-icon.jpg"
              alt="add"
              className="add-icon"
            />
          </Link>
        </div>

        {/* Currency Row */}
        <div className="content-row currency-row">
          <span className="field-label" style={{ margin: 0 }}>
            Currency
          </span>
          <div className="currency-badges">
            <div
              className={`badge badge-PAYX tb ${activeTab === "PAYX" ? "active" : ""}`}
              onClick={() => handleTabSwitch("PAYX")}
            >
              <img src="/images/payx.jpg" alt="payx" /> PAYX
              <img src="/images/y-tick.png" className="y-icon" />
            </div>
            <div
              className={`badge badge-USDT tb ${activeTab === "USDT" ? "active" : ""}`}
              onClick={() => handleTabSwitch("USDT")}
            >
              <img src="/images/uic.png" alt="usdt" /> USDT
              <img src="/images/y-tick.png" className="y-icon" />
            </div>
          </div>
        </div>
        {/* Wallet Address Display and Validation */}
        {selectedWallet && selectedWallet.currency === activeTab ? (
          <>
            <div className="network-info dflex">
              <div className="left">Network</div>
              <div className="right">
                <img className="icon" src="/images/tb-ic1.png" />{" "}
                {selectedWallet.network}{" "}
                {selectedWallet.label && `(${selectedWallet.label})`}
              </div>
            </div>
            <div className="wallet-display-section">
              <label className="field-label">Wallet address</label>
              <div className="d-flex address-rw">
                <div className="left">
                  <div className="wallet-address">{selectedWallet?.address}</div>
                </div>
                <div className="right">
                  <Link href="/wallet" className="addr-link">
                    <img src="/images/address-icon.jpg" alt="icon" />
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="add-wallet">
            <Link
              href={`/wallet/add?currency=${activeTab}`}
              className="addr-link"
            >
              <img className="icon" src="/images/add-btn.jpg" />
              Add wallet address
            </Link>
          </div>
        )}

        {/* Withdraw Amount Section */}
        <div className="amount-input-section">
          <label className="field-label">Withdraw amount</label>
          <div className="input-group">
            <input
              type="text"
              placeholder="Please enter the amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="amount-input"
            />
            <div className="usdt-suffix sss">
              <img src={icons[activeTab]} alt={activeTab} /> {activeTab}
            </div>
          </div>
          <div className="input-footer">
            <span className="available-text">
              Available: {balance.toFixed(2)}{" "}
              <img src="/images/uic.png" alt="usdt" className="mini-icon" />
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
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

        .withdraw-container {
          background-color: #ffffff;
          min-height: 100vh;
          color: #111;
          font-family: "Mona Sans", sans-serif;
        }

        .main-header {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid #f1f1f1;
        }

        .back-link img {
          width: 18px;
        }
        .history-link img {
          width: 22px;
        }
        .header-title {
          flex: 1;
          text-align: center;
          font-size: 17px;
          font-weight: 600;
          margin: 0;
        }

        .pro-banner {
          background-color: #2b2b2b;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pro-info {
          display: flex;
          align-items: center;
        }
        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          margin-right: 12px;
        }
        .pro-name {
          color: #fdfdfd;
          font-size: 13px;
          font-weight: 700;
          margin: 0;
        }
        .pro-desc {
          color: #b0b0b0;
          font-size: 10.5px;
          margin: 0;
        }
        .arrow-right {
          color: #b0b0b0;
          font-size: 24px;
          font-weight: 300;
        }

        .main-content {
          padding: 24px 16px;
        }

        .content-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .label-bold {
          font-size: 17px;
          font-weight: 700;
          margin: 0;
        }
        .add-icon {
          width: 44px;
        }

        .field-label {
          font-size: 14px;
          color: #393939;
          margin-bottom: 12px;
          display: block;
        }

        .currency-badges {
          display: flex;
          gap: 10px;
        }
        .badge {
          display: flex;
          align-items: center;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid #e5e5e5;
        }
        .badge img {
          width: 14px;
          margin-right: 6px;
        }
        .badge.active {
          border-color: #00c087;
          background-color: #fdd8301c;
          border: 1px solid #fdd830;
        }
        .badge.disabled {
        }

        .wallet-display-section {
          margin-bottom: 28px;
        }
        .wallet-address {
          font-size: 15px;
          font-weight: 600;
          word-break: break-all;
          line-height: 1.4;
          color: #111;
        }
        .network-info {
          font-size: 12px;
          color: #8a8a8a;
          margin-top: 4px;
        }

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
          font-size: 14px;
          font-weight: 400;
          font-family: "Mona Sans", sans-serif;
          background-color: #ffffff;
          padding: 8px 0;
          color: #111;
        }
        .amount-input::placeholder {
          color: #d1d1d1;
        }
        .usdt-suffix {
          display: flex;
          align-items: center;
          font-weight: 700;
          font-size: 14px;
        }
        .usdt-suffix img {
          width: 16px;
          margin-right: 6px;
        }

        .input-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          font-size: 13px;
        }
        .available-text {
          color: #3573e6;
          font-weight: normal;
          display: flex;
          align-items: center;
          font-size: 14px;
        }
        .mini-icon {
          width: 13px;
          margin-left: 4px;
        }
        .fee-text {
          color: #8a8a8a;
        }

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
          background-color: #000000;
          color: #ffffff;
        }
        .address-rw {
          display: flex;
          gap: 10px;
        }
        .address-rw .wallet-address {
          font-size: 14px;
        }
        .badge.active img.y-icon {
          display: block;
        }

        .badge img.y-icon {
          display: none;
          position: absolute;
          right: 0;
          bottom: -2px;
          margin: 0;
        }

        .badge {
          position: relative;
        }
        .address-rw .left {
          width: 90%;
        }

        .network-info {
          display: flex;
          width: 100%;
          justify-content: space-between;
          border-top: 1px solid #e3e3e3;
          padding-top: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e3e3e3;
          margin-bottom: 15px;
          margin-top: 0px;
        }

        .network-info .right {
          display: flex;
          align-items: center;
        }

        .network-info .right img.icon {
          max-width: 22px;
          margin-right: 3px;
        }

        .network-info .left {
          font-size: 14px;
          color: #393939;
        }

        .select-address-header {
          border-top: 0px solid #e3e3e3;
          border-bottom: 1px solid #e3e3e3;
          padding: 0px 0 12px;
          margin-bottom: 16px;
        }

        .content-row.currency-row {
          margin-bottom: 20px;
        }

        .add-wallet > a {
          display: flex;
          justify-content: center;
          color: #000;
          border: 2px dotted #80e9bb;
          padding: 18px 0;
          border-radius: 5px;
          margin-top: 20px;
          font-weight: 600;
          gap: 4px;
          max-width: 90%;
          margin: 10px auto 10px;
        }
      `}</style>
    </div>
  );
}
