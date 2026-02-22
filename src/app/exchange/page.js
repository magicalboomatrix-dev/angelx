"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Slider = dynamic(
  () => import("react-slick").then((mod) => mod.default),
  {
    ssr: false,
  }
);

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Exchange() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(52);
  const [rate, setRate] = useState(102);

  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      window.location.reload();
      return;
    }
    const timer = setInterval(
      () => setTimeLeft((prev) => prev - 1),
      1000
    );
    return () => clearInterval(timer);
  }, [timeLeft]);

  const settings = {
    dots: false,
    arrows: false,
    autoplay: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const settings1 = {
    vertical: true,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3500,
    speed: 800,
    infinite: true,
    pauseOnHover: false,
  };

  // Auth + Rate
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);

    const fetchRate = async () => {
      try {
        const res = await fetch("/api/limits");
        if (res.ok) {
          const data = await res.json();
          setRate(data.rate || 102);
        } else {
          setRate(102);
        }
      } catch {
        setRate(102);
      }
    };

    fetchRate();
  }, []);

  

  return (
    
    <div>
      <main>
        <div className="page-wrappers" style={{height: '92vh'}}>
          <header className="header">
            <div className="left">
              <div className="header-left">
                <img alt="Logo" className="logo" src="/images/logo-icon.png" />
                <h1 className="title-left">Welcome to AngelX</h1>
              </div>
            </div>
            <div className="right">
              <a href="https://vm.nebestbox.com/1jgm3swhyv8jv09qrr9q3o7lgp">
                <img src="/images/customer-care-icon.png" />
              </a>
            </div>
          </header>

          

          <div className="page-wrapper page-wrapper-ex">

            
            {/* Banner Slider */}
            <section className="section-1">
              <Slider {...settings}>
                <div>
                  <img
                    src="/images/ex-sl1.png"
                    alt="Slide 1"
                    style={{ width: "100%", borderRadius: "10px" }}
                  />
                </div>
                <div>
                  <img
                    src="/images/ex-sl2.png"
                    alt="Slide 2"
                    style={{ width: "100%", borderRadius: "10px" }}
                  />
                </div>
              </Slider>
            </section>

            {/* Rate Box */}
            <section className="section-3">
              <p className="title" style={{ textAlign: "left" }}>
                <b>Platform Price</b>
              </p>

              <div className="price-calc">
                <div className="priceref">
                  <p>
                    Automatic refresh after{" "}
                    <span className="ref">{timeLeft}s</span>
                  </p>
                </div>

                <div className="reff-price">
                  <div className="base-price">
                    <h4>
                      {rate} <span>Base</span>
                    </h4>
                  </div>

                  <p className="onepriceex">1 USDT = ₹{rate}</p>

                  <div className="pricerefBx">
                    <table width="100%">
                      <thead>
                        <tr>
                          <th>Exchanges($)</th>
                          <th>Prices(₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>&gt;=980.4 and &lt;1960.79</td>
                          <td>
                            {rate} + <span className="red">0.25</span>
                          </td>
                        </tr>
                        <tr>
                          <td>&gt;=1960.79 and &lt;2941.18</td>
                          <td>
                            {rate} + <span className="red">0.5</span>
                          </td>
                        </tr>
                        <tr>
                          <td>&gt;=2941.18 and &lt;4901.97</td>
                          <td>
                            {rate} + <span className="red">1</span>
                          </td>
                        </tr>
                        <tr>
                          <td>&gt;=4901.97</td>
                          <td>
                            {rate} + <span className="red">1.5</span>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2}>
                            <p className="open-btn" onClick={() => setIsOpen(true)} style={{textDecoration: 'underline'}}>What is tiered price policy?</p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Login / Sell */}
                <div className="login-bx">
                  <Link
                    href={isLoggedIn ? "/sell-usdt" : "/login"}
                    className="login-btn"
                  >
                    {isLoggedIn ? "Sell USDT" : "Login for sell USDT"}
                  </Link>

                  {!isLoggedIn && (
                    <p className="text">
                      First time login will register new account for you
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="deposit">
                  <div className="bx">
                    <Link href="/USDT-deposit">
                      <div className="icon">
                        <img src="/images/card.png" />
                      </div>
                      <p>Deposit</p>
                    </Link>
                  </div>

                  <div className="bx">
                    <Link href="/withdraw">
                      <div className="icon">
                        <img src="/images/trans-money.png" />
                      </div>
                      <p>Withdraw</p>
                    </Link>
                  </div>

                  <div className="bx">
                    <Link href="/invite">
                      <div className="icon">
                        <img src="/images/envlope.png" />
                      </div>
                      <p>Invite</p>
                    </Link>
                  </div>
                </div>

                {/* Notifications */}
                <div className="notify">
                  <div className="lefts">
                    <div className="icon">
                      <img src="/images/notify.png" />
                    </div>
                    <div className="spr">|</div>

                    <Slider {...settings1} className="text-sl">
                      <p className="text">
                        <span className="time">12:34</span> 84***4556 sold for
                        $756
                      </p>
                      <p className="text">
                        <span className="time">10:55</span> 84***6744 sold for
                        $897
                      </p>
                    </Slider>
                  </div>

                  <div className="rights">
                    <div className="icon right">
                      <img src="/images/right-arw.png" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Exchanges */}
            <section className="section-4">
              <p className="title" style={{ textAlign: "left" }}>
                <b>Exchanges Price</b>
              </p>

              <div className="dflex-out">
                <div className="bx">
                  <div className="dflex">
                    <img src="/images/wazirx.png" />
                    <a href="https://wazirx.com/" target="_blank">
                      <img src="/images/grn-right-arw.png" />
                    </a>
                  </div>
                  <div className="text">
                    Avg <span className="b">91.64</span>{" "}
                    <span className="rs">RS</span>
                  </div>
                  <div className="small">1USDT = ₹91.64</div>
                  <div className="rw">
                    Min <span className="black">90.12RS</span>
                  </div>
                  <div className="rw">
                    Max <span className="black">92.79RS</span>
                  </div>
                </div>

                <div className="bx">
                  <div className="dflex">
                    <img src="/images/binance.png" />
                    <a
                      href="https://p2p.binance.com/en/trade/BUY/USDT?fiat=INR&payment=ALL"
                      target="_blank"
                    >
                      <img src="/images/grn-right-arw.png" />
                    </a>
                  </div>
                  <div className="text">
                    Avg <span className="b">96.98</span>{" "}
                    <span className="rs">RS</span>
                  </div>
                  <div className="small">1USDT = ₹96.89</div>
                  <div className="rw">
                    Min <span className="black">95.74RS</span>
                  </div>
                  <div className="rw">
                    Max <span className="black">97.12RS</span>
                  </div>
                </div>
              </div>

              <p className="title btm">
                Statistics based on the latest 10 pieces of data
              </p>
            </section>

            {/* Advantages */}
            <section className="section-2">
              <p className="title" style={{ textAlign: "left" }}>
                <b>Platform Advantage</b>
              </p>

              <div className="rw">
                <div className="bx">
                  <div className="image">
                    <img src="/images/mic.png" /> <h3>24/7 Support</h3>
                  </div>
                  <div className="info">
                    <p>
                      Got a problem? Just get in touch. Our customer service
                      support team is available 24/7.
                    </p>
                  </div>
                </div>

                <div className="bx">
                  <div className="image">
                    <img src="/images/card.png" /> <h3>Transaction Free</h3>
                  </div>
                  <div className="info">
                    <p>
                      Use a variety of payment methods to trade cryptocurrency,
                      free, safe and fast.
                    </p>
                  </div>
                </div>

                <div className="bx">
                  <div className="image">
                    <img src="/images/money.png" /> <h3>Rich Information</h3>
                  </div>
                  <div className="info">
                    <p>
                      Gather a wealth of information, let you know the industry
                      dynamics in first time.
                    </p>
                  </div>
                </div>

                <div className="bx">
                  <div className="image">
                    <img src="/images/pro.png" /> <h3>Reliable Security</h3>
                  </div>
                  <div className="info">
                    <p>
                      Our sophisticated security measures protect your
                      cryptocurrency from all risks.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        <div
        className={`overlay ${isOpen ? "show" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <div className={`popup ${isOpen ? "show" : ""}`}>
        <div className="handle" />
        <h2>What is tiered price policy?</h2>
        <p>A tiered price policy is a pricing strategy where users receive better rates or discounts based on their transaction volume.</p>
        <p>In a tiered exchange discount policy, larger transactions qualify for preferential pricing, allowing users to receive higher returns compared to the standard rate. This structure is designed to help users maximize profits more efficiently.</p>
        <div className="close-btn" onClick={() => setIsOpen(false)}>
          <img src="/images/close-icon.png" />
        </div> 

  <Link 
  href="/exchange" 
   
  style={{
    backgroundColor: '#000000', 
    color: '#ffffff', 
    border: '1px solid #1d1c20',
    padding: "14px 16px",      // Slightly taller for better touch target
    borderRadius: "30px",
    display: "block",          // Forces it to take its own line
    width: "100%",             // Spans the full width of the parent
    textAlign: "center",       // Centers the text inside the full-width bar
    textDecoration: "none",    // Removes underline
    fontSize: "14px",
    fontWeight: "600",
    boxSizing: "border-box"    // Ensures padding doesn't push it past 100%
  }} 
  onClick={() => setIsOpen(false)}
>
  Yes, I know
</Link>   
            
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
          padding: 20px;
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
        
.know-btn {
  background-color: #000000; /* Pure Black Background */
  color: #ffffff;            /* Pure White Text */
  margin-top: 20px;
  padding: 12px 16px;
  border: 1px solid #1d1c20;
  border-radius: 30px;       /* Pill shape */
  font-size: 14px;
  font-weight: 600;
  display: block;            /* Makes it take full width */
  width: 100%;
  text-align: center;
  text-decoration: none;     /* Removes default link underline */
  transition: opacity 0.2s ease;
}

.know-btn:hover {
  opacity: 0.8;              /* Subtle fade on hover */
  color: #ffffff;
}

.know-btn:active {
  transform: scale(0.98);    /* Slight click effect */
}
      `}</style>               
          
    </div>
    


  );
}

