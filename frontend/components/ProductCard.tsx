"use client";

import React, { CSSProperties } from "react";

export default function ProductCard() {
  // --- STYLES ---
  const styles: { [key: string]: CSSProperties } = {
    card: {
      backgroundColor: "#D1FADF", // De lichte achtergrondkleur
      borderRadius: "15px",
      padding: "25px",
      width: "350px", // Vaste breedte zoals een kaartje
      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
      fontFamily: "Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      color: "#000",
    },
    title: {
      textAlign: "center",
      fontSize: "24px",
      fontWeight: "bold",
      margin: "0 0 20px 0",
    },
    imagePlaceholder: {
      backgroundColor: "#90B498", // De donkere groene kleur
      width: "100%",
      height: "200px",
      borderRadius: "10px",
      marginBottom: "20px",
    },
    description: {
      fontSize: "14px",
      lineHeight: "1.4",
      marginBottom: "15px",
    },
    divider: {
      border: "none",
      borderTop: "2px solid #90B498", // Lijn kleur
      margin: "0 0 15px 0",
      width: "100%",
    },
    specTitle: {
      fontWeight: "bold",
      fontSize: "14px",
      marginBottom: "5px",
    },
    specList: {
      margin: "0 0 30px 20px", // Beetje ruimte links voor bullets
      padding: 0,
      fontSize: "14px",
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "space-between",
      gap: "10px",
      marginTop: "auto", // Duwt de knoppen naar beneden
    },
    btnLight: {
      backgroundColor: "#AEDCB8", // Iets lichtere groen voor Min/Max
      border: "none",
      borderRadius: "8px",
      padding: "10px 0",
      fontSize: "16px",
      flex: 1, // Zorgt dat ze even breed zijn
      cursor: "pointer",
      textAlign: "center",
    },
    btnDark: {
      backgroundColor: "#90B498", // Donkere groen voor Toevoegen
      border: "none",
      borderRadius: "8px",
      padding: "10px 15px",
      fontSize: "16px",
      cursor: "pointer",
      flex: 1.2, // Iets breder dan de andere twee
      textAlign: "center",
    },
  };

  return (
    <div style={styles.card}>
      {/* Titel */}
      <h2 style={styles.title}>Product Naam</h2>

      {/* Afbeelding Placeholder */}
      <div style={styles.imagePlaceholder}></div>

      {/* Omschrijving */}
      <p style={styles.description}>
        Hier komt een uitgebreide omschrijving van het product. indien deze mee is
        gegeven kan je hier alle extra informatie bekijken om meer uit te vinden
        over het product.
      </p>

      {/* Lijn */}
      <hr style={styles.divider} />

      {/* Specificaties */}
      <div style={styles.specTitle}>Product specificaties</div>
      <ul style={styles.specList}>
        <li>info</li>
        <li>info</li>
        <li>info</li>
        <li>info</li>
        <li>etc..</li>
      </ul>

      {/* Knoppen onderaan */}
      <div style={styles.buttonGroup}>
        <button style={styles.btnLight}>Max</button>
        <button style={styles.btnLight}>Min</button>
        <button style={styles.btnDark}>Toevoegen</button>
      </div>
    </div>
  );
}