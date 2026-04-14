"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../components/footer";
import { useRouter } from "next/navigation";

export default function exchangeListPage() {
const [activeTab, setActiveTab] = useState("USDT");
  return (
    <div className="app-container page-wrappers "  style={{backgroundColor:'#fff'}}>
      <main className="content-wrapper">
        <div className="brdc">
          <div className="back-btn-container">
            <Link href="/USDT-deposit" className="back-link" style={{position: 'relative',zIndex: '999'}}>
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
      {activeTab === "USDT" && (
        <div className="card">
          <div className="card-header">
            <div className="left">
              <span className="icon">📄</span>
              <span className="txid">XF20****7184</span>
            </div>
            <div className="status">Processing</div>
          </div>

          <div className="card-body">
            <div className="row">
              <span className="label">Network</span>
              <span className="value network">
                <span className="dot"></span> TRC20
              </span>
            </div>

            <div className="row">
              <span className="label">Create time</span>
              <span className="value">13 Apr 2026 23:28:28</span>
            </div>

            <div className="row">
              <span className="label">Amount</span>
              <span className="value amount">
                10 <span className="usdt">T</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "PAYX" && (
        <div className="card">
          <div className="card-header">
            <div className="left">
              <span className="icon">📄</span>
              <span className="txid">No PAYX Data</span>
            </div>
            <div className="status">-</div>
          </div>

          <div className="card-body">
            <div className="row">
              <span className="label">Info</span>
              <span className="value">No transactions found</span>
            </div>
          </div>
        </div>
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
	
	.tabs {
  display: flex;
  background: #e9eaee;
  border-radius: 20px;
  padding: 4px;
  width: fit-content;
}

.tab {
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  color: #777;
}

.tab.active {
  background: #fff;
  color: #000;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

/* Card */
.card {
  margin-top: 15px;
  background: #fff;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 16px;
}

.txid {
  font-weight: 600;
}

.status {
  color: #2ecc71;
  font-weight: 500;
}

/* Body */
.card-body {
  margin-top: 12px;
  background: #f7f8fa;
  border-radius: 8px;
  padding: 10px;
}

.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.label {
  color: #888;
  font-size: 13px;
}

.value {
  font-size: 13px;
  font-weight: 500;
}

/* Network */
.network {
  display: flex;
  align-items: center;
  gap: 5px;
}

.dot {
  width: 8px;
  height: 8px;
  background: red;
  border-radius: 50%;
}

/* Amount */
.amount {
  font-weight: bold;
}

.usdt {
  background: #e6f7f1;
  color: #00a86b;
  padding: 2px 6px;
  border-radius: 50%;
  font-size: 12px;
  margin-left: 4px;
}
      `}</style>
    </div>
  );
}
