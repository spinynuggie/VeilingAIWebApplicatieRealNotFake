"use client";
// @ts-ignore
import './page.css';
import Image from "next/image";
import Link from "next/link";
import royalLogo from "@/public/loginAssets/royalLogo.svg";

export default function Landing() {
  return (


    <div className="container">
      <nav className="navbar">
        <div className="navbar-left">
          <svg
            className="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <Link href="/login" legacyBehavior>
            <a className="navbar-left-link">Inloggen</a>
          </Link>
          <span>of</span>
          <Link href="/register" legacyBehavior>
            <a className="navbar-left-link">registreren</a>
          </Link>
        </div>

        <div className="navbar-right">
          <Link href="#" legacyBehavior>
            <a className="navbar-link flex items-center gap-1">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" />
              <span>Nieuws</span>
            </a>
          </Link>
          <Link href="#" legacyBehavior>
            <a className="navbar-link flex items-center gap-1">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" />
              <span>Werken bij</span>
            </a>
          </Link>
        </div>
      </nav>

      <main className="hero-section">
        <div className="logo">
          <Image src={royalLogo} alt="Royal FloraHolland Logo" priority className="logo-img" />
        </div>

        <h1 className="hero-title">
          De grootste<br />
          internationale<br />
          sierteeltmarktplaats
        </h1>

        <button className="cta-button">Meer informatie</button>
      </main>

      {/* styles moved to frontend/app/landing/page.css */}
    </div>
  );
}