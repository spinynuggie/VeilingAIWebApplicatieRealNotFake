import React from 'react';
import './Landing.css';
import royalLogo from "../assets/loginAssets/royalLogo.svg";


const Testing: React.FC = () => {
  return (
   <div>
      <header className="header">
        <div className="header-left">
          <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {/*Person icon toevoegen */}
          </svg>
          <a href="/Login" className="header-left-link">
            Inloggen
          </a>
          <span className="separator">of</span>
          <a href="/Register" className="header-left-link">
            registreren
          </a>
        </div>
        <div className="header-right">
          <a href="#" className="header-link">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {/*Nieuws icon toevoegen */}
            </svg>
            <span>Nieuws</span>
          </a>

          <a href="#" className="header-link">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {/*Werken bij icon toevoegen */}
              </svg>
            <span>Werken bij</span>
          </a>
        </div>
      </header>

      <main className="hero-section">
        <div className="logo">
              <img
                src={royalLogo}
                alt="Royal FloraHolland Logo">
              </img>
        </div>

        <h1 className="hero-title">
          De grootste<br />
          internationale<br />
          sierteeltmarktplaats
        </h1>

        <button className="cta-button">
          Meer informatie
        </button>
      </main>
    </div>
  );
};

export default Testing;
