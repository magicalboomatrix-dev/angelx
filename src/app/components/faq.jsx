import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="containers">
        <div className="wrapper">
          <div className="text-center">
            <h2>Frequently Asked Questions</h2>
          </div>

          <div className="faq-list">
            {/* FAQ 1 */}
            <div className="container01">
              <div
                className={`question ${activeIndex === 0 ? "active" : ""}`}
                onClick={() => toggleFAQ(0)}
              >
                <span className="sr">01.</span> What is AngelX, and how does it handle USDT to INR exchanges?
              </div>
              <div
                className="answercont"
                style={{
                  maxHeight: activeIndex === 0 ? "500px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.4s ease",
                }}
              >
                <div className="answer">
                  AngelX is a reliable Singapore-based crypto exchange app launched in 2021, focused on quick USDT-to-INR swaps without any KYC hassle. Just download the AngelX APK, log in using your phone number, send USDT over TRC20, BEP20, or ERC20 networks, and receive INR in your Indian bank account within 30 minutes.
                </div>
              </div>
            </div>

            {/* FAQ 2 */}
            <div className="container01">
              <div
                className={`question ${activeIndex === 1 ? "active" : ""}`}
                onClick={() => toggleFAQ(1)}
              >
                <span className="sr">02.</span> Can I exchange USDT for INR on AngelX without KYC?
              </div>
              <div
                className="answercont"
                style={{
                  maxHeight: activeIndex === 1 ? "500px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.4s ease",
                }}
              >
                <div className="answer">
                  Absolutely—AngelX skips KYC entirely for USDT-to-INR trades. No PAN, Aadhaar, or documents required. Sell your USDT anonymously at rates that beat market USD/INR levels, with speedy deposits and straight-to-bank payouts.
                </div>
              </div>
            </div>

            {/* FAQ 3 */}
            <div className="container01">
              <div
                className={`question ${activeIndex === 2 ? "active" : ""}`}
                onClick={() => toggleFAQ(2)}
              >
                <span className="sr">03.</span> What are AngelX's top USDT rates?
              </div>
              <div
                className="answercont"
                style={{
                  maxHeight: activeIndex === 2 ? "500px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.4s ease",
                }}
              >
                <div className="answer">
AngelX delivers superior USDT rates above market averages for bigger INR returns. Open the app for live, clear pricing pulled from Binance and WazirX, covering TRC20, BEP20, and ERC20—with zero hidden charges.
                </div>
              </div>
            </div>

            {/* FAQ 4 */}
            <div className="container01">
              <div
                className={`question ${activeIndex === 3 ? "active" : ""}`}
                onClick={() => toggleFAQ(3)}
              >
                <span className="sr">04.</span> How fast are USDT deposits and INR withdrawals on AngelX?
              </div>
              <div
                className="answercont"
                style={{
                  maxHeight: activeIndex === 3 ? "500px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.4s ease",
                }}
              >
                <div className="answer">
					Deposits to your USDT wallet (via TRC20, BEP20, or ERC20) confirm in just 1-2 minutes. Once you place a sell order, INR hits your Indian bank via IMPS or RTGS in about 30 minutes—way quicker than most platforms.
                </div>
              </div>
            </div>

            {/* FAQ 5 */}
            <div className="container01">
              <div
                className={`question ${activeIndex === 4 ? "active" : ""}`}
                onClick={() => toggleFAQ(4)}
              >
                <span className="sr">05.</span> Is the AngelX APK secure and free?

              </div>
              <div
                className="answercont"
                style={{
                  maxHeight: activeIndex === 4 ? "500px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.4s ease",
                }}
              >
                <div className="answer">
                  Yes, the AngelX APK is completely free, secure, and auto-updates for peace of mind. Since 2021, countless users have trusted it for private USDT-to-INR exchanges and 24/7 portfolio monitoring, no fees or privacy risks involved.
                </div>
              </div>
            </div>

            <div className="container01">
              <div
                className={`question ${activeIndex === 5 ? "active" : ""}`}
                onClick={() => toggleFAQ(5)}
              >
                <span className="sr">06.</span> What bank accounts work for AngelX INR withdrawals?

              </div>
              <div
                className="answercont"
                style={{
                  maxHeight: activeIndex === 5 ? "500px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.4s ease",
                }}
              >
                <div className="answer">
                   Connect any Indian bank account—personal or even rented—without verification. AngelX sends INR directly via fast transfers, compatible with all major banks for effortless USDT sales.

                </div>
              </div>
            </div>

            <div className="container01">
              <div
                className={`question ${activeIndex === 6 ? "active" : ""}`}
                onClick={() => toggleFAQ(6)}
              >
                <span className="sr">07.</span> Does AngelX accept all USDT networks?

              </div>
              <div
                className="answercont"
                style={{
                  maxHeight: activeIndex === 6 ? "500px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.4s ease",
                }}
              >
                <div className="answer">
                  Yes, it supports TRC20, BEP20, ERC20, and others for effortless deposits from any wallet. Confirmations happen in 1-2 minutes, positioning AngelX as India's go-to for stablecoin-to-INR conversions.
                </div>
              </div>
            </div>

            <div className="container01">
              <div
                className={`question ${activeIndex === 7 ? "active" : ""}`}
                onClick={() => toggleFAQ(7)}
              >
                <span className="sr">08.</span> How do I access 24/7 support on AngelX for USDT-to-INR queries?

              </div>
              <div
                className="answercont"
                style={{
                  maxHeight: activeIndex === 7 ? "500px" : "0",
                  overflow: "hidden",
                  transition: "max-height 0.4s ease",
                }}
              >
                <div className="answer">                  
 AngelX offers round-the-clock live chat and phone support from real agents. Track transactions in-app, grab instant statements, or reach out anytime for help with rates, deposits, or withdrawals.

                </div>
              </div>
            </div>
			
			


            {/* Add more FAQs below as needed */}
          </div>
        </div>
      </div>
    </section>
  );
}

