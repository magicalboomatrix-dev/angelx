"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddBank() {
  const [activeTab, setActiveTab] = useState("IMPS");

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };
  
  const router = useRouter();

  const [banks, setBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [rate, setRate] = useState(102);
  const [withdrawMin, setWithdrawMin] = useState(50);

  const selectedBank = banks.find((b) => b.id === selectedBankId);

  // ✅ Auth guard
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
  }, [router]);

  useEffect(() => {
    fetchBanks();
    fetchBalance();
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const res = await fetch('/api/limits');
      if (res.ok) {
        const data = await res.json();
        setWithdrawMin(data.withdrawMin || 50);
        setRate(data.rate || 102);
      }
    } catch (err) {
      console.error('Failed to fetch limits:', err);
    }
  };

  const fetchBanks = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bank-card", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      const data = await res.json();
      const banksList = data.banks || [];
      setBanks(banksList);
      
      // Auto-select the first bank or the one marked as selected
      if (banksList.length > 0 && !selectedBankId) {
        const defaultBank = banksList.find(b => b.isSelected) || banksList[0];
        setSelectedBankId(defaultBank.id);
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      const res = await fetch("/api/wallet", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setBalance(data.usdtAvailable || 0);
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
    }
  };

  const handleConfirm = async () => {
    const amt = parseFloat(amount);

    if (!amount || isNaN(amt)) {
      setMessage("Please enter an amount.");
      setSuccessMessage("");
      return;
    }
    
    if (!selectedBank) {
      setMessage("❌ Please select a bank account first.");
      setSuccessMessage("");
      return;
    }
    
    if (withdrawMin > amt) {
      setMessage(`❌ Minimum ${withdrawMin} USDT required for withdrawal.`);
      setSuccessMessage("");
      return;
    }
    
    if (amt > balance) {
      setMessage(`❌ Insufficient balance. Available: ${balance.toFixed(2)} USDT`);
      setSuccessMessage("");
      return;
    }

    setMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/selling-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bank: selectedBank, amount: amt, paymentMethod: activeTab }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("Selling request sent for the confirmation!. please wait....");
        setAmount(""); // reset input
        setMessage("");
        setTimeout(() => setSuccessMessage(""), 5000); // hide after 5s
      } else {
        setMessage(data.error || "Failed to send selling request");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error sending selling request");
    }
  };

  if (loading) {
    return (
      <div className="page-wrappers">
        <div className="loader" style={{ textAlign: "center", marginTop: "40px" }}>
          <Image src="/images/loading.webp" alt="loader" width={50} height={50} priority />
        </div>
      </div>
    );
  }

  const selectedBankCardStyle = {
    borderTop: "1px solid #ccc",
    borderBottom: "1px solid #ccc",
  };

  return (
    <div>
      <main>
        <div className="page-wrappers no-empty-page deposit-amount-page add-bank-page">
          {/* HEADER */}
          <header className="header">
            <div className="brdc">
              <div className="back-btn">
                <Link href="/exchange">
                  <img src="images/back-btn.png" />
                </Link>
              </div>
              <h3>Exchange</h3>
            </div>
            <div className="right">
    <Link href="/exchange-list">
              <img src="images/undo.png" />
     </Link>
            </div>
          </header>

          {/* CONTENT */}
          <div className="page-wrapper page-wrapper-ex">
             <div className="bnr"><img src="images/top-bnr.png" style={{width: "100%", float: "left"}}/></div>
            {/* BANK SELECTION */}
            <section className="section-1 text-center">
              <div className="dflex border-btm">
                <p className="title">
                  <b>Select payee</b>
                </p>
                <div className="image">
                  <Link href="/bank">
                    <img src="images/add-u-icon.png" className="icon" />
                  </Link>
                </div>
              </div>

              {banks.length > 0 ? (
                <>
                  {/* Show all available banks for selection */}
                  {banks.length > 1 && (
                    <div style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px', display: 'block' }}>
                        Select Bank Account:
                      </label>
                      <select 
                        value={selectedBankId || ''} 
                        onChange={(e) => setSelectedBankId(Number(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          fontSize: '14px',
                          backgroundColor: 'white',
                          color: '#000',
                          fontWeight: '500'
                        }}
                      >
                        {banks.map(bank => (
                          <option key={bank.id} value={bank.id}>
                            {bank.payeeName} - {bank.accountNo} ({bank.bankName || 'Bank'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Show selected bank details */}
                  {selectedBank && (
                    <div style={selectedBankCardStyle}>
                      <div
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "10px 0",
                          fontSize: "12px",
                          color: "gray",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Account No.</span>
                        <span style={{ color: "black" }}>{selectedBank.accountNo}</span>
                      </div>

                      <div
                        style={{
                          borderBottom: "1px solid #ddd",
                          padding: "10px 0",
                          fontSize: "12px",
                          color: "gray",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>IFSC</span>
                        <span style={{ color: "black" }}>{selectedBank.ifsc}</span>
                      </div>

                      <div
                        style={{
                          padding: "10px 0",
                          fontSize: "12px",
                          color: "gray",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>Payee Name</span>
                        <span style={{ color: "black" }}>{selectedBank.payeeName}</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="add-wallet">
                  <Link href="/bind-bank-card" className="addr-link">
                    <img className="icon" src="/images/add-btn.jpg" />
                    Add bank account
                  </Link>
                </div>
              )}
            </section>

			<div className="content-row currency-row">
				  <span className="field-label">Rupee</span>

				  <div className="currency-tabs">
					<button
				        className={`tab ${activeTab === "CMD" ? "active" : ""}`}
				        onClick={() => setActiveTab("CMD")}
				      >
				        <img src="/images/CMD-icon.png" alt="CMD" />
				        <span>CMD</span>
				
				        <img
				          src="/images/y-tick.png"
				          className="y-icon"
				          alt="selected"
				        />
				      </button>
				
				      {/* IMPS */}
				      <button
				        className={`tab ${activeTab === "IMPS" ? "active" : ""}`}
				        onClick={() => setActiveTab("IMPS")}
				      >
				        <img src="/images/IMPS-icon.png" alt="IMPS" />
				        <span>IMPS</span>
				
				        <img
				          src="/images/y-tick.png"
				          className="y-icon"
				          alt="selected"
				        />
				      </button>
				  </div>
				</div>

							  
            <section className="section-2 inner-space" style={{marginBottom: '0' }}>
				  
              <div className="inside">
				
				
                <div className="btm">
                  <p className="title">Sell USDT</p>
                  <div className="select-amt" style={{ position: "relative", border:'1px solid #ddd', padding:'6px' }}>
                    <input
                      type="number"
                      placeholder="Please enter the amount"
                      name="amt"
                      id="rrd"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      style={{
                        width: "100%",
                        paddingRight: "50px",
                        border: "none",
                        outline: "none",
                        fontSize: "12px",
                        color: "#111",
                        background: "transparent",
                        zIndex: 2,
                        position: "relative",
                      }}
                    />
                    <div
                      className="amt"
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                      }}
                    >
                      <img src="images/uic.png" className="icon" /> USDT
                    </div>

                    <style jsx global>{`
                      input::-webkit-outer-spin-button,
                      input::-webkit-inner-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                      }
                      input[type="number"] {
                        -moz-appearance: textfield;
                      }
                      ::placeholder {
                        color: gray;
                        font-size: 12px;
                      }
                      .add-wallet > a {
                        display: flex;
                        justify-content: center;
                        color: #000;
                        border: 2px dotted #80e9bb;
                        padding: 18px 0;
                        border-radius: 5px;
                        margin: 10px auto 10px;
                        font-weight: 600;
                        gap: 4px;
                        max-width: 100%;
                      }
                      .add-wallet > a .icon {
                        width: 20px;
                        height: 20px;
                      }
                    `}</style>
                  </div>
                </div>

                {/* ❌ Error message */}
                {message && <p className="error" style={{ padding:"10px", fontSize: "12px", color: "red", fontWeight: "500" }}>{message}</p>}

                {/* ✅ Success message */}
                {successMessage && <p className="success" style={{ padding:"10px", fontSize: "12px", color: "green", fontWeight: "500" }}>{successMessage}</p>}

                {/* EXTRA INFO */}
                <div className="dflex avail">
                  <p className="title clrgren" style={{ fontSize: "11px", fontWeight: "600" }}>
                    Available($) {balance}{" "}
                    <img src="images/uic.png" className="icon" style={{ maxWidth: 13 }} />
                  </p>
                  <p style={{ fontSize: "11px", fontWeight: "600" }}>1USDT=₹{rate}</p>
                </div>

                {/* ✅ Conversion Message */}
                {amount && (
                  <p style={{ fontSize: "12px", color: "black", fontWeight: "bold" }}>
                    You will receive Rs. {(parseFloat(amount) * rate).toLocaleString("en-IN")}
                  </p>
                )}
              </div>
            </section>

<section className="table-section tb-pricerefBx">
  <div className="pricerefBx pricerefBx-grbg" style={{ borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.08)' }}>
    <div style={{ background: '#f7f8fa', padding: '10px 14px', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>Tiered Price Policy</span>
      <span style={{ fontSize: '11px', color: '#888' }}>1 USDT = ₹{rate}</span>
    </div>
    <table width="100%" style={{ borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ background: '#f0f0f0' }}>
          <th style={{ padding: '8px 14px', fontSize: '11px', fontWeight: '600', color: '#555', textAlign: 'left', borderBottom: '1px solid #e8e8e8' }}>Amount (USDT)</th>
          <th style={{ padding: '8px 14px', fontSize: '11px', fontWeight: '600', color: '#555', textAlign: 'right', borderBottom: '1px solid #e8e8e8' }}>Rate (₹)</th>
        </tr>
      </thead>
      <tbody>
        {[
          { min: (100000 / rate).toFixed(2), max: (200000 / rate).toFixed(2), bonus: '0.25' },
          { min: (200000 / rate).toFixed(2), max: (300000 / rate).toFixed(2), bonus: '0.5' },
          { min: (300000 / rate).toFixed(2), max: (500000 / rate).toFixed(2), bonus: '1' },
          { min: (500000 / rate).toFixed(2), max: null, bonus: '1.5' },
        ].map((tier, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #f0f0f0', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
            <td style={{ padding: '10px 14px', fontSize: '12px', color: '#444' }}>
              {tier.max
                ? <>&gt;={tier.min} <span style={{ color: '#aaa' }}>&amp;</span> &lt;{tier.max}</>
                : <>&gt;={tier.min}</>}
            </td>
            <td style={{ padding: '10px 14px', fontSize: '12px', color: '#222', fontWeight: '600', textAlign: 'right' }}>
              {rate}+ <span style={{ color: '#e53935', fontWeight: '700' }}>{tier.bonus}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>

            {/* FOOTER */}
            <div className="warning inner-space">
              <div className="login-bx" style={{ backgroundColor: "black", borderRadius: "100px" }}>
               <button style={{ marginBottom: '0' }} className="login-btn" onClick={handleConfirm}>
  Confirm
</button>

              </div>
              <div className="inside">
                In order to get your funds back better, faster and more conveniently,
                your exchange order may be split into multiple parts
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
