"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../components/footer";
import { useRouter, useSearchParams } from "next/navigation";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function exchangeDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const txId = searchParams.get("id");

  const [tx, setTx] = useState(null);
  const [bank, setBank] = useState(null);
  const [rate, setRate] = useState(102);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) { router.replace("/login"); return; }
    if (!txId) { router.replace("/exchange-list"); return; }

    async function fetchData() {
      try {
        const [histRes, banksRes, limitsRes] = await Promise.all([
          fetch("/api/history", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/bank-card", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/limits"),
        ]);

        if (histRes.status === 401 || banksRes.status === 401) {
          router.replace("/login");
          return;
        }

        const histData = histRes.ok ? await histRes.json() : {};
        const banksData = banksRes.ok ? await banksRes.json() : {};
        const limitsData = limitsRes.ok ? await limitsRes.json() : {};

        const found = (histData.history || []).find(
          (t) => String(t.id) === String(txId)
        );
        setTx(found || null);

        if (found && found.address) {
          const matchedBank = (banksData.banks || []).find(
            (b) => b.accountNo === found.address
          );
          setBank(matchedBank || null);
        }

        if (limitsData.rate) setRate(limitsData.rate);
      } catch (err) {
        console.error("Failed to fetch exchange detail:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router, txId]);

  const status = tx?.status?.toUpperCase() || "";
  const isPending = status === "PENDING";
  const isSuccess = status === "SUCCESS";
  const isFailed = status === "FAILED" || status === "REJECTED";

  // Step circles: submitted, processing, final
  const step1Class = "success";                                      // always submitted
  const step2Class = isPending ? "pending" : isSuccess ? "success" : "success";
  const step3Class = isPending ? "pending" : isSuccess ? "success" : "failed";

  const step1Icon = "✓";
  const step2Icon = isPending ? "…" : "✓";
  const step3Icon = isPending ? "…" : isSuccess ? "✓" : "✕";

  const finalLabel = isPending ? "Pending" : isSuccess ? "Completed" : (tx?.status ? tx.status.charAt(0).toUpperCase() + tx.status.slice(1).toLowerCase() : "");

  const inrAmount = tx ? Math.round(tx.amount * rate) : 0;

  return (
    <div className="app-container page-wrappers exchange-detail-page"  style={{backgroundColor:'#fff'}}>
      <main className="content-wrapper">
        <div className="brdc">
          <div className="back-btn-container">
            <Link href="/exchange-list" className="back-link" style={{position: 'relative',zIndex: '999'}}>
          <img src="/images/back-btn.png" alt="back" style={{marginLeft: '0'}} />
        </Link>
          </div>
          <h3 className="header-title">Exchange Detail</h3>
        </div>

        <section className="section-1" style={{ background: "#fff" }}>
    
            <div className="history-list">

              {loading && (
                <div className="empty-state">
                  <p style={{ color: "#999", fontSize: "14px" }}>Loading...</p>
                </div>
              )}

              {!loading && !tx && (
                <div className="empty-state">
                  <p style={{ color: "#999", fontSize: "14px" }}>Transaction not found.</p>
                </div>
              )}

              {!loading && tx && (
<div className="containerinner">
    
    <div className="amount">
        <p>You will receive</p>
        <h1>₹{inrAmount.toLocaleString("en-IN")}</h1>
    </div>

    <div className="status-line">
        <div className="status">
            <div className={`circle ${step1Class}`}>{step1Icon}</div>
            <div className="status-label">Submitted</div>
            <div className="status-time">{formatDate(tx.createdAt)}</div>
        </div>

        <div className="status">
            <div className={`circle ${step2Class}`}>{step2Icon}</div>
        </div>

        <div className="status">
            <div className={`circle ${step3Class}`}>{step3Icon}</div>
            <div className="status-label">{finalLabel}</div>
            <div className="status-time">{tx.reviewedAt ? formatDate(tx.reviewedAt) : ""}</div>
        </div>
    </div>

    {tx.network === "BANK" && (
    <div className="section">
        <h3>Payee information</h3>

        <div className="row">
            <div className="label">Account No</div>
            <div className="value">{tx.address || "—"}</div>
        </div>

        <div className="row">
            <div className="label">IFSC</div>
            <div className="value">{bank?.ifsc || "—"}</div>
        </div>

        <div className="row">
            <div className="label">Payee Name</div>
            <div className="value">{bank?.payeeName || "—"}</div>
        </div>
    </div>
    )}

    <div className="section">
        <h3>Trade information</h3>

        <div className="row">
            <div className="label">Trade no</div>
            <div className="value">{tx.referenceId}</div>
        </div>

        <div className="row">
            <div className="label">Trade detail</div>
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

        <div className="row">
            <div className="label">Remark</div>
            <div className="value">{tx.reviewNote || tx.description || "—"}</div>
        </div>
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
        font-size: 32px;
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

    .pending {
        background: #fb8c00;
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
      `}</style>
    </div>
  );
}
