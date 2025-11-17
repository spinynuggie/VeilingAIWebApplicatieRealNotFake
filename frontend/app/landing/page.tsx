"use client";
import Image from "next/image";
import Link from "next/link";
import royalLogo from "@/public/loginAssets/royalLogo.svg";
import AppNavbar from "@/components/AppNavbar";

export default function Landing() {
  return (

      <div className="container">
        <AppNavbar />


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
