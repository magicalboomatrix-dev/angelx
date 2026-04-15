"use client";
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../components/footer";
import { useRouter, useSearchParams } from "next/navigation";

function getTxTitle(tx) {
  if (tx?.type === "DEPOSIT") return "Deposit";
  if (tx?.type === "SELL") return tx?.status === "FAILED" || tx?.status === "REJECTED" ? "Exchange failed" : "Exchange";
  if (tx?.type === "WITHDRAW") return "Withdrawal";
  return tx?.type || "Statement";
}

function isCredit(tx) {
  if (tx?.type === "DEPOSIT" && tx?.status === "SUCCESS") return true;
  if ((tx?.type === "SELL" || tx?.type === "WITHDRAW") && (tx?.status === "FAILED" || tx?.status === "REJECTED")) return true;
  return false;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function StatementDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statement, setStatement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/login");
      return;
    }

    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      setLoading(false);
      return;
    }

    async function fetchDetail() {
      try {
        const res = await fetch("/api/history", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        const data = res.ok ? await res.json() : {};
        const match = (data.history || []).find(
          (item) => String(item.id) === String(id) && item.type === type
        );
        setStatement(match || null);
      } catch (err) {
        console.error("Failed to fetch statement detail:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [router, searchParams]);

  const credit = isCredit(statement);

  return (
    <div className="app-container page-wrappers" style={{ backgroundColor: "#fff" }}>
      <main className="content-wrapper">
        <div className="brdc">
          <div className="back-btn-container">
            <Link href="/statements" className="back-link" style={{ position: "relative", zIndex: "999" }}>
              <img src="/images/back-btn.png" alt="back" style={{ marginLeft: "0" }} />
            </Link>
          </div>
          <h3 className="header-title">Statement Detail</h3>
        </div>

        <section className="section-1" style={{ background: "#fff" }}>
          <div className="detail-wrap">
            {loading ? (
              <div className="empty-box">Loading...</div>
            ) : !statement ? (
              <div className="empty-box">Statement not found.</div>
            ) : (
              <>
                <div className="amount-box">
                  <p>{getTxTitle(statement)}</p>
                  <h1 className={credit ? "green" : "red"}>{credit ? "+" : "-"}${statement.amount}</h1>
                </div>

                <div className="detail-card">
                  <h4>Transaction Information</h4>
                  <div className="detail-row">
                    <span className="label">Type</span>
                    <span className="value">{getTxTitle(statement)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Reference ID</span>
                    <span className="value text-wrap">{statement.referenceId || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Status</span>
                    <span className="value">{statement.status}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Created At</span>
                    <span className="value">{formatDate(statement.createdAt)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Reviewed At</span>
                    <span className="value">{formatDate(statement.reviewedAt)}</span>
                  </div>
                </div>

                <div className="detail-card">
                  <h4>Additional Details</h4>
                  <div className="detail-row">
                    <span className="label">Network</span>
                    <span className="value">{statement.network || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Address / Account</span>
                    <span className="value text-wrap">{statement.address || "—"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Admin Remark</span>
                    <span className="value text-wrap">{statement.adminRemark || "—"}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <Footer />
      </main>

      <style jsx global>{`
        .brdc {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background-color: #fff;
        }

        .back-link img {
          width: 18px;
          margin-left: 12px;
        }

        .detail-wrap {
          min-height: 100vh;
          background: #f8f9fa;
          padding: 12px 0 24px;
        }

        .empty-box {
          padding: 40px 20px;
          text-align: center;
          color: #888;
          font-size: 14px;
        }

        .amount-box {
          background: #2a2a2a;
          width: 93%;
          margin: 0 auto 15px;
          border-radius: 10px;
          color: #fff;
          padding: 18px 14px;
          text-align: center;
        }

        .amount-box p {
          margin: 0 0 8px;
          color: #b5b5b5;
          font-weight: 600;
        }

        .amount-box h1 {
          margin: 0;
          font-size: 30px;
          line-height: 40px;
        }

        .detail-card {
          width: 93%;
          margin: 0 auto 12px;
          background: #fff;
          padding: 18px 14px;
          border-radius: 10px;
        }

        .detail-card h4 {
          margin: 0 0 12px;
          font-size: 16px;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin: 10px 0;
          font-size: 14px;
        }

        .label {
          color: #666;
        }

        .value {
          color: #000;
          text-align: right;
          font-weight: 500;
        }

        .text-wrap {
          max-width: 62%;
          word-break: break-word;
        }

        .green {
          color: #22c55e;
        }

        .red {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}

export default function StatementDetailsPage() {
  return (
    <Suspense fallback={<div style={{ padding: "40px 20px", textAlign: "center" }}>Loading...</div>}>
      <StatementDetailContent />
    </Suspense>
  );
}
