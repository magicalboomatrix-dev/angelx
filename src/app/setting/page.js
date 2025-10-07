"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function SettingPage() {



  return (
    <div>
      <main>
        <div className="page-wrappers page-wrapper-ex home-wrapperss setting-wrapper">  
          <header className="header setting-header">
            <div className="left">
              <div className="d-flex">
              <div className="back-btn"><a href="/login"><img src="images/back-btn.png"/></a></div>
              <b>Setting</b></div>
              </div>

          </header>
      

          <div className="page-wrapper page-wrapper-ex">



            <section className="section-2 reffer">
              <div className="rw">
                <div className="bx">
                  <Link href="">
                    <div className="image">
                      <h3>
                        <img src="images/s-icon1.jpg" /> Customer service
                      </h3>
                    </div>
                    <div className="arw">
                      <img src="images/right-arw.png" />
                    </div>
                  </Link>
                </div>
                <div className="bx">
                  <Link href="">
                    <div className="image">
                      <h3>
                        <img src="images/s-icon2.jpg" /> Business coorperation
                      </h3>
                    </div>
                    <div className="arw">
                      <img src="images/right-arw.png" />
                    </div>
                  </Link>
                </div>
                <div className="bx">
                  <Link href="">
                    <div className="image">
                      <h3>
                        <img src="images/s-icon3.jpg" /> Version
                      </h3>
                    </div>
                    <div className="arw">
                      <span style={{margin:"10px"}}>v3.2.1</span> <img src="images/right-arw.png" />
                    </div>
                  </Link>
                </div>
                <div className="bx">
                  <Link href="">
                    <div className="image">
                      <h3>
                        <img src="images/s-icon4.jpg" /> Intall the official version
                      </h3>
                    </div>
                    <div className="arw">
                      <img src="images/right-arw.png" />
                    </div>
                  </Link>
                </div>
                <div className="bx">
                  <Link href="">
                    <div className="image">
                      <h3>
                        <img src="images/s-icon5.jpg" /> Reset transaction password
                      </h3>
                    </div>
                    <div className="arw">
                      <img src="images/right-arw.png" />
                    </div>
                  </Link>
                </div>
              </div>

              <button className="button-style logout">
                Logout
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
