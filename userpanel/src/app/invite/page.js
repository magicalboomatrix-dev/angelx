'use client'
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import Footer from '../components/footer';

export default function DemoPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    let ignore = false;

    async function loadInviteDetails() {
      setLoadingInvite(true);
      setError('');

      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to load invite details');
        }

        const data = await response.json();
        const referralCode = data?.user?.referralCode?.trim();

        if (!referralCode) {
          throw new Error('Referral code is not available');
        }

        const nextInviteLink = `${window.location.origin}/login?ref=${encodeURIComponent(referralCode)}`;
        const nextQrCode = await QRCode.toDataURL(nextInviteLink, {
          width: 200,
          margin: 1,
          color: {
            dark: '#111111',
            light: '#FFFFFF',
          },
        });

        if (ignore) {
          return;
        }

        setInviteCode(referralCode);
        setInviteLink(nextInviteLink);
        setQrCodeDataUrl(nextQrCode);
      } catch (err) {
        if (ignore) {
          return;
        }

        if (err.message === 'Failed to load invite details') {
          localStorage.removeItem('token');
          router.replace('/login');
          return;
        }

        setError(err.message || 'Unable to load invite details');
      } finally {
        if (!ignore) {
          setLoadingInvite(false);
        }
      }
    }

    loadInviteDetails();

    return () => {
      ignore = true;
    };
  }, [router]);

  useEffect(() => {
    if (!copiedField) {
      return;
    }

    const timer = window.setTimeout(() => {
      setCopiedField('');
    }, 1600);

    return () => window.clearTimeout(timer);
  }, [copiedField]);

  const handleCopy = async (value, field) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setError('');
    } catch {
      setError(`Unable to copy ${field}`);
    }
  };

  const inviteReady = Boolean(inviteCode && inviteLink && qrCodeDataUrl);

  return (
    <div>
      <main>
        <div className="page-wrappers empty-page" style={{ height: 'auto', paddingBottom: '100px' }}>
          <div
            className="page-wrapperss page-wrapper-ex page-wrapper-login page-wrapper-loginacc form-wrapper"
            style={{ height: '100%', overflow: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'transparent transparent' }}
          >
            <div className="brdc">
              <div className="back-btn">
                <Link href="/home">
                  <img src="/images/back-btn.png" alt="back" />
                </Link>
              </div>
              <h3>Invites</h3>
            </div>

            <section className="section-1s banner-imgn">
              <div className="informate">
                <div className="full">
                  <div className="info">
                    <h3>Invite friends and make money together</h3>
                    <p>Each accepted order of your subordinates will get you corresponding rewards</p>
                  </div>
                </div>
              </div>
              <div className="image">
                <img src="/images/inv-img.jpg" style={{ width: '100%' }} alt="invite banner" />
              </div>
            </section>

            <div className="pricerefBx pricerefBx-01">
              <h4><b>Rules</b></h4>
              <table width="100%">
                <thead>
                  <tr>
                    <th>Subordinate</th>
                    <th>Commission</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1 Level</td>
                    <td>0.1%</td>
                  </tr>
                  <tr>
                    <td>2 Level</td>
                    <td>0.03%</td>
                  </tr>
                  <tr>
                    <td>3 Level</td>
                    <td>0.02%</td>
                  </tr>
                  <tr>
                    <td>4 Level</td>
                    <td>0.01%</td>
                  </tr>
                  <tr>
                    <td>5 Level</td>
                    <td>0.01%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {error && !isOpen && <p className="invite-error">{error}</p>}

            <div className="login-bx" style={{ margin: '5px 0 0 0', padding: 0 }}>
              <button
                className="login-btn open-btn"
                onClick={() => setIsOpen(true)}
                style={{ width: '100%' }}
                disabled={loadingInvite || Boolean(error)}
                type="button"
              >
                {loadingInvite ? 'Preparing Invite...' : 'Invite Friends'}
              </button>
            </div>
          </div>

          <div
            className={`overlay ${isOpen ? 'show' : ''}`}
            onClick={() => setIsOpen(false)}
          />

          <div className={`popup QR-popup ${isOpen ? 'show' : ''}`}>
            <div className="img qr-frame">
              {inviteReady ? (
                <img src={qrCodeDataUrl} alt="Referral QR code" />
              ) : (
                <div className="qr-placeholder">{loadingInvite ? 'Generating QR...' : 'QR unavailable'}</div>
              )}
            </div>
            <p>Please use a mobile browser to scan this QR code and register with your referral link.</p>

            {error && <p className="invite-error popup-error">{error}</p>}

            <div className="invite-field">
              <div className="field-bx">
                <div className="left">Invite code</div>
                <div className="right">
                  <span className="code-num">{inviteCode || '--'}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(inviteCode, 'code')}
                    type="button"
                    disabled={!inviteCode}
                  >
                    <img src="/images/copyicon.png" alt="copy code" />
                  </button>
                </div>
              </div>

              <div className="field-bx field-link-box">
                <div className="left">Invite link</div>
                <div className="right link-right">
                  {inviteLink ? (
                    <a className="code-num field-link" href={inviteLink} target="_blank" rel="noreferrer">
                      {inviteLink}
                    </a>
                  ) : (
                    <span className="code-num">--</span>
                  )}
                  <button
                    className="copy-btn"
                    onClick={() => handleCopy(inviteLink, 'link')}
                    type="button"
                    disabled={!inviteLink}
                  >
                    <img src="/images/copyicon.png" alt="copy link" />
                  </button>
                </div>
              </div>
            </div>

            {copiedField && (
              <p className="copy-state">{copiedField === 'code' ? 'Invite code copied' : 'Invite link copied'}</p>
            )}

            <button className="close-btn" onClick={() => setIsOpen(false)} type="button">
              <img src="/images/close-icon.png" alt="close" />
            </button>
          </div>
        </div>

        <Footer></Footer>
      </main>
      <style jsx>{`
        .open-btn {
          padding: 3px 20px;
          background: transparent;
          color: #111;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: normal;
          border: 0;
        }

        .open-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .invite-error {
          color: #c62828;
          font-size: 13px;
          margin: 12px 0 0;
        }

        .popup-error {
          margin-top: 0;
        }

        .overlay {
          position: fixed;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 100%;
          max-width: 375px;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.4);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          z-index: 999;
          visibility: hidden;
        }

        .overlay.show {
          opacity: 1;
          pointer-events: auto;
          visibility: visible;
        }

        .popup {
          position: fixed;
          left: 50%;
          width: 100%;
          max-width: 375px;
          bottom: 0;
          background: #fff;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          padding: 20px 20px 30px 20px;
          min-height: 250px;
          transform: translate(-50%, 100%);
          transition: transform 0.3s ease;
          z-index: 1000;
          box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.1);
          visibility: hidden;
        }

        .popup.show {
          transform: translate(-50%, 0%);
          visibility: visible;
        }

        .popup p {
          margin-bottom: 10px;
        }

        .close-btn {
          margin-top: 20px;
          padding: 10px 16px;
          background: transparent;
          color: #000;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          position: absolute;
          top: -15px;
          right: 0;
        }

        .page-wrapper.page-wrapper-ex section.section-2 .bx button.open-btn h3 {
          font-weight: normal;
        }

        .popup.QR-popup {
          padding-top: 40px;
          text-align: center;
        }

        .popup.QR-popup p {
          text-align: left;
          font-weight: 300;
          color: #000;
          font-size: 13px;
        }

        .qr-frame {
          width: 200px;
          height: 200px;
          margin: 0 auto 14px;
          border-radius: 18px;
          overflow: hidden;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qr-frame img {
          width: 100%;
          height: 100%;
          display: block;
        }

        .qr-placeholder {
          font-size: 14px;
          color: #555;
          padding: 20px;
        }

        .popup.QR-popup .invite-field {
          margin: 25px 0 10px;
        }

        .popup.QR-popup .invite-field .field-bx {
          display: flex;
          padding: 10px;
          margin: 12px 0;
          background: #eeeef1;
          border-radius: 10px;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .popup.QR-popup .invite-field .field-bx .left {
          flex: 0 0 74px;
          text-align: left;
          font-weight: 600;
        }

        .popup.QR-popup .invite-field .field-bx .right {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: flex-end;
          flex: 1;
          min-width: 0;
        }

        .field-link-box .link-right {
          align-items: center;
        }

        .code-num {
          min-width: 0;
          word-break: break-all;
          text-align: right;
          color: #111;
          font-size: 13px;
        }

        .field-link {
          text-decoration: none;
          display: block;
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .copy-btn {
          border: 0;
          background: transparent;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex: 0 0 auto;
        }

        .copy-btn:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .copy-state {
          color: #1b5e20;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
