'use client'
import React, { useCallback, useEffect, useState } from 'react';
import Image from "next/image";
import Link from 'next/link';

import FAQ from "./components/faq";
import TetimonialCarousel from "./components/tetimonials";
import Readmore from "./components/Readmore";
import Footer from './components/footer';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [rate, setRate] = useState(null);
  const [supportLink, setSupportLink] = useState(null);

	
const [refreshKey, setRefreshKey] = useState(false);
const [refreshdata, setrefreshData] = useState("Initial Data");	
const reloadDataFun = async () => {
    setRefreshKey(true);
    await new Promise(resolve => setTimeout(resolve, 700));
    setrefreshData("Updated Data " + new Date().toLocaleTimeString());
    setRefreshKey(false);
};
	
	
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/limits');
        if (res.ok) {
          const data = await res.json();
          if (data.supportLink) setSupportLink(data.supportLink);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    }
    fetchSettings();
  }, []);

  const fetchRate = useCallback(async () => {
    try {
      const res = await fetch('/api/limits');
      if (!res.ok) return;

      const data = await res.json();
      if (data.rate) setRate(data.rate);
    } catch {
      // Keep existing rate value on error
    }
  }, []);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  const [timeLeft, setTimeLeft] = useState(52);

  useEffect(() => {
    if (!mounted) return;

    if (timeLeft <= 0) {
      fetchRate();
      setTimeLeft(52);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, mounted]);

  const [showAppLink, setShowAppLink] = useState(true);
 
  return (   
    <div>
      <div className="page-wrappers" style={{height: '100%'}}>
         {loading && <div className="loader">
          <Image 
            src="/images/loading.webp"
            alt="loader"
            width={30}
            height={30}
            priority
          />
          </div>}
        {!loading && (
          <div>

          </div>
        )}

        {showAppLink && (
          <div className="applinkMainDiv">
            <div className="applinkdownload">
              <div className="appimgtext">
                <img src="/images/applinkimg.jpeg" alt="AngelX" />
                <div className="textlink">
                  <h4>AngelX</h4>
                  <p>India’s #1 Trusted USDT Exchange Platform</p>
                </div>
              </div>
  
              <Link
                href="/AngelX.apk"
                className="downloadbutton"
                download
              >
                Download
              </Link>
            </div>
  
            <button
              className="closeAppLink"
              onClick={() => setShowAppLink(false)}
            >
              X
            </button>
          </div>
        )}
        
        <header className="header" style={{position: 'relative'}}>
            <div className="left">

                <div className="header-left">
                  <img alt="AngelX Logo" className="logo" src="/images/logo-icon.png" />
                  <h3 className="title-left">AngelX</h3>
                </div>
            </div>
            <div className="right">
            {supportLink && (
              <a href={supportLink}>
                <Image
                src="/images/customer-care-icon.png"
                alt="customer"
                width={24}
                height={24}
                priority
                /></a>
            )}
            </div>
        </header>

        <div className="page-wrapper" style={{paddingTop: '2px', marginTop: '0px',height: '100%',marginBottom:"65px"}}>
            <section className="section-1 hm-section-1">
            <div className="image">
                <Image                
                src="/images/welcome-banner.png"
                alt="welcome to angelx"
                width={339}
                height={109}
                priority
                />
                </div>
            </section>

            <section className="section-2 hm-section-2">
                <div className="rw">
                <div className="bx">
                <div className="left">
                <div className="image">
                     <Image                
                src="/images/get-started.png"
                alt="AngelX"
                width={96}
                height={96}
                priority
                />
                </div>
                </div>
                <div className="right">
                <div className="info">
                    <h3>Get started in seconds</h3>
                    <p>Whether you are a beginner or an expert, you can easily get started without any professional knowledge.</p>
                </div>
                </div>
                </div>
                
                <div className="bx">
                <div className="left">
                <div className="image">
                <Image                
                src="/images/boost.png"
                alt="AngelX"
                width={96}
                height={96}
                priority
                />
                </div>
                </div>
                <div className="right">
                <div className="info">
                    <h3>Boost your yields</h3>
                    <p>Every transaction has potential for huge profits, allowing every user to thrive simultaneously with the platform.</p>
                </div>
                </div>
                </div>
                
                <div className="bx">
                <div className="left">
                <div className="image">
                    <Image                
                    src="/images/access.png"
                    alt="AngelX"
                    width={96}
                    height={96}
                    priority
                    />
                </div>
                </div>
                <div className="right">
                <div className="info">
                    <h3>Acess expert knowledge</h3>
                    <p>Ensure that every user can earn profits on the platform regardless of how much money they have.</p>
                </div>
                </div>
                </div>
                </div>
            </section>

            <>
  <section className="section-3">
<div className="screenshot-wrapper">
  <div className="image">
    <Image 
      alt="AngelX Logo" 
      className="screenshot-img" 
      src="/images/hm-mob-img.jpg" 
      width={360} // Estimated width based on common mobile screenshot dimensions. Verify actual image dimensions.
      height={640} // Estimated height based on common mobile screenshot dimensions. Verify actual image dimensions.
      priority
    />                  
  </div>
  <div className="overlay-box">
    <div className="overlay-header">
      <h2>Platform price</h2>
    </div>
    <div className="price-calc">
		  <div className="reload-btn">
            <button onClick={reloadDataFun}><img src="/images/reaload-btn.png" alt="" /></button>
              
        </div>
      <div className="priceref">
        <p>
          Automatic refresh after{" "}
          <span className="ref">
            {timeLeft}s
          </span>
        </p>
      </div>
      <div className="reff-price">
       	
		
		{refreshKey ? (
		  <div className="preloader">
		  <Image 
            src="/images/loading.webp"
            alt="loader"
            width={30}
            height={30}
            priority
          />
		  </div>
		) : (
		  <>
			<div className="base-price">
			  <h4>
				{rate ?? '-'} <span>Base</span>
			  </h4>
			</div>

			<p className="onepriceex">
			  1 USDT = ₹{rate ?? '-'}
			</p>
		  </>
		)}
			  
      </div>
    </div>
  </div>
</div>
    
    <p className="title">
      <b>AngelX official screenshot</b>
    </p>
  </section>
  <section className="section-4">
    <h3 className="title">Market list</h3>
    <table>
      <tbody>
        <tr>
          <th>
            <small>Digital Coin</small>
          </th>
          <th>
            <small>Volume(24h)</small>
          </th>
          <th>
            <small>Price</small>
          </th>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/matic.png"
                alt="Matic"
                width={35}
                height={35}
                priority
                />                  
              </div>
              <div className="info">
                <h3>Matic</h3>
                <p>+1.15%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$25,418,370.3</h4>
          </td>
          <td>
            <h4>$0.5507</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/shib.png"
                alt="Shib"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>Shib</h3>
                <p>+0.1%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$14,522,434.3</h4>
          </td>
          <td>
            <h4>$0.0005507</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/fil.png"
                alt="Fil"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>Fil</h3>
                <p>+1.36%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$67,324,567.3</h4>
          </td>
          <td>
            <h4>$0.0564500</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/matic.png"
                alt="Eos"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>Eos</h3>
                <p>+2.14%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$45,32,78.0</h4>
          </td>
          <td>
            <h4>$0.0445532</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/eos.png"
                alt="EOS"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>EOS</h3>
                <p>+0.05%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$43,656,343.0</h4>
          </td>
          <td>
            <h4>$1.0005786</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/dot.png"
                alt="DOT"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>DOT</h3>
                <p className="red">-0.34%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$34,876,23.0</h4>
          </td>
          <td>
            <h4>$345.67</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/usdt.png"
                alt="USDT"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>USDT</h3>
                <p>+0.1%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$34,873,234.03</h4>
          </td>
          <td>
            <h4>$1.455654</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/doge.png"
                alt="Doge"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>Fil</h3>
                <p>+1.30%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$89,232,676.2</h4>
          </td>
          <td>
            <h4>$3460.67</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/btc.png"
                alt="BTC"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>BTC</h3>
                <p className="red">-0.14%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$45,32,78.0</h4>
          </td>
          <td>
            <h4>$0.0445532</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/sol.png"
                alt="SOL"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>SOL</h3>
                <p>+11.0%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$43,546,232.0</h4>
          </td>
          <td>
            <h4>$0.0004633</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/ton.png"
                alt="TON"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>TON</h3>
                <p>+12.4%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$43,546,232.0</h4>
          </td>
          <td>
            <h4>$0.0004633</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/avax.png"
                alt="Avax"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>Avax</h3>
                <p className="red">-0.4%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$43,546,232.0</h4>
          </td>
          <td>
            <h4>$0.0004633</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/bnb.png"
                alt="BNB"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>BNB</h3>
                <p>+11.0%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$43,546,232.0</h4>
          </td>
          <td>
            <h4>$0.0004633</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/xrp.png"
                alt="XRP"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>XRP</h3>
                <p>+11.0%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$43,546,232.0</h4>
          </td>
          <td>
            <h4>$0.0004633</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/eth.png"
                alt="ETH"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>ETH</h3>
                <p className="red">-0.10%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$04,454,234.3</h4>
          </td>
          <td>
            <h4>$0.234556</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/link.png"
                alt="LINK"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>LINK</h3>
                <p>+3.10%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$35,546,232.0</h4>
          </td>
          <td>
            <h4>$0.00347548</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/trx.png"
                alt="TRX"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>TRX</h3>
                <p>+6.00%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$43,344,544.0</h4>
          </td>
          <td>
            <h4>$0.0034768</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/ada.png"
                alt="ADA"
                width={35}
                height={35}
                priority
                /> 
                
              </div>
              <div className="info">
                <h3>ADA</h3>
                <p>+2.30%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$76,243,657.0</h4>
          </td>
          <td>
            <h4>$0.45435</h4>
          </td>
        </tr>
        <tr>
          <td>
            <div className="dflex">
              <div className="icon">
                <Image                
                src="/images/ftm.png"
                alt="FTM"
                width={35}
                height={35}
                priority
                />                 
              </div>
              <div className="info">
                <h3>FTM</h3>
                <p className="red">-0.10%</p>
              </div>
            </div>
          </td>
          <td>
            <h4>$23,455,345.0</h4>
          </td>
          <td>
            <h4>$0.0000445</h4>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
  
</>
<section className="game-detail">
        <div className="containers">
          <div className="rowr">
            <div className="col-left">
              <div className="text-left2">
                <h1>
                  Welcome to AngelX → Your USDT-to-INR Exchange Needs, One App!
                </h1>
                <div className="exchange-banner"><img src="/images/exchange-platforms-banner.jpeg" alt="AngelX" style={{ width: "100%" }} /></div>
              </div>
            </div>
            <div className="col-right">
              <div className="content">
                

<p>Tired of complicated crypto exchanges with endless KYC hurdles and low rates? AngelX is here to simplify your USDT-to-INR conversions. As a trusted India-based cryptocurrency exchange platform founded in 2021, AngelX lets you sell USDT for INR seamlessly through —no fuss, no verification, just fast payouts. Our app delivers top USDT rates that beat the market.</p>

<p>Download the <Link href="https://www.angelx.ind.in/AngelX.apk"><strong>"AngelX Apk"</strong></Link> today and experience the easiest crypto exchange for Indians. Trusted by thousands since 2021, AngelX is your go-to for reliable, no-KYC <strong>AngelX USDT selling</strong> services.</p>

                {/* ... the rest remains unchanged ... */}

                <Readmore>
                  <h2>What is AngelX?</h2>
<p>AngelX is a mobile app specially focusing on selling USDT (Tether) and transfering it into INR in bank account. It acts as a place to buy and sell different digital assets, while providing quick, reliable and almost instant payouts as well as 24/7 customer service for users.</p>

<p>AngelX is an overall focus on speed, security and user-friendliness for users to convert USDT into INR without going through the complexities of traditional crypto trading methods.</p>


                  <h2>Key Features That Make AngelX Unbeatable</h2>

<p><strong>Download & Login:</strong> Get the AngelX Apk from our site. Sign In with only your mobile number — no password required.</p>

<p><strong>No KYC Required:</strong> On AngelX, you can exchange cryptocurrency instantly without any PAN card, or Aadhaar verification— Perfect for privacy-conscious users dealing in USDT-to-INR.</p>

<p><strong>Top USDT Price:</strong> We buy USDT at premium rates above market averages, maximizing your INR returns.</p>

<p><strong>Instant USDT Deposits & Approvals:</strong> Send from any wallet; we support ERC-20, TRC-20, and more., get approved in 1-2 minutes.</p>

<p><strong>Add Bank Account:</strong> Link any Indian bank (yours or rental). No verification hassles.</p>

<p><strong>Ultra-Fast USDT Selling:</strong> Execute your sell orders instantly and capture every market opportunity.</p>

<p><strong>Instant INR Payout:</strong> Secure, direct INR payouts to any Indian bank—no extra steps.</p>

<p><strong>100% Genuine and Safe Payment:</strong> Every transaction is protected with advanced security measures, guaranteeing genuine and secure payments.</p>

<p><strong>Track & Download:</strong> Monitor everything in-app. Need a statement? Download your transaction file instantly.</p>

<p><strong>24/7 Customer Support:</strong> Real humans ready to help anytime, via chat or call.</p>

<h2>How to Use AngelX: Sell USDT for INR in Minutes</h2>

<p>Here’s a step-by-step guide based on your instructions to perform actions on AngelX:</p>

<p><strong>1. Login Using Mobile Number</strong></p>
<p>— Go to: <Link href="https://www.angelx.ind.in/"><strong>https://www.angelx.ind.in/</strong></Link></p>
<p>— Click Login / Register.</p>
<p>— Enter your Mobile Number.</p>
<p>— Complete the login (or sign-up) process as per instructions (OTP verification if needed).</p>

<p><strong>2. Complete Profile (Name & Mobile)</strong></p>
<p>— Fill in your Full Name.</p>
<p>— Enter your E-mail ID.</p>
<p>— Save the details.</p>

<p><strong>3. Add Bank Account (Exchange Page)</strong></p>
<p>— On the withdrawal section, look for a Bank Account.</p>
<p>— Add your Bank Account Number, IFSC Code, Bank Name, etc.</p>
<p>— Submit and verify if needed.</p>

<p><strong>4. Add USDT (Deposit Section on Exchange Page)</strong></p>
<p>— On the Exchange Page, navigate to the Deposit section.</p>
<p>— Select USDT (Tether) as the deposit currency.</p>
<p>— You’ll be shown a Wallet Address (TRC20/BEP20).</p>
<p>— Transfer the USDT to the given wallet address.</p>
<p>— Submit the Transaction Hash/ID if required.</p>

<p><strong>5. Balance Update (within 5 minutes)</strong></p>
<p>— After depositing, the balance in your account will be updated within approximately 5 minutes.</p>
<p>— You can check this on your Wallet Balance or Dashboard.</p>

<p><strong>6. Place a Sell Order (Exchange Page)</strong></p>
<p>— Navigate to the Exchange or Trade section.</p>
<p>— Select USDT to INR (or preferred currency).</p>
<p>— Enter the amount of USDT you wish to sell.</p>
<p>— Place the Sell Order.</p>
<p>— Confirm the transaction.</p>

<p>Download the <Link href="https://www.angelx.ind.in/AngelX.apk"><strong>"AngelX Apk"</strong></Link> today—it's 100% safe, no KYC required. Perfect for traders scaling up from basic USDT-to-INR swaps.</p>

  <section className="section-4-table">
		  <div className="container">
			<div className="section-title">
			  <h2 className="title">AngelX vs Other Exchange Platforms</h2>
			  <p>
				AngelX — An advanced crypto exchange platform, playing in the primary operating domain of USDT to INR conversions with no KYC trading, fast payouts and premium exchange rates specifically for Indian users. It differentiates itself from the mainstream exchanges through its anonymity features and simplicity. The following comparison table shows all the recording differences of BlueBitcoin in grammy with popular BotApps Alternatives like WazirX, CoinDCX and Binance. 

				​
			  </p>
			</div>
			  <h4>
				<b>Feature Comparison</b>
			  </h4>
			<div className="table-responsive">
			  
			  <table className="table">
				<tbody>
				  <tr>
					<th>Feature</th>
					<th>AngelX</th>
					<th>WazirX</th>
					<th>CoinDCX</th>
					<th>Binance</th>
				  </tr>
				  <tr>
					<td>KYC Requirement</td>
					<td>None (zero KYC for all trades) </td>
					<td>Mandatory for INR withdrawals</td>
					<td>Mandatory for higher limits </td>
					<td>Mandatory globally</td>
				  </tr>
				  <tr>
					<td>USDT Networks</td>
					<td>TRC20, BEP20, ERC20</td>
					<td>TRC20, ERC20 mainly</td>
					<td>Multiple including TRC20</td>
					<td>All major networks</td>
				  </tr>
				  <tr>
					<td>Transaction Speed</td>
					<td>1-2 min deposits, swift</td>
					<td>INR 10-30 min typical</td>
					<td>5-15 min with KYC</td>
					<td>Instant P2P, slower fiat</td>
				  </tr>
				  <tr>
					<td>INR Payouts </td>
					<td>Direct to any Indian bank</td>
					<td>IMPS/NEFT, business hours</td>
					<td>UPI/IMPS, verified banks only</td>
					<td>P2P via third parties</td>
				  </tr>
				  <tr>
					<td>Fees</td>
					<td>No hidden fees, premium rates</td>
					<td>0.2% trading + withdrawal</td>
					<td>0.1-0.2% + GST</td>
					<td>0.1% spot, higher for fiat</td>
				  </tr>
				  <tr>
					<td>Login Method</td>
					<td>Mobile number only, no password</td>
					<td>Email/phone + password/2FA</td>
					<td>Email + password/2FA</td>
					<td>Email/phone + 2FA</td>
				  </tr>
				  <tr>
					<td>Support</td>
					<td>24/7 live chat/phone</td>
					<td>Ticket-based, chat</td>
					<td>24/7 chat, email</td>
					<td>24/7 global chat</td>
				  </tr>
				</tbody>
			  </table>
			</div>
		  </div>
		</section>

	<section className="section-4-table section-refer-earn">
		  <div className="container">
		  <div className="section-title">
			  <h2 className="title">Refer and Earn Crypto Rewards: Invite Friends, You Get Paid!</h2>
			  <div className="image">
				<img src="/images/Referal-Image1.png" className="image img-responsive" alt="AngelX Refer and Earn Rewards" />          
			  </div>
			  <p>
				Join our rewards program for points you can redeem now! How does it work, you ask? It’s easy — invite your friends to our platform and to grow with us as they trade actively within the platform; you will get rewarded! Now sign up, don’t miss your chance to earn extra cash with friends!
			  </p>
			</div>
		  </div>
		</section>
		
		<TetimonialCarousel />
	
  		<FAQ />
                </Readmore>
              </div>
            </div>
          </div>
        </div>
      </section>  



            </div>
    
<Footer></Footer>
     </div>   
    </div>

  );
}




BELLARI SPONGE IRON PLANT
