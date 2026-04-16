"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../components/footer";
import { useRouter } from "next/navigation";

function formatDisplayDate(dateValue) {
  return new Date(dateValue).toLocaleDateString("en-GB", {
    timeZone: "Asia/Calcutta",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildEmptyRewards() {
  return Array.from({ length: 30 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);

    return {
      date: date.toISOString().slice(0, 10),
      amount: 0,
    };
  });
}

export default function exchangeListPage() {
  const router = useRouter();
  const [rewards, setRewards] = useState(buildEmptyRewards);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    let cancelled = false;

    async function loadRewards() {
      try {
        const response = await fetch(`/api/auth/referral-rewards?_=${Date.now()}`, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        const data = response.ok ? await response.json() : { rewards: [] };
        if (!cancelled) {
          setRewards(Array.isArray(data.rewards) ? data.rewards : []);
        }
      } catch {
        if (!cancelled) {
          setRewards(buildEmptyRewards());
        }
      }
    }

    loadRewards();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="app-container page-wrappers "  style={{backgroundColor:'#fff'}}>
      <main className="content-wrapper">
        <div className="brdc">
          <div className="back-btn-container">
            <Link href="/home" className="back-link" style={{position: 'relative',zIndex: '999'}}>
          <img src="/images/back-btn.png" alt="back" style={{marginLeft: '0'}} />
        </Link>
          </div>
          <h3 className="header-title">Referrals reward</h3>
        </div>

        <section className="section-1" style={{ background: "#fff" }}>
    
            <div className="history-list container-inn">
              <div className="headertop">
        <div>Date</div>
        <div className="reward">Reward <span className="coin"><img src="/images/payx.jpg" /></span></div>
    </div>

    {rewards.map((reward) => (
      <div className="row" key={reward.date}>
        <div>{formatDisplayDate(reward.date)}</div>
        <div className="amount">{reward.amount}</div>
      </div>
    ))}
            
                
             
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

    .container-inn .headertop {
        display: flex;
        justify-content: space-between;
        padding: 12px 16px;
        font-weight: bold;
        font-size: 14px;
        background: #f5f6f8;
        color: #333;
    }

    .container-inn .headertop .reward {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .container-inn .coin {
    width: 18px;
    height: 18px;
    background: gold;
    border-radius: 50%;
    display: inline-block;
}
			 .container-inn .coin img {
    max-width: 100%;
}
    .container-inn .row {
        display: flex;
        justify-content: space-between;
        padding: 16px;
        font-size: 14px;
        color: #333;
    }

    .container-inn .row:nth-child(odd) {
        background: #f0f1f3;
    }

    .container-inn .row:nth-child(even) {
        background: #e6e7ea;
    }

    .container-inn .amount {
        color: #00b050;
        font-weight: 500;
    }
      `}</style>
    </div>
  );
}
