"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SettingPage() { 
      const [isOpen, setIsOpen] = useState(false);

      // Prevent body scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);
      
      const router = useRouter();

    const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };



  return (
    <div>
      <main>
        <div className="page-wrappers page-wrapper-ex home-wrapperss setting-wrapper" style={{height: '92vh'}}>  
          <header className="header setting-header">
            <div className="left">
              <div className="d-flex">
              <div className="back-btn">
  <Link href="/login">
    <img src="/images/back-btn.png" alt="back"/>
  </Link>
</div>
              <b>Setting</b></div>
              </div>

          </header>
      

          <div className="page-wrapper page-wrapper-ex">



            <section className="section-2 reffer">
              <div className="rw">
                <div className="bx">
                  <Link href="https://vm.nebestbox.com/1jgm3swhyv8jv09qrr9q3o7lgp">
                    <div className="image">
                      <h3>
                        <img src="/images/s-icon1.jpg" /> Customer service
                      </h3>
                    </div>
                    <div className="arw">
                      <img src="/images/right-arw.png" />
                    </div>
                  </Link>
                </div>
                <div className="bx">
                  <button className="open-btn" onClick={() => setIsOpen(true)}>
                    <div className="image">
                      <h3 >
                        <img src="/images/s-icon2.jpg" /> Business coorperation
                      </h3>
                    </div>
                    <div className="arw">
                      <img src="/images/right-arw.png" />
                    </div>
                  </button>
                </div>
                <div className="bx">
                  <Link href="">
                    <div className="image">
                      <h3>
                        <img src="/images/s-icon3.jpg" /> Version
                      </h3>
                    </div>
                    <div className="arw">
                      <span style={{margin:"10px"}}>v3.2.1</span> <img src="/images/right-arw.png" />
                    </div>
                  </Link>
                </div>
                <div className="bx">
                  <Link href="https://angelx.ind.in/AngelX.apk">
                    <div className="image">
                      <h3>
                        <img src="/images/s-icon4.jpg" /> Intall the official version
                      </h3>
                    </div>
                    <div className="arw">
                      <img src="/images/right-arw.png" />
                    </div>
                  </Link>
                </div>
                  {/*<div className="bx">
                  <Link href="">
                    <div className="image">
                      <h3>
                        <img src="/images/s-icon5.jpg" /> Reset transaction password
                      </h3>
                    </div>
                    <div className="arw">
                      <img src="/images/right-arw.png" />
                    </div>
                  </Link>
                </div>*/}
              </div>

              <button className="button-style logout" onClick={handleLogout}>
                Logout
              </button>
  
            </section>
          </div>

           <div
        className={`overlay ${isOpen ? "show" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <div className={`popup ${isOpen ? "show" : ""}`}>
        <div className="handle" />
        <h2>Business coorperation</h2>
        
        <div className="socialLinkso">
            <Link href="https://t.me/angelxsuper" style={{
  display: 'flex',
  alignItems: 'center',
  fontSize: '15px',
  letterSpacing: '.2px'
}}>
              <img src="/images/telegram-ic.png" alt="telegram"  width="32" height="32" style={{marginRight: '12px'}} /> Telegram
            </Link>
            
            <Link href="https://wa.me/+917056254884" style={{
  display: 'flex',
  alignItems: 'center',
  fontSize: '15px',
  letterSpacing: '.2px'
}}>
              <img src="/images/whatsapp-ic.png" alt="whatsapp" width="32" height="32"  style={{marginRight: '12px'}} /> WhatsApp
            </Link>
        </div>

        <div className="close-btn" onClick={() => setIsOpen(false)}>
          <img src="/images/close-icon.png" />
        </div> 
            
        </div> 

        </div>
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
          background-image: url(../images/ex-bg1.png);
          background-position: top -30px left;
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
      `}</style>      
    </div>
  );
}


