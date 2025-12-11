"use client";

import Image from "next/image";
import royalLogo from "@/public/loginAssets/royalLogo.svg";
import dynamic from "next/dynamic";
import styles from "./landing.module.css";

// Dynamically import AppNavbar with SSR disabled
const AppNavbar = dynamic(
  () => import("@/components/AppNavbar"),
  { ssr: false, loading: () => <div style={{ height: '64px' }} /> }
);

export default function Landing() {
  return (
    <div className={styles.landingContainer}>
      <AppNavbar />

      <main className={styles.heroSection}>
        <div className={styles.logo}>
          <Image 
            src={royalLogo} 
            alt="Royal FloraHolland Logo" 
            priority 
            className={styles.logoImg} 
          />
        </div>

        <h1 className={styles.heroTitle}>
          De grootste<br />
          internationale<br />
          sierteeltmarktplaats
        </h1>

        <button className={styles.ctaButton}>Meer informatie</button>
      </main>
    </div>
  );
}
