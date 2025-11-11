"use client";
import React, { useState } from "react";
import Image from "next/image";
import './page.css';
import Link from "next/link";
import royalLogo from "@/public/loginAssets/royalLogo.svg";


export default function Landing() {
  return (
    
    <div>
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
      {/* Topbar: groen balk met logo links en gecentreerde zoekbalk */}
      <div className="topbar">
        <div className="topbar-left">
          <Link href="/" legacyBehavior>
            <a className="logo-link">
              <Image src={royalLogo} alt="Royal FloraHolland" width={140} height={48} className="top-logo" />
            </a>
          </Link>
        </div>

        <div className="topbar-center">
          <form className="search-container" onSubmit={(e) => { e.preventDefault(); /* later: handle search */ }} role="search">
            <input
              className="search-input"
              type="text"
              placeholder="Zoek naar producten..."
            />
            <button className="search-button" type="submit" aria-label="Zoeken">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
        </div>

        <div className="topbar-right" />
      </div>

      
        <h1>thuis pagina voor de klant</h1>
    </div>
  );
}
