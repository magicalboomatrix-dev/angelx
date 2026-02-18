"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../components/footer";
import { useRouter } from "next/navigation";

export default function DemoPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        const res = await fetch("/api/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        setHistory(data.history || []);
      } catch (err) {
        console.error(err);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [router]);

  return (
    <div className="app-container">
      <main className="content-wrapper">
        <div className="brdc">
          <div className="back-btn-container">
            <Link href="/home">
              <img src="/images/back-btn.png" alt="Back" className="back-img" />
            </Link>
          </div>
          <h3 className="header-title">Deposit History</h3>
        </div>

        <section className="section-1">
          {loading ? (
            <div className="status-container">
               <p className="status-text">Loading...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <img src="/images/empty.jpg" alt="No History" className="empty-img" />
              <p className="status-text">No transactions found</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((tx, index) => {
                // Defensive check: if tx is null or undefined, skip rendering this item
                if (!tx) return null;

                // Force ID to string and handle cases where id might be missing
                const safeId = tx.id !== undefined && tx.id !== null ? String(tx.id) : "";
                
                // Masking logic
                const displayId = safeId.length > 6 
                  ? `${safeId.substring(0, 2)}****${safeId.slice(-4)}` 
                  : safeId || "ID Error";

                return (
                  <div key={tx.id || index} className="deposit-card">
                    <div className="card-top">
                      <div className="transaction-id">
                       <svg class="icon-doc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                            <polyline points="13 2 13 9 20 9"></polyline>
                        </svg>
                        {displayId}
                      </div>
                      <div className="status-tag">Pending</div>
                    </div>

                    <div className="info-well">
                      <div className="info-row">
                        <span className="label-text">Network</span>
                        <div className="value-text">
                          <img src="/images/tb-ic1.png" alt="TRC20" className="network-icon" />
                          USDT – TRC20
                        </div>
                      </div>
                      <div className="info-row">
                        <span className="label-text">Create time</span>
                        <div className="value-text">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="amount-row">
                      <span className="label-text">Amount</span>
                      <div className="total-amount">
                        <img src="/images/uic.png" alt="USDT" className="currency-icon" />
                        {tx.amount ?? "0.00"}
                      </div>
                    </div>
                  </div>
                );
              })}
              <p className="no-data-text">No more data</p>
            </div>
          )}
        </section>

        <Footer />
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wght@0,200..900;1,200..900&display=swap');

        .app-container {
          min-height: 100vh;
          background-color: #f7f7f7;
          font-family: 'Mona Sans', sans-serif;
          display: flex;
          justify-content: center;
        }

        .content-wrapper {
          width: 100%;
          max-width: 420px;
          background-color: #ffffff;
          display: flex;
          flex-direction: column;
        }

        .brdc {
          display: flex;
          align-items: center;
          padding: 18px 16px;
          background-color: #fff;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .back-btn-container {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
        }

        .back-img {
          width: 100%;
          object-fit: contain;
        }

        .header-title {
          flex-grow: 1;
          text-align: center;
          font-size: 18px;
          font-weight: 800;
          margin: 0;
          margin-right: 24px;
          color: #1a1a1a;
        }

        .section-1 {
          padding: 16px;
          background-color: #f7f7f7;
          flex-grow: 1;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .deposit-card {
          background: #ffffff;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      }
        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 14px;
          margin-bottom: 14px;
          border-bottom: 1px solid #f2f2f2;
        }

        .transaction-id {
          display: flex;
          align-items: center;
          font-size: 15px;
          font-weight: 600;
        }

        .icon-main {
          width: 16px;
          height: 16px;
          margin-right: 8px;
        }

        .status-tag {
          color: #ff6b6b;
          font-weight: 700;
          font-size: 14px;
        }

        .info-well {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .label-text {
          color: #999;
          font-size: 14px;
          font-weight: 500;
        }

        .value-text {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          display: flex;
          align-items: center;
        }

        .network-icon {
          width: 16px;
          height: 16px;
          margin-right: 6px;
        }

        .amount-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .total-amount {
          display: flex;
          align-items: center;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -0.5px;
        }

        .currency-icon {
          width: 20px;
          height: 20px;
          margin-right: 6px;
        }

        .status-container {
           padding: 40px 0;
           text-align: center;
        }

        .status-text {
          font-size: 14px;
          color: #666;
        }

        .empty-state {
          text-align: center;
          padding: 40px 0;
        }

        .empty-img {
          width: 150px;
          margin-bottom: 10px;
        }

        .no-data-text {
          text-align: center;
          color: #ccc;
          font-size: 14px;
          margin-top: 20px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}