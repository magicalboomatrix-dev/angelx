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
    
            <div className="history-list">
              
                  <div className="card-div deposit-card">
					  <div className="card">
					   <div className="card-header">
						  <div className="header-left">
							 <div className="icon-wrapper">
								<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" className="jsx-ae303611235dc644">
								   <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" className="jsx-ae303611235dc644"></path>
								   <polyline points="14 2 14 8 20 8" className="jsx-ae303611235dc644"></polyline>
								   <line x1="16" y1="13" x2="8" y2="13" className="jsx-ae303611235dc644"></line>
								   <line x1="16" y1="17" x2="8" y2="17" className="jsx-ae303611235dc644"></line>
								</svg>
							 </div>
							 <span className="id-text">CD84***0088</span>
						  </div>
						  <span className="status-text red">Failed</span>
					   </div>
					   <div className="divider"></div>
					   <div className="info-list">
						  <div className="info-bx-grs">
							 <div className="info-row">
								<span className="label">Network</span>
								<div className="value"><img alt="network" width="20" height="20" className="jsx-ae303611235dc644" src="/images/bnb.png"><span className="jsx-ae303611235dc644">BEP20-USDT</span></div>
							 </div>
							 <div className="info-row info-row-mid">
							 <span className="label">Trade detail</span>
							 <div className="value df-value">
								<div className="badge-left">
								<div className="badge-usdt">₮</div>
								<span className="amount-bold"> 120</span>
								</div>
								<div className="badge-mid">
									<img src="/images/trade-icon.png" alt="icon" />
								</div>
								<div className="badge-ri">
									<span>₹</span> 1210
								</div>
							 </div>
							 </div>
							 <div className="info-row"><span className="jsx-ae303611235dc644 label">Create time</span><span className="jsx-ae303611235dc644 value">4/13/2026, 3:23:55 PM</span></div>
						  </div>
						  
					   </div>
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
      `}</style>
    </div>
  );
}
