"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Footer from "../components/footer";
import { useRouter } from "next/navigation";

function getTxTitle(tx) {
  if (tx.type === 'DEPOSIT') return 'Deposit';
  if (tx.type === 'SELL') return tx.status === 'FAILED' || tx.status === 'REJECTED' ? 'Exchange failed' : 'Exchange';
  if (tx.type === 'WITHDRAW') return 'Withdrawal';
  if (tx.type === 'BUY') return 'Buy';
  return tx.type;
}

function getTxIcon(tx) {
  if (tx.type === 'DEPOSIT') return '▣';
  return '⇄';
}

function isCredit(tx) {
  if (tx.type === 'DEPOSIT' && tx.status === 'SUCCESS') return true;
  if ((tx.type === 'SELL' || tx.type === 'WITHDRAW') && (tx.status === 'FAILED' || tx.status === 'REJECTED')) return true;
  return false;
}

function groupByDate(txns) {
  const groups = {};
  txns.forEach((tx) => {
    const d = new Date(tx.createdAt);
    const key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });
  return Object.entries(groups);
}

export default function exchangeListPage() {
  const router = useRouter();
  const [ledger, setLedger] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) { router.replace('/login'); return; }

    async function fetchData() {
      try {
        const [stmtRes, walletRes] = await Promise.all([
          fetch('/api/statements', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/wallet', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (stmtRes.status === 401 || walletRes.status === 401) { router.replace('/login'); return; }
        const stmtData = stmtRes.ok ? await stmtRes.json() : {};
        const walletData = walletRes.ok ? await walletRes.json() : {};
        setLedger(stmtData.statements || []);
        setWallet(walletData);
      } catch (err) {
        console.error('Failed to fetch statements:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const grouped = groupByDate(ledger);

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
<<<<<<< HEAD

              <div className="wallet-card">
                <div>
                  <div className="wallet-text">Wallet total amount</div>
                  <div className="wallet-amount">${loading ? '...' : (wallet?.usdtAvailable ?? 0)}</div>
                </div>
                <div className="wallet-icon"></div>
              </div>

              {loading && <div style={{padding:'20px',textAlign:'center',color:'#999',fontSize:'14px'}}>Loading...</div>}

              {!loading && ledger.length === 0 && (
                <div style={{padding:'30px',textAlign:'center',color:'#999',fontSize:'14px'}}>No transactions found.</div>
              )}

              {!loading && grouped.map(([date, txns]) => (
                <React.Fragment key={date}>
                  <div className="date">{date}</div>
                  {txns.map((tx) => {
                    const credit = isCredit(tx);
                    const time = new Date(tx.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
                    return (
                      <div className="transaction" key={tx.id}>
                        <div className="left">
                          <div className="icon">{getTxIcon(tx)}</div>
                          <div>
                            <div className="title">{getTxTitle(tx)}</div>
                            <div className="time">{time}</div>
                          </div>
                        </div>
                        <div className="right">
                          <div className={`amount ${credit ? 'green' : 'red'}`}>{credit ? '+' : '-'}${tx.amount}</div>
                          <div className="balance">Status: {tx.status.charAt(0) + tx.status.slice(1).toLowerCase()}</div>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}

=======
              <div className="contentinfo">
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
>>>>>>> e123a134e2db41cb5905d1e70fd31da23c70f18f
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

        .history-list .contentinfo {
    background: #fff;
    padding: 15px;
}

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
	
	
  .history-list .wallet-card {
    background: linear-gradient(90deg, #e7f3e7, #e0efe0);
    border-radius: 12px;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .history-list .wallet-text {
    font-size: 14px;
    color: #333;
  }

  .history-list .wallet-amount {
    font-size: 26px;
    font-weight: bold;
    margin-top: 5px;
  }

  .history-list .wallet-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(180deg, #6ea8ff, #3f6fd9);
    border-radius: 10px;
    position: relative;
  }

  .history-list .wallet-icon::before {
    content: "";
    position: absolute;
    width: 30px;
    height: 20px;
    background: #9be37c;
    top: -8px;
    right: -5px;
    border-radius: 4px;
  }

  .history-list .date {
    margin-top: 15px;
    font-size: 13px;
    color: #777;
  }

  .history-list .transaction {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #eee;
  }

  .history-list .left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .history-list .icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #f1f1f1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }

  .history-list .title {
    font-size: 14px;
    font-weight: 600;
  }

  .history-list .time {
    font-size: 12px;
    color: #777;
  }

  .history-list .right {
    text-align: right;
  }

  .history-list .amount {
    font-size: 14px;
    font-weight: bold;
  }

  .history-list .balance {
    font-size: 12px;
    color: #777;
  }

  .history-list .green {
    color: #2e7d32;
  }

  .history-list .red {
    color: #999;
  }
      `}</style>
    </div>
  );
}
