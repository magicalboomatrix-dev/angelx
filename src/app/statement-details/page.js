"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../components/footer";
import { useRouter } from "next/navigation";

export default function exchangeListPage() {

  return (
    <div className="app-container page-wrappers "  style={{backgroundColor:'#fff'}}>
      <main className="content-wrapper">
        <div className="brdc">
          <div className="back-btn-container">
            <Link href="/USDT-deposit" className="back-link" style={{position: 'relative',zIndex: '999'}}>
          <img src="/images/back-btn.png" alt="back" style={{marginLeft: '0'}} />
        </Link>
          </div>
          <h3 className="header-title">Exchange History</h3>
        </div>

        <section className="section-1" style={{ background: "#fff" }}>
    
            <div className="history-list container-inner">
              
				   <div className="wallet-card">
    <div>
      <div className="wallet-text">Wallet total amount</div>
      <div className="wallet-amount">$10</div>
    </div>
    <div className="wallet-icon"></div>
  </div>

  <div className="date">11 April 2026</div>

  <div className="transaction">
    <div className="left">
      <div className="icon">⇄</div>
      <div>
        <div className="title">Exchange failed</div>
        <div className="time">11:36</div>
      </div>
    </div>
    <div className="right">
      <div className="amount green">+$10</div>
      <div className="balance">Balance: $10</div>
    </div>
  </div>

  <div className="date">10 April 2026</div>

  <div className="transaction">
    <div className="left">
      <div className="icon">⇄</div>
      <div>
        <div className="title">Exchange</div>
        <div class="time">22:54</div>
      </div>
    </div>
    <div className="right">
      <div className="amount red">-$10</div>
      <div className="balance">Balance: $0</div>
    </div>
  </div>

  <div className="transaction">
    <div className="left">
      <div className="icon">▣</div>
      <div>
        <div className="title">Deposit</div>
        <div className="time">22:47</div>
      </div>
    </div>
    <div className="right">
      <div className="amount green">+$10</div>
      <div className="balance">Balance: $10</div>
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
	
	
  .wallet-card {
    background: linear-gradient(90deg, #e7f3e7, #e0efe0);
    border-radius: 12px;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .wallet-text {
    font-size: 14px;
    color: #333;
  }

  .wallet-amount {
    font-size: 26px;
    font-weight: bold;
    margin-top: 5px;
  }

  .wallet-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(180deg, #6ea8ff, #3f6fd9);
    border-radius: 10px;
    position: relative;
  }

  .wallet-icon::before {
    content: "";
    position: absolute;
    width: 30px;
    height: 20px;
    background: #9be37c;
    top: -8px;
    right: -5px;
    border-radius: 4px;
  }

  .date {
    margin-top: 15px;
    font-size: 13px;
    color: #777;
  }

  .transaction {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #eee;
  }

  .left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #f1f1f1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }

  .title {
    font-size: 14px;
    font-weight: 600;
  }

  .time {
    font-size: 12px;
    color: #777;
  }

  .right {
    text-align: right;
  }

  .amount {
    font-size: 14px;
    font-weight: bold;
  }

  .balance {
    font-size: 12px;
    color: #777;
  }

  .green {
    color: #2e7d32;
  }

  .red {
    color: #999;
  }
      `}</style>
    </div>
  );
}
