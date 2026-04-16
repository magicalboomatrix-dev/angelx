"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../components/footer";
import { useRouter } from "next/navigation";
import { isTokenExpired, refreshToken } from "../utils/auth";
import { useToast } from "../components/ToastProvider";


function formatTxnId(referenceId) {
  if (!referenceId) return "";
  // Remove any existing prefix for safety
  let clean = referenceId.replace(/^CD20/i, "");
  // Show as CD20****1234 (last 4 digits)
  if (clean.length <= 4) return `CD20****${clean}`;
  return `CD20****${clean.slice(-4)}`;
}

function getNetworkDisplay(tx) {
  if (!tx?.network) return { label: "USDT", icon: "/images/uic.png" };
  const n = tx.network.toUpperCase();
  if (n === "BANK") return { label: "BANK Transfer", icon: "/images/add-u-icon.png" };
  if (n.includes("TRC20")) return { label: "TRC20-USDT", icon: "/images/trc20icon.png" };
  if (n.includes("BEP20") || n.includes("BSC")) return { label: "BEP20-USDT", icon: "/images/bnb.png" };
  if (n.includes("ERC20")) return { label: "ERC20-USDT", icon: "/images/uic.png" };
  return { label: tx.network, icon: "/images/uic.png" };
}

function getStatusClass(status) {
  if (!status) return "";
  const s = status.toUpperCase();
  if (s === "SUCCESS") return "green";
  if (s === "FAILED" || s === "REJECTED") return "red";
  if (s === "PENDING") return "orange";
  return "";
}

export default function exchangeListPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [history, setHistory] = useState([]);
  const [rates, setRates] = useState({ defaultRate: 102, cmdRate: 102, impsRate: 102 });
  const [loading, setLoading] = useState(true);

  const getTradeRate = (paymentMethod) => {
    const normalizedMethod = String(paymentMethod || "").toUpperCase();
    if (normalizedMethod === "CMD") return rates.cmdRate;
    if (normalizedMethod === "IMPS") return rates.impsRate;
    return rates.defaultRate;
  };

  useEffect(() => {
    let token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.replace("/login"); return; }

    async function checkAndFetch() {
      try {
        if (isTokenExpired(token)) {
          try {
            token = await refreshToken();
          } catch {
            showToast("Session expired. Please login again.", "error");
            localStorage.removeItem("token");
            router.replace("/login");
            return;
          }
        }
        const [histRes, limitsRes] = await Promise.all([
          fetch("/api/history", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/limits"),
        ]);

        if (histRes.status === 401) {
          showToast("Session expired. Please login again.", "error");
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        const histData = histRes.ok ? await histRes.json() : { history: [] };
        const limitsData = limitsRes.ok ? await limitsRes.json() : {};

        const sellTxns = (histData.history || []).filter((tx) => tx.type === "SELL");
        setHistory(sellTxns);
        setRates({
          defaultRate: limitsData.rate || 102,
          cmdRate: limitsData.cmdRate || limitsData.rate || 102,
          impsRate: limitsData.impsRate || limitsData.rate || 102,
        });
      } catch (err) {
        showToast("Session expired. Please login again.", "error");
        localStorage.removeItem("token");
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAndFetch();
  }, [router]);

  return (
    <div className="app-container page-wrappers"  style={{backgroundColor:'#fff'}}>
      <main className="content-wrapper">
        <div className="brdc">
          <div className="back-btn-container">
            <Link href="/sell-usdt" className="back-link" style={{position: 'relative',zIndex: '999'}}>
          <img src="/images/back-btn.png" alt="back" style={{marginLeft: '0'}} />
        </Link>
          </div>
          <h3 className="header-title">Exchange History</h3>
        </div>

        <section className="section-1" style={{ background: "#fff" }}>
            <div className="history-list">

              {loading && (
                <div className="empty-state">
                  <p style={{ color: "#999", fontSize: "14px" }}>Loading...</p>
                </div>
              )}

              {!loading && history.length === 0 && (
                <div className="empty-state">
                  <p style={{ color: "#999", fontSize: "14px" }}>No exchange history found.</p>
                </div>
              )}

              {!loading && history.map((tx) => {
                const net = getNetworkDisplay(tx);
                const inrAmount = Math.round(tx.amount * getTradeRate(tx.paymentMethod));
                const statusClass = getStatusClass(tx.status);
                const statusLabel = tx.status
                  ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1).toLowerCase()
                  : "";
                const createdAt = tx.createdAt
                  ? new Date(tx.createdAt).toLocaleString()
                  : "";

                return (
                  <Link key={tx.id} href={`/exchange-detail?id=${tx.id}`} className="card-div deposit-card" style={{ textDecoration: 'none' }}>
                    <div className="card">
                      <div className="card-header">
                        <div className="header-left">
                          <div className="icon-wrapper">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                              <line x1="16" y1="13" x2="8" y2="13"></line>
                              <line x1="16" y1="17" x2="8" y2="17"></line>
                            </svg>
                          </div>
                          <span className="id-text">{formatTxnId(tx.referenceId)}</span>
                        </div>
                        <span className={`status-text ${statusClass}`}>{statusLabel}</span>
                      </div>
                      <div className="divider"></div>
                      <div className="info-list">
                        <div className="info-bx-grs">
                          {/* <div className="info-row">
                            <span className="label">Network</span>
                            <div className="value">
                              <img alt="network" width="20" height="20" src={net.icon} />
                              <span>{net.label}</span>
                            </div>
                          </div> */}
                          {tx.paymentMethod && (
                            <div className="info-row">
                              <span className="label">Payment Method</span>
                              <span className="value">{tx.paymentMethod}</span>
                            </div>
                          )}
                          <div className="info-row info-row-mid">
                            <span className="label">Trade detail</span>
                            <div className="value df-value">
                              <div className="badge-left">
                                <div className="badge-usdt">₮</div>
                                <span className="amount-bold"> {tx.amount}</span>
                              </div>
                              <div className="badge-mid">
                                <img src="/images/trade-icon.jpg" alt="icon" />
                              </div>
                              <div className="badge-ri">
                                <span>₹</span>{inrAmount.toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>
                          <div className="info-row">
                            <span className="label">Create time</span>
                            <span className="value">{createdAt}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

            </div>
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
          font-size: 13px;
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

        .history-list {
        height: 100vh;
    background: #f8f9fa;
        }

        .history-list {}

.history-list .card {
    padding: 10px;
}

.history-list .card span.id-text {
    font-weight: 700;
    color: #111;
    font-size: 13px;
}

.history-list .card span.status-text {
    font-size: 13px;
}

.info-bx-gr {
    background: #eeeef1;
    padding: 2px 14px;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
}

.info-bx-gr .info-row {
    margin: 5px 0;
}

.info-bx-gr .info-row span.label {
    font-size: 13px;
    color: #777777;
}

.info-bx-gr .info-row  .value {
    color: #111;
    font-size: 13px;
}
.divider {
    background-color: #e1e1e1;
    }

.status-text.red { color: #e53935; }
.status-text.green { color: #43a047; }
.status-text.orange { color: #fb8c00; }
      `}</style>
    </div>
  );
}
