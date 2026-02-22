'use client'
import React, { useEffect, useState } from "react";
//import Image from "next/image";
import Link from 'next/link';
import Footer from '../components/footer';


export default function DemoPage() {
  const [isOpen, setIsOpen] = useState(false);

      // Prevent body scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen])
  
  return (
    <div>
      <main>
        <div className="page-wrappers empty-page" style={{height: 'auto',paddingBottom: '100px'}}>

  <div className="page-wrapperss page-wrapper-ex page-wrapper-login page-wrapper-loginacc form-wrapper" 
  style={{'height': '100%','overflow': 'auto','scrollbarWidth':'thin', 'scrollbarColor':'transparent transparent'}}>
    <div className="brdc">
      <div className="back-btn">
        <Link href="/home">
          <img src="/images/back-btn.png" />
        </Link>
      </div>
      <h3>Invites
      </h3>
    </div>

    <section className="section-1s banner-imgn">
      <div className='informate'>
        <div className="full"><div className="info">
          <h3>Invite friends and make money together</h3>
          <p>Each accepted order of your subordinates will get you corresponding rewards</p></div></div>
      </div>
      <div className="image">
        <img src="/images/inv-img.jpg" style={{"width":"100%"}} />
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

    <div className="login-bx" style={{"margin":"5px 0 0 0",padding: 0}}><button className="login-btn open-btn" onClick={() => setIsOpen(true)} style={{width:"100%"}}>Invite Friends</button></div>

        
  </div>

  
  <div
        className={`overlay ${isOpen ? "show" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <div className={`popup QR-popup ${isOpen ? "show" : ""}`}>
  
        <div className="img"><img src="/images/QR-img.jpg" alt="QR-code"  /></div>
        <p>Please use mobile browser scan QR code to registration</p>
        
        <div className="invite-field">
            <div className="field-bx">
              <div className="left">Invite code</div>
              <div className="right">
                <span className="code-num">dV6OjDX9kpQ8</span> 
                <div className="icon-img"><img src="/images/copyicon.png" alt="QR-code"  /></div>
              </div>
            </div>

            <div className="field-bx">
              <div className="left">Invite link</div>
              <div className="right">
                <span className="code-num">https://pub.ang....DX9kpQ8</span> 
                <div className="icon-img"><img src="/images/copyicon.png" alt="QR-code"  /></div>
              </div>
            </div>

        </div>

        <div className="close-btn" onClick={() => setIsOpen(false)}>
          <img src="/images/close-icon.png" />
        </div> 
            
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
    background: transparent;
    border: 0;
        }

        .overlay {
          position: absolute;
          inset: 0;
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
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          background: #fff;
          border-top-left-radius: 20px;
          border-top-right-radius: 20px;
          padding: 20px 20px 30px 20px;
          min-height: 250px;
          transform: translateY(100%);
          transition: transform 0.3s ease;
          z-index: 1000;
          box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.1);
          visibility: hidden;
        }

        .popup.show {
          transform: translateY(0%);
          visibility: visible;
        }

        .handle {
          width: 40px;
          height: 5px;
          background: #ccc;
          border-radius: 10px;
          margin: 0 auto 15px;
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
          right: 0px;
        }
        .popup h2 {
            margin-bottom: 9px;
        }
        
button.know-btn {
    background: #1d1c20;
    margin-top: 20px;
    padding: 12px 16px;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    width: 100%;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 600
}

.page-wrappers.setting-wrapper button.open-btn {
    margin: 0;
    display: flex;
    justify-content: space-between;
    padding: 0;
    width: 100%;
    align-items: center;
}

.page-wrappers.setting-wrapper .popup h2 {
    font-size: 18px;
    text-align: center;
    margin-bottom: 15px;
    border-bottom: 1px solid #eee;
    padding-bottom: 11px;
}

.page-wrappers.setting-wrapper .popup {
    background: #fff;
    padding-bottom: 0;
    min-height: 190px;
}

.page-wrappers.setting-wrapper .popup .handle {
    display: none;
}

.page-wrappers.setting-wrapper .popup .socialLinkso a {
    display: block;
    padding: 10px;
}

.page-wrappers.setting-wrapper .popup .socialLinkso {
    display: flex;
    flex-direction: column;
    gap: 20px 12px;
}

.page-wrappers.setting-wrapper .popup .socialLinkso a {
    display: flex;
    align-items: center;
    font-size: 15px;
    letter-spacing: .2px;
}

.page-wrappers.setting-wrapper .popup .socialLinkso a img {
    margin-right: 12px;
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

.popup.QR-popup .invite-field {
    margin: 25px 0 10px;
}

.popup.QR-popup .invite-field .field-bx {
    display: flex;
    align-items: center;
    padding: 10px;
    margin: 12px 0;
    background: #eeeef1;
    border-radius: 10px;
    justify-content: space-between;
    align-items: center;
}

.popup.QR-popup .invite-field .field-bx .right {
    display: flex;
    gap: 10px;
    align-items: center;
}

.popup.QR-popup .invite-field .field-bx .right .icon-img {
    display: flex;
}
      `}</style>  
    </div>
  );
}
