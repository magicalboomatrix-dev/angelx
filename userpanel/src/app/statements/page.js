'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '../components/footer';

function getTxTitle(tx) {
  if (tx.type === 'DEPOSIT') return 'Deposit';
  if (tx.type === 'SELL') return tx.status === 'FAILED' || tx.status === 'REJECTED' ? 'Exchange failed' : 'Exchange';
  if (tx.type === 'WITHDRAW') return 'Withdrawal';
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

export default function StatementsPage() {
  const router = useRouter();
  const [ledger, setLedger] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.replace('/login');
      return;
    }

    async function fetchData() {
      try {
        const [stmtRes, walletRes] = await Promise.all([
          fetch('/api/statements', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/wallet', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (stmtRes.status === 401 || walletRes.status === 401) {
          router.replace('/login');
          return;
        }

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
    <div className="app-container page-wrappers" style={{ backgroundColor: '#fff' }}>
      <main className="content-wrapper">
        <div className="brdc">
          <div className="back-btn-container">
            <Link href="/home" className="back-link" style={{ position: 'relative', zIndex: '999' }}>
              <img src="/images/back-btn.png" alt="back" style={{ marginLeft: '0' }} />
            </Link>
          </div>
          <h3 className="header-title">Statements</h3>
        </div>

        <section className="section-1" style={{ background: '#fff' }}>
          <div className="history-list container-inner">
            <div className="wallet-card">
              <div>
                <div className="wallet-text">Wallet total amount</div>
                <div className="wallet-amount">${loading ? '...' : (wallet?.usdtAvailable ?? 0)}</div>
              </div>
              <div className="wallet-icon"></div>
            </div>

            {loading && <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>Loading...</div>}

            {!loading && ledger.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#999', fontSize: '14px' }}>No transactions found.</div>
            )}

            {!loading && grouped.map(([date, txns]) => (
              <React.Fragment key={date}>
                <div className="date">{date}</div>
                {txns.map((tx) => {
                  const credit = isCredit(tx);
                  const time = new Date(tx.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  });

                  return (
                    <Link href={`/statement-details?id=${tx.id}&type=${tx.type}`} className="transaction" key={`${tx.type}-${tx.id}`}>
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
                    </Link>
                  );
                })}
              </React.Fragment>
            ))}
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

        .app-container {
          background-color: #f8f9fa;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .back-link img {
          width: 18px;
          margin-left: 12px;
        }

        .history-list {
          height: 100vh;
          background: #f8f9fa;
        }

        .history-list .wallet-card {
          background: linear-gradient(90deg, #e7f3e7, #e0efe0);
          border-radius: 12px;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0 15px;
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
          content: '';
          position: absolute;
          width: 30px;
          height: 20px;
          background: #9be37c;
          top: -8px;
          right: -5px;
          border-radius: 4px;
        }

        .history-list .date {
          margin: 15px 15px 0;
          font-size: 13px;
          color: #777;
        }

        .history-list .transaction {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #eee;
          color: inherit;
          text-decoration: none;
          margin: 0 15px;
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
          color: #22c55e;
        }

        .history-list .red {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
}
