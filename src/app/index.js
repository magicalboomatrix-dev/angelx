'use client'
import React, { useCallback, useEffect, useState } from 'react';
import Image from "next/image";
import Link from 'next/link';

import Readmore from "./components/Readmore";
import Footer from './components/footer';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [rate, setRate] = useState(0);
  
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const fetchRate = useCallback(async () => {
    try {
      const res = await fetch('/api/limits');
      if (!res.ok) {
        setRate(0);
        return;
      }

      const data = await res.json();
      setRate(data.rate || 0);
    } catch {
      setRate(0);
    }
  }, []);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  const [timeLeft, setTimeLeft] = useState(52);
  
  useEffect(() => {
    if (!mounted) return;
    
    if (timeLeft <= 0) {
      // window.location.reload(); // Commented out for performance optimization. Consider re-fetching data instead of full page reload.
      fetchRate();
      setTimeLeft(52); // Reset timer to continue countdown without reloading page
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer); 
  }, [timeLeft, mounted, fetchRate]);

  const [showAppLink, setShowAppLink] = useState(true);
 
  return (   
    <div>
      <div className="page-wrappers">
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
                  <img alt="Logo" className="logo" src="/images/logo-icon.png" />
                  <h1 className="title-left">AngelX</h1>
                </div>
            </div>
            <div className="right">
            <a href="https://vm.nebestbox.com/1jgm3swhyv8jv09qrr9q3o7lgp">
                <Image                
                src="/images/customer-care-icon.png"
                alt="customer"
                width={24}
                height={24}
                priority
                /></a>
            </div>
        </header>

        <div className="page-wrapper" style={{paddingTop: '2px', marginTop: '0px'}}>
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
                alt="angelx"
                width={96}
                height={96}
                priority
                />
                </div>
                </div>
                <div className="right">
                <div className="info">
                    <h3>Get started in seconds</h3>
                    <p>Whether you’re a beginner or an expert, angelx makes it easy to get started without any professional knowledge.</p>
                </div>
                </div>
                </div>
                
                <div className="bx">
                <div className="left">
                <div className="image">
                <Image                
                src="/images/boost.png"
                alt="angelx"
                width={96}
                height={96}
                priority
                />
                </div>
                </div>
                <div className="right">
                <div className="info">
                    <h3>Boost your yields</h3>
                    <p>Every transaction with angelx unlocks the potential for huge profits, enabling every user to thrive as the platform grows.</p>
                </div>
                </div>
                </div>
                
                <div className="bx">
                <div className="left">
                <div className="image">
                    <Image                
                    src="/images/access.png"
                    alt="angelx"
                    width={96}
                    height={96}
                    priority
                    />
                </div>
                </div>
                <div className="right">
                <div className="info">
                    <h3>Acess expert knowledge</h3>
                    <p>Ensure every user on angelx can earn profits on the platform, regardless of how much money they have.</p>
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
      alt="Logo" 
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
      <div className="priceref">
        <p>
          Automatic refresh after{" "}
          <span className="ref">
            {timeLeft}s
          </span>
        </p>
      </div>
      <div className="reff-price">
        <div className="base-price">
          <h4>
            {rate} <span>Base</span>
          </h4>
        </div>
        <p className="onepriceex">1 USDT = ₹{rate}</p>
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
                alt="matic"
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
                alt="eos"
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
                alt="dot"
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
                alt="usdt"
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
                alt="doge"
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
                alt="btc"
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
                alt="sol"
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
                alt="ton"
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
                alt="avax"
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
                alt="bnb"
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
                alt="xrp"
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
                alt="eth"
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
                alt="link"
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
                alt="trx"
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
                alt="ada"
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
                alt="ftm"
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
                  The Ultimate Guide to Satta King: Gambling Culture Nurtured In
                  India and Its Impact on Society
                </h1>
              </div>
            </div>
            <div className="col-right">
              <div className="content">
                <p>
                  Welcome to b7 Satta, the most informative sike about SATTA
                  KING. In this guide, you will find a complete overview of the
                  Satta King game, its history, gameplay style, leading markets
                  and what players need to know in order to play it safely and
                  responsibly.
                </p>
                <h2>What is Satta King?</h2>
                <p>
                  Satta King is an online game, where you can also stand a
                  chance to win with the help of betting. It is a kind of
                  lottery or gambling on the last two to four digits of selected
                  numbers at predetermined intervals. The word <b>“Satta”</b>{" "}
                  usually means betting or gambling and <b>“King”</b> is the
                  term which refers to the person who gets triumph in a match.
                </p>

                <Readmore>
                  <p>
                    Satta King has its roots in the older systems of lotteries,
                    but it is now the most popular game with a number of
                    variants and regional platforms. It delivers the excitement
                    of gambling and chance to win big prizes, but all on a
                    screen and from modest starting bets.
                  </p>

                  <h2>The Historical Background of Satta King</h2>

                  <p>
                    SattaKing game started in the middle of 20th century. It
                    derived from a game called <b>“Matka,”</b> originating back
                    in the times when people would place money on the
                    opening/closing rate of cotton, which was then transmitted
                    to the Bombay Cotton exchange from New York. The game was
                    brought to India where it developed into various regional
                    forms. Matka gained widespread popularity in cities such as
                    approximately Mumbai and Delhi.{" "}
                  </p>

                  <p>
                    Matka gambling was the game at first, but when it was
                    banned, people continued playing this kind of gambling which
                    has evolved to ‘Satta’ King today. The game eventually
                    spread to other cities and became associated with different
                    markets (or “bazaars”), each with its own timing and winning
                    numbers.
                  </p>

                  <p>
                    Satta King receives widespread participation despite legal
                    limitations, with players anxiously anticipating the results
                    of daily draws that reveal winners. The game has since
                    migrated in many places to the internet, which explains why
                    you get results or other way of playing quicker than before.
                  </p>

                  <h2>How to Play Satta King?</h2>
                  <p>
                    Satta King is so simple to play, however you should be quite
                    careful also. Here’s a simplified explanation:
                  </p>

                  <h3>Choosing Numbers</h3>
                  <p>
                    Participants choose a number from 0 to 99. These numbers can
                    also be selected, subsequently, individually but are usually
                    taken in pairs (Jodi), triples ("Panna") or as back and
                    close pair. There are various kinds of bet with different
                    payout rates and odds.
                  </p>

                  <h3>Placing Bets</h3>
                  <p>
                    How to play Players can bet on numbers via operators or
                    their agents, or by using online apps. Lakhani said the
                    amount bet is small— 10 or 50, “but one wins many times the
                    money if it comes through.
                  </p>

                  <h3>Declaring Results</h3>
                  <p>
                    Every Satta market have daily or weekly draws where they
                    open a number and get declared winner. Results are declared
                    at fixed times—Delhi Bazar at a particular hour, Disawar and
                    Faridabad also at different hours.
                  </p>

                  <h3>Winning and Payouts</h3>
                  <p>
                    If the player’s selected number corresponds to the winning
                    number announced for that draw, then the player wins.
                    Payouts may be between 90 –960 times the value of the
                    original bet or more, depending on both the type of bet and
                    market.
                  </p>

                  <h3>Popular Satta King Markets</h3>
                  <p>
                    Satta King isn’t just one game but a lot of betting markets
                    found in the Indian subcontinent. Every market will have
                    unique draws and times, along with its own rules and
                    results. Here are some of the most popular markets:
                  </p>

                  <p>
                    <b>Delhi Bazar Satta:</b> Among the oldest and most famous
                    markets, which has daily draw2.
                  </p>
                  <p>
                    <b>Disawar Satta:</b> It is famous for high popularity among
                    the players and daily draws.
                  </p>
                  <p>
                    <b>Faridabad Satta:</b> New market that is gaining
                    popularity.
                  </p>
                  <p>
                    <b>Ghaziabad Satta:</b> Well known for frequent updates and
                    player engagement.
                  </p>
                  <p>
                    <b>Gali Satta Market:</b> A market known for its different
                    draw time.
                  </p>
                  <p>
                    There is a separate website or portal for each market, where
                    players can go see the results, and players also use apps or
                    websites like b7 Satta to get real-time updates.
                  </p>

                  <h3>Understanding the Risks and Cautions</h3>
                  <p>
                    Satta King can be fun and rewarding, but it also comes with
                    a lot of risk:
                  </p>
                  <p>
                    <b>Economic risk:</b>a The higher risk players will lose
                    money as the house always has an edge against the gambler.
                    The amount you can lose should be your bottom line when
                    gambling.
                  </p>
                  <p>
                    <b>Addiction:</b> The speed of the game and potential for
                    high rewards can create a cycle of compulsive gambling.
                  </p>
                  <p>
                    <b>Legal FAQs:</b> Satta King is not a legal lottery system
                    or gambling option in most Indian states and playing it or
                    betting on it can have serious legal impacts as well.
                  </p>
                  <p>
                    <b>Trust Issues:</b> The game is mainly run underground or
                    unofficially, players need to watch out for scam sites and
                    fraud operators.
                  </p>
                  <p>
                    At b7 Satta, we offer the counsel of verified fruits and
                    teachings; we do not support issue nor do get to tell that
                    you to issues.
                  </p>

                  <h3>Role of Platforms Like b7 Satta</h3>
                  <p>Platforms like b7 Satta are important because they:</p>
                  <p>
                    <b>Verified Results:</b> Fast, instant publishing of lottery
                    draw results to reduce misinformation.
                  </p>
                  <p>
                    <b>Historical Data:</b> The Secret Powerball Technique also
                    give players access to the archived winning numbers from
                    previous drawings, and charts that allow them see the
                    winning patterns.
                  </p>
                  <p>
                    <b>Real-time Push Alerts:</b> You will never miss a single
                    point, game or set in tennis; now it is up to you!
                  </p>
                  <p>
                    <b>Player Education:</b> Providing tips, strategies and
                    responsible gaming information so players can make informed
                    decisions.
                  </p>
                  <p>
                    <b>Privacy and Security Assured:</b> All user data is kept
                    confidential and protected from abuse.
                  </p>

                  <h3>Tips for Responsible Engagement</h3>
                  <p>
                    Stick to an amount that you are willing to wager and never
                    go beyond it.
                  </p>
                  <p>Never play to win back what you have lost.</p>
                  <p>
                    Occasional breaks: It doesn't hurt to step away from the
                    game.
                  </p>
                  <p>— Get help for gambling addiction if you suspect it.</p>
                  <p>
                    Know and respect the laws of your area with regards to
                    gambling.
                  </p>

                  <h3>Conclusion</h3>
                  <p>
                    Satta king is still a game of luck for the people across
                    India. It may be entertaining and have the potential for
                    monetary rewards but it should always be played responsibly,
                    informed, and with a level head. ABOUT US b7 Satta is run
                    and managed by the best satta company in India, with an
                    experience of 40 long years.
                  </p>

                  <p>
                    And let’s be clear – gambling should not be your plan A in
                    terms of income or investment. Remember to always play
                    responsibly, be in the know and come for updates on Satta
                    King at reliable sources.
                  </p>
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






























