"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginAccountPage() {
  const router = useRouter();
  const [step, setStep] = useState("mobile"); // "mobile" | "otp"
  const [seconds, setSeconds] = useState(60);
  const [hideDiv, setHideDiv] = useState(false);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (step !== "otp") return;
    
    if (seconds === 0) {
      setHideDiv(true);
      return;
    }

    const timer = setTimeout(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds, step]);

  const handleSendOtp = async () => {
    setError("");
    
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send OTP');
        return;
      }

      setSeconds(60);
      setHideDiv(false);
      setStep("otp");
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    
    if (!otp || otp.length !== 4) {
      setError("Please enter a valid 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid OTP');
        return;
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      router.push(data.redirectTo || '/home');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setSeconds(60);
    setHideDiv(false);
    setOtp("");
    await handleSendOtp();
  };

  return (
    <div className="pagee">
      <main>
        <div className="page-wrappers">
          <div className="page-wrapperss page-wrapper-ex page-wrapper-login page-wrapper-loginacc form-wrapper">
            <div className="back-btn">
              <Link href="/login">
                <img src="/images/back-btn.png" />
              </Link>
            </div>
            <section className="section-1" style={{padding:"0px"}}>
              <br/>

              <div className="form-bx">
                
                
                {error && <div className="error-msg">{error}</div>}

                {step === "mobile" ? (
                  <>
                  <h3 className="title">
                    <b>Login Account</b>
                  </h3>
                    <p className="subtitle">Please enter your mobile number.</p>

                    <div className="mobileRow">
                      <div className="prefix">
                        <span className="flag"><img src="/images/flag-icon.png" /></span>
                        <span className="code">+91</span>
                      </div>
                      <input
                        className="mobileInput"
                        placeholder=""
                        inputMode="numeric"
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>

                    <button 
                      className="btn" 
                      type="button" 
                      onClick={handleSendOtp}
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Next'}
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="title">
                      <b>Please enter SMS OTP</b>
                    </h3>
                    <p className="subtitle">SMS OTP sent to +91{mobile}</p>
                    
                    <div className="mobileRowflex">
                      <input
                        className="otpInput"
                        placeholder=""
                        inputMode="numeric"
                        maxLength={4}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      />
                      {!hideDiv && (
                        <div className="get timeSec">
                          After: {seconds}s
                        </div>
                      )}
                    </div>

                    <div className="otpActions">
                      {/* <button className="link" type="button" onClick={() => {
                        setStep("mobile");
                        setOtp("");
                        setError("");
                      }}>
                        Change number
                      </button> */}
                      {hideDiv && (
                        <button className="link" type="button" onClick={handleResendOtp}>
                          Resend OTP
                        </button>
                      )}
                    </div>

                    <button 
                      className="btn" 
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : 'Verify'}
                    </button>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #f6f7fb;
          padding: 16px;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
        }
        .card {
          width: 380px;
          max-width: 100%;
          background: #fff;
          border-radius: 18px;
          padding: 22px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
        }
        .title {
          font-size: 20px;
          margin-bottom: 15px;
        }
        .subtitle {
          margin: 8px 0 5px;
          font-size: 15px;
          color: #6b7280;
        }
        .error-msg {
          background: #fee2e2;
          color: #dc2626;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 12px;
        }
        .mobileRow {
          display: flex;
          align-items: center;
          border: 1px solid #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          background: #f9fafb;
        }
        .mobileRowflex {
          position: relative;
        }
        .mobileRowflex .get {
          position: absolute;
          top: 10px;
          right: 10px;
        }
        .prefix {
          display: flex;
          align-items: center;
          padding: 7px 11px 7px 8px;
          background: #f8f9fc;
          border-right: 1px solid #e5e7eb;
          min-width: 75px;
          font-weight: normal;
          color: #000;
        }
        .flag {
          font-size: 18px;
          display: flex;
          margin-right: 6px;
        }
        .flag img {
            max-width: 26px;
        }
        .code {
          font-size: 16px;
        }
        .mobileInput {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          padding: 5px 14px;
          font-size: 16px;
          color: #000;
        }
        .otpInput {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 3px;
          padding: 11px;
          font-size: 16px;
          outline: none;
          background: #f9fafb;
          color: #000;
        }
        .otpInput::placeholder {
          color: #999;
        }
        .otpActions {
          margin-top: 10px;
          display: flex;
          justify-content: space-between;
          gap: 10px;
        }
        .form-bx {
          max-width: 90%;
          margin: auto;
        }
        .link {
          border: none;
          background: transparent;
          color: #000;
          font-size: 13px;
          cursor: pointer;
          padding: 0;
        }
        .btn {
          width: 100%;
          margin-top: 16px;
          border: none;
          border-radius: 999px;
          padding: 14px 16px;
          background: #000;
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
        }
        .btn:disabled {
          background: #999;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
