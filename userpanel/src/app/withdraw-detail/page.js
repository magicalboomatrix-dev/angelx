"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../components/footer";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { isTokenExpired, refreshToken } from "../utils/auth";
import { useToast } from "../components/ToastProvider";

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + dt.toLocaleTimeString('en-GB', { hour12: false });
}

function getCurrencyIcon(currency) {
  return currency === 'PAYX' ? '/images/payx.jpg' : '/images/uic.png';
}

function getDisplayNetwork(detail) {
  return detail?.currency === 'PAYX' ? 'PAYX' : `${detail?.network || 'TRC20'}-${detail?.currency || 'USDT'}`;
}

function WithdrawDetailContent() {
  const router = useRouter();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }

    async function checkAndFetch() {
      // Try to load from sessionStorage (passed from submit)
      const stored = sessionStorage.getItem("withdraw_detail");
      if (stored) {
        try {
          setDetail(JSON.parse(stored));
          sessionStorage.removeItem("withdraw_detail");
          setLoading(false);
          return;
        } catch {}
      }

      // Otherwise fetch from API
      const id = searchParams.get("id");
      if (!id) { setLoading(false); return; }

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
          const match = data.history.find((h) => h.type === 'WITHDRAW' && String(h.id) === String(id));
          if (match) setDetail(match);
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
  }, [router, searchParams]);

  const isPending = detail?.status === 'PENDING';
  const isSuccess = detail?.status === 'SUCCESS' || detail?.status === 'APPROVED';
  const isRejected = detail?.status === 'REJECTED' || detail?.status === 'FAILED';

  return (
    <div className="app-container page-wrappers" style={{backgroundColor:'#fff'}}>
      <main className="content-wrapper">
        <div className="brdc">
          <div className="back-btn-container">
            <Link href="/withdraw-history" className="back-link" style={{position: 'relative',zIndex: '999'}}>
              <img src="/images/back-btn.png" alt="back" style={{marginLeft: '0'}} />
            </Link>
          </div>
          <h3 className="header-title">Withdraw Detail</h3>
        </div>

        <section className="section-1" style={{ background: "#fff" }}>
          <div className="history-list withdraw-detail-li">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>Loading...</div>
            ) : !detail ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>Withdrawal not found</div>
            ) : (
              <div className="containerinner">
                <div className="amount">
                  <p>You will receive</p>
                  <h1><span className="count">{detail.amount} </span> USDT</h1>
                </div>

                <div className="status-line">
                  <div className="status">
                    <div className="circle success">✓</div>
                    <div className="status-label">Submitted</div>
                    <div className="status-time">{formatDate(detail.createdAt)}</div>
                  </div>

                  <div className="status">
                    <div className={`circle ${isSuccess ? 'success' : isRejected ? 'failed' : 'success grey'}`}>
                      {isRejected ? '✗' : '✓'}
                    </div>
                    <div className="status-label">
                      {isSuccess ? 'Completed' : isRejected ? 'Rejected' : 'Processing'}
                    </div>
                    {(isSuccess || isRejected) && detail.reviewedAt && (
                      <div className="status-time">{formatDate(detail.reviewedAt)}</div>
                    )}
                  </div>
                </div>

                <div className="section">
                  <h3>Wallet information</h3>
                  <div className="row">
                    <div className="label">Network No</div>
                    <div className="value"><img className="icon" src={getCurrencyIcon(detail.currency || 'USDT')} />  {getDisplayNetwork(detail)}</div>
                  </div>
                  <div className="row">
                    <div className="label">Wallet address</div>
                    <div className="value">{detail.address || '—'}</div>
                  </div>
                </div>

                <div className="section">
                  <h3>Trade information</h3>
                  <div className="row">
                    <div className="label">Trade no</div>
                    <div className="value">{detail.referenceId}</div>
                  </div>
                  <div className="row">
                    <div className="label">Amount</div>
                    <div className="value">{detail.amount} USDT</div>
                  </div>
                  <div className="row">
                    <div className="label">Refund Fee</div>
                    <div className="value">1 USDT</div>
                  </div>
                  {detail.adminRemark && (
                    <div className="row">
                      <div className="label">Remark</div>
                      <div className="value">{detail.adminRemark}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
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

    .amount {
        text-align: center;
        margin-bottom: 20px;
    }

    .amount p {
        margin: 0;
        color: #666;
        font-size: 16px;
    }

    .amount h1 {
        margin: 5px 0 0;
        font-size: 18px;
        color: #000;
    }

    .status-line {
        display: flex;
        align-items: start;
        justify-content: space-between;
        margin: 20px 0;
        position: relative;
    }

    .status-line::before {
        content: "";
    position: absolute;
    top: 33px;
    left: 0;
    right: 0;
    height: 2px;
    background: #ddd;
    z-index: 0;
    width: 52%;
    margin: auto;
    }

    .status {
        text-align: center;
        z-index: 1;
    }

    .circle {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: auto;
        font-size: 14px;
        color: #fff;
    }

    .success {
        background: #28a745;
    }

    .failed {
        background: #dc3545;
    }

    .status-label {
        margin-top: 8px;
        font-size: 14px;
        color: #333;
    }

    .status-time {
        font-size: 12px;
        color: #777;
    }

    .section {
        margin-top: 20px;
    }

    .section h3 {
        margin-bottom: 10px;
        font-size: 16px;
        color: #333;
        border-bottom: 1px solid #eee;
        padding-bottom: 8px;
    }

    .row {
        display: flex;
        justify-content: space-between;
        margin: 10px 0;
        font-size: 14px;
    }

    .label {
        color: #666;
    }

    .value {
        color: #000;
        text-align: right;
    }

    .remark {
        margin-top: 10px;
        font-size: 14px;
        color: #333;
    }

    .containerinner {
    padding-top: 20px;
    margin-top: 10px;
}

.containerinner .amount {
    padding: 10px;
    background: #fff;
    margin-bottom: 10px;
}

.containerinner .amount p {
    font-weight: 600;
}

.containerinner .status-line {
    padding: 20px 30px;
    background: #fff;
    margin: 0 0 10px 0;
}

.containerinner .status {}

.containerinner .status .status-label {
    font-weight: 700;
}

.containerinner .section {
    padding: 20px 14px;
    background: #fff;
    margin: 0 0 10px 0;
}

h1.jsx-d9a2491c6fdf1711 {}

.amount h1 .count {
    font-size: 30px;
    line-height: 40px;
}

.amount h1 {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
}

.withdraw-detail-li {}

.withdraw-detail-li .amount {
    background: #2a2a2a;
    width: 93%;
    margin: auto;
    border-radius: 10px;
    margin-bottom: 15px;
    color: #fff;
    padding-top: 15px;
    padding-bottom: 15px;
}

.withdraw-detail-li .containerinner .amount p {
    color: #b5b5b5;
}

.withdraw-detail-li .containerinner .amount h1 {
    color: #e9e9e9;
}

.withdraw-detail-li .circle.success.grey {
    background: #b5b5b5;
}

.withdraw-detail-li img.icon {
    width: 20px;
}

.withdraw-detail-li .value {

    align-items: center;
}

.withdraw-detail-li .row {
    position: relative;
    width: 100%;
}
      `}</style>
    </div>
  );
}

export default function WithdrawDetailPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px 0' }}>Loading...</div>}>
      <WithdrawDetailContent />
    </Suspense>
  );
}
