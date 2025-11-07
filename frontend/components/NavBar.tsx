
"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <>
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

      <style jsx>{`
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

        @media (max-width: 768px) {
          .navbar-right {
            gap: 1rem;
          }
        }
      `}</style>
    </>
  );
}
