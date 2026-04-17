"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../components/footer";
import { useRouter } from "next/navigation";
import { isTokenExpired, refreshToken } from "../utils/auth";
import { useToast } from "../components/ToastProvider";

function maskRef(ref) {
  if (!ref || ref.length < 8) return ref;
  return ref.slice(0, 4) + '****' + ref.slice(-4);
}

function formatDate(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + dt.toLocaleTimeString('en-GB', { hour12: false });
}

function statusLabel(s) {
  if (s === 'PENDING') return 'Processing';
  if (s === 'SUCCESS' || s === 'APPROVED') return 'Success';
  if (s === 'REJECTED') return 'Failed';
  return s;
}

function statusColor(s) {
  if (s === 'PENDING') return '#f59e0b';
  if (s === 'SUCCESS' || s === 'APPROVED') return '#2ecc71';
  if (s === 'REJECTED') return '#ef4444';
  return '#888';
}

function getCurrencyIcon(currency) {
  return currency === 'PAYX' ? '/images/payx.jpg' : '/images/uic.png';
}

function getDisplayNetwork(withdrawal) {
  return withdrawal.currency === 'PAYX' ? 'PAYX' : (withdrawal.network || 'TRC20');
}

export default function WithdrawHistoryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("USDT");
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let token = localStorage.getItem("token");
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
        const res = await fetch("/api/history", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();
        if (data?.history) {
          setWithdrawals(data.history.filter((h) => h.type === 'WITHDRAW'));
        }
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

  const filtered = withdrawals.filter((w) => (w.currency || 'USDT') === activeTab);
  return (
    <div className="app-container page-wrappers "  style={{backgroundColor:'#fff'}}>
      <main className="content-wrapper">
        <div className="brdc">
          <div className="back-btn-container">
            <Link href="/withdraw" className="back-link" style={{position: 'relative',zIndex: '999'}}>
          <img src="/images/back-btn.png" alt="back" style={{marginLeft: '0'}} />
        </Link>
          </div>
          <h3 className="header-title">Withdraw history</h3>
        </div>

        <section className="section-1" style={{ background: "#fff" }}>
    
            <div className="history-list container-inner">
            <div className="contentinfo">
              <div className="containersss">
      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === "PAYX" ? "active" : ""}`}
          onClick={() => setActiveTab("PAYX")}
        >
          PAYX
        </button>
        <button
          className={`tab ${activeTab === "USDT" ? "active" : ""}`}
          onClick={() => setActiveTab("USDT")}
        >
          USDT
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>No transactions found</div>
      ) : (
        filtered.map((w) => (
          <Link href={`/withdraw-detail?id=${w.id}&ref=${w.referenceId}`} className="card" key={w.id}>
            <div className="card-header">
              <div className="left">
                <span className="icon">📄</span>
                <span className="txid">{maskRef(w.referenceId)}</span>
              </div>
              <div className="status" style={{ color: statusColor(w.status) }}>{statusLabel(w.status)}</div>
            </div>

            <div className="card-body">
              <div className="row">
                <span className="label">Network</span>
                <span className="value network">
                  <span className="dot"><img className="icon" src={getCurrencyIcon(w.currency || 'USDT')}/></span> {getDisplayNetwork(w)}
                </span>
              </div>

              <div className="row">
                <span className="label">Create time</span>
                <span className="value">{formatDate(w.createdAt)}</span>
              </div>
            </div>

            <div className="rowend">
              <span className="label">Amount</span>
              <span className="value amount">
                {w.amount} <span className="usdt"><img className="icon" src={getCurrencyIcon(w.currency || 'USDT')}/></span>
              </span>
            </div>
          </Link>
        ))
      )}

      <p className="footer">No more data</p>
    </div>
				   
             
            </div>
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
	
	.history-list .containersss .tabs {
  display: flex;
  background: #e9eaee;
  border-radius: 20px;
  padding: 4px;
  width: fit-content;
}

.history-list .containersss .tab {
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  color: #777;
}

.history-list .containersss .tab.active {
  background: #fff;
  color: #000;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

/* Card */
.history-list .containersss .card {
  padding: 15px;
    background: #fff;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    display: block;
    max-width: 93%;
    margin: 15px auto 0;
}

.history-list .containersss .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-list .containersss .left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.history-list .containersss .icon {
  font-size: 16px;
}

.history-list .containersss .txid {
  font-weight: 600;
}

.history-list .containersss .status {
  color: #2ecc71;
  font-weight: 500;
}

/* Body */
.history-list .containersss .card-body {
  margin-top: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 10px;
}

.history-list .containersss .row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.history-list .containersss .label {
  color: #888;
  font-size: 13px;
}

.history-list .containersss .value {
  font-size: 13px;
  font-weight: 500;
}

/* Network */
.network {
  display: flex;
  align-items: center;
  gap: 5px;
}

.history-list .containersss .dot {
  width: 8px;
  height: 8px;
  background: red;
  border-radius: 50%;
}

/* Amount */
.history-list .containersss .amount {
  font-weight: bold;
}

.history-list .containersss .usdt {
  background: #e6f7f1;
  color: #00a86b;
  padding: 2px 6px;
  border-radius: 50%;
  font-size: 12px;
  margin-left: 4px;
}

.history-list .contentinfo {
    background: #f8f9fa;
    padding: 0px;
}

.history-list.container-inner {}

.history-list .containersss .tabs {
    background: #fff;
    width: 100%;
    border-radius: 0;
}

.history-list .containersss .tabs button.tab {
    color: #292929;
    font-weight: bold;
    font-size: 15px;
    border-radius: 0;
    box-shadow: none;
    border-bottom: 2px solid transparent;
}

.history-list .containersss .tabs button.tab.active {
    border-bottom: 2px solid #111;
}

.history-list .containersss  p.footer {
    text-align: center;
    padding-top: 16px;
}

.history-list .containersss img.icon {
    width: 100%;
    line-height: 0;
    display: block;
}

.history-list .containersss .dot {
    line-height: normal;
    position: relative;
    display: inline-block;
    width: 17px;
    height: 17px;
    background: transparent;
}

img.icon {}

.history-list .containersss  span.usdt {
    display: block;
    width: 17px;
    height: 17px;
    padding: 0;
}

.history-list .containersss span.usdt img.icon {
    display: inline-block;
}

.rowend {
    display: flex;
    justify-content: end;
    padding-top: 10px;
    gap: 10px;
}

.history-list .containersss .rowend .amount {
    gap: 0;
}

.history-list .containersss .rowend span.label {
    color: #333;
}
      `}</style>
    </div>
  );
}
