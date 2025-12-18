"use client";

import React from "react";

type NavbarProps = {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
  style?: React.CSSProperties;
};

export default function Navbar({ left, center, right, style }: NavbarProps) {
  return (
    <>
      <nav className="navbar" style={style}>
        <div className="navbar-left">{left}</div>
        <div className="navbar-center">{center}</div>
        <div className="navbar-right">{right}</div>

      </nav>

      <style jsx>{`
        .navbar {
          display: flex;
          width: 100%;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background: #fff;
          border-bottom: 2px solid #d5d5d5;
        }

        .navbar-left,
        .navbar-center,
        .navbar-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .navbar-center {
          flex: 1;
          justify-content: center;
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

          .navbar {
            flex-direction: column;
            gap: 0.5rem;
          }

          .navbar-center {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
