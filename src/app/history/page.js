"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../components/footer";
import { useRouter } from "next/navigation";

export default function DemoPage() {
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const networkIcons = {
    TRC20: "/images/tb-ic1.png",
    BEP20: "/images/bnb.png",
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

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
    <div className="app-container" style={{backgroundColor:'#fff'}}>
      <main className="content-wrapper">
        <div className="brdc">
          <div className="back-btn-container">
            <Link href="/home" className="back-link" style={{position: 'relative',zIndex: '999'}}>
          <img src="/images/back-btn.png" alt="back" />
        </Link>
          </div>
          <h3 className="header-title">Transaction History</h3>
        </div>

        <section className="section-1" style={{ background: "#fff" }}>
          {loading ? (
            <div className="status-container">
              <p className="status-text">Loading...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <img
                src="/images/empty.jpg"
                alt="No History"
                className="empty-img"
              />
              <p className="status-text">No transactions found</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((tx, index) => {
                if (!tx) return null;

                const safeId = tx.depositId || String(tx.id || "");
                const displayId =
                  safeId.length > 10
                    ? `${safeId.substring(0, 4)}****${safeId.slice(-4)}`
                    : safeId || "ID Error";

                const currentIcon =
                  networkIcons[tx.network] || "/images/default.png";

                return (
                  <div className="card-div deposit-card" key={tx.id || index}>
                    <div className="card">
                      <div className="card-header">
                        <div className="header-left">
                          <div className="icon-wrapper">
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#444"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                          </div>
                          <span className="id-text">{displayId}</span>
                        </div>
                        {/* Dynamic Status */}
                        <span
                          className="status-text"
                          style={{
                            color: tx.status === "PENDING" ? "#f59e0b" : "#555",
                          }}
                        >
                          {tx.status === "PENDING" ? "Pending" : "Finish"}
                        </span>
                      </div>
                      <div className="divider"></div>
                      <div className="info-list">
                        <div className="info-row">
                          <span className="label">Network</span>
                          <div className="value">
                            <img
                              src={
                                networkIcons[
                                  tx.network === "BANK" ? "TRC20" : tx.network
                                ] || "/images/default.png"
                              }
                              alt="network"
                              width="20"
                              height="20"
                            />

                            <span>
                              {tx.network === "BANK" ? "TRC20" : tx.network}-
                              {tx.currency}
                            </span>
                          </div>
                        </div>
                        <div className="info-row">
                          <span className="label">Trade detail</span>
                          <div className="value">
                            <div className="badge-usdt">₮</div>
                            <span className="amount-bold">
                              {" "}
                              {tx.amount ?? "0.00"}
                            </span>
                          </div>
                        </div>
                        <div className="info-row">
                          <span className="label">Create time</span>
                          <span className="value">
                            {tx.createdAt
                              ? new Date(tx.createdAt).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
             
            </div>
          )}
        </section>

        <Footer />
      </main>

      <style jsx global>{`
.brdc{
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: #fff;
}
      .status-container{
      
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 0;
      }
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 0;
      }
      .app-container{
        background-color: #f8f9fa;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
        .card-div {
          font-family: "Inter", sans-serif;
          background-color: #f8f9fa;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 10px 20px;
          -webkit-font-smoothing: antialiased;
        }

        .card {
          width: 100%;
          max-width: 400px;
          background-color: #ffffff;
          border-radius: 8px;
          padding: 16px;
          border: 1px solid #f0f0f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-wrapper {
          background-color: #f2f2f2;
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .id-text {
          color: #555;
          font-size: 1rem;
          font-weight: 500;
        }
.back-link img {
          width: 18px;
          margin-left: 12px;
        
        }
        .status-text {
          color: #555;
          font-size: 1rem;
          font-weight: 700;
        }

        .divider {
          height: 1px;
          background-color: #f3f4f6;
          width: 100%;
          margin-bottom: 8px;
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.95rem;
        }

        .label {
          color: #9e9e9e;
        }

        .value {
          color: #333;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .badge-trx {
          width: 20px;
          height: 20px;
          background-color: #ef0027;
          border-radius: 50%;
          color: white;
          font-size: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .badge-usdt {
          width: 20px;
          height: 20px;
          background-color: #26a17b;
          border-radius: 50%;
          color: white;
          font-size: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .amount-bold {
          color: #000;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
