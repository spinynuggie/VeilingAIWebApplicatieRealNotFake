"use client";
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

      <style jsx>{`
        .container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(to bottom, #d4f1d4, #e8f5e8);
          font-family: 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          color: #2d5f3f;
        }

        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: #fff;
          border-bottom: 2px solid #d5d5d5;
        }

        .navbar-left, .navbar-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .navbar-right {
          gap: 2rem;
        }

        .navbar-left-link,
        .navbar-link {
          color: #2d5f3f;
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.3s ease, text-decoration 0.3s ease;
        }

        .navbar-left-link:hover,
        .navbar-link:hover {
          color: #234a32;
          text-decoration: underline;
        }

        .icon {
          width: 24px;
          height: 24px;
        }

        .hero-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 4rem 2rem;
        }

        .logo {
          margin-bottom: 4rem;
        }

        .logo-img :global(img) {
          height: auto;
          width: auto;
        }

        .hero-title {
          font-size: 4.5rem;
          font-weight: 700;
          color: #000;
          line-height: 1.2;
          margin-bottom: 3rem;
          max-width: 1000px;
        }

        .cta-button {  
          background-color: #2d5f3f;
          color: #fff;
          padding: 1rem 3rem;
          font-size: 1.1rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .cta-button:hover {
          background-color: #21492f;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .navbar-right {
            gap: 1rem;
          }

          .logo-img :global(img) {
            height: 60px;
          }
        }
      `}</style>
    </div>
  );
}
