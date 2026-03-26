"use client";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function TetimonialCarousel() {

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    autoplaySpeed: 2000,
  };

  return (
    <div>
	<section className="section-4-table tetimonial-carousel">
	<div className="container">
		  <div className="section-title"><h2 className="title">What People Say <span className="color">About Us</span></h2>   </div>

      <Slider {...settings}>
        <div>
		  <div className="tbx">
		  <div className="desc"><p>Lightning-fast! Sold 500 USDT on TRC20, went to ICICI account in less than 30 minutes. No KYC bullshit, so good for fast trades.</p>   </div>
		  <div className="info">
		  <span className="uname">Rahul Kumar </span>
		  <span className="uimg"><img src="/images/user1-img.jpg" style={{ width: "100%" }} /> </span>
		  </div>		  
		  </div>          
        </div>
		 
        <div>
		  <div className="tbx">
		  <div className="desc"><p>Love AngelX's speed! User-friendly notifications from the app + zero delays on USDT-INR swaps Support fixed verification overnight. Transparent, secure—ideal for pros. Thumbs up!</p>   </div>
		  <div className="info">
		  <span className="uname">Amit Singh </span>
		  <span className="uimg"><img src="/images/user2-img.jpg" style={{ width: "100%" }} /> </span>
		  </div>		  
		  </div>          
        </div>
		
        <div>
		  <div className="tbx">
		  <div className="desc"><p>AngelX shines in India. P2P, same-day bank transfers without work; support ahead of the game. Robust security for large trades. Consistent—my trusted platform. Outstanding!</p>   </div>
		  <div className="info">
		  <span className="uname">Vikram Reddy</span>
		  <span className="uimg"><img src="/images/user3-img.jpg" style={{ width: "100%" }} /> </span>
		  </div>		  
		  </div>          
        </div>



      </Slider>
	   </div>
	   </section>
    </div>
  );
}
