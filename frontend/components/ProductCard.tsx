"use client";

import React, { CSSProperties } from "react";
import { ProductData } from "./ProductForm";

interface ProductCardProps {
  product: ProductData;
}

export default function ProductCard({ product }: ProductCardProps) {
  const styles: { [key: string]: CSSProperties } = {
    card: {
      backgroundColor: "#D1FADF",
      borderRadius: "15px",
      padding: "25px",
      width: "350px",
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
      minHeight: "29px", 
    },
    imagePlaceholder: {
      backgroundColor: "#90B498",
      width: "100%",
      height: "200px",
      borderRadius: "10px",
      marginBottom: "20px",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    previewImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    description: {
      fontSize: "14px",
      lineHeight: "1.4",
      marginBottom: "15px",
      minHeight: "40px",
    },
    divider: {
      border: "none",
      borderTop: "2px solid #90B498",
      margin: "0 0 15px 0",
      width: "100%",
    },
    specTitle: {
      fontWeight: "bold",
      fontSize: "14px",
      marginBottom: "5px",
    },
    specList: {
      margin: "0 0 30px 20px",
      padding: 0,
      fontSize: "14px",
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "space-between",
      gap: "10px",
      marginTop: "auto",
    },
    btnLight: {
      backgroundColor: "#AEDCB8",
      border: "none",
      borderRadius: "8px",
      padding: "10px 0",
      fontSize: "16px",
      flex: 1,
      cursor: "pointer",
      textAlign: "center",
    },
    btnDark: {
      backgroundColor: "#90B498",
      border: "none",
      borderRadius: "8px",
      padding: "10px 15px",
      fontSize: "16px",
      cursor: "pointer",
      flex: 1.2,
      textAlign: "center",
    },
    infoBox: {
      backgroundColor: "#AEDCB8",
      borderRadius: "8px",
      padding: "10px 5px",
      fontSize: "16px",
      flex: 1,
      textAlign: "center",
      fontWeight: "bold",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      display: "flex", 
      alignItems: "center",
      justifyContent: "center",
    },
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>{product.name || "Product Naam"}</h2>

      <div style={styles.imagePlaceholder}>
        {product.image ? (
          <img
            src={URL.createObjectURL(product.image)}
            alt="Product"
            style={styles.previewImage}
          />
        ) : (
          <span style={{color: 'white'}}>Geen afbeelding</span>
        )}
      </div>

      <p style={styles.description}>
        {product.description || "Hier komt een uitgebreide omschrijving van het product..."}
      </p>

      <hr style={styles.divider} />

      <div style={styles.specTitle}>Product specificaties</div>
      <ul style={styles.specList}>
        {product.specifications.length > 0 ? (
          product.specifications.map((spec, index) => (
            <li key={index}>{spec}</li>
          ))
        ) : (
          <>
          <li>Geen Specificaties Toegevoegd</li>
          </>
        )}
      </ul>
      
      <div style={styles.buttonGroup}>
        <div style={styles.infoBox}>
          {product.price ? `€ ${product.price}` : "Max"}
        </div>
        <div style={styles.infoBox}>
          Min
        </div>       
        <button style={styles.btnDark}>Toevoegen</button>
      </div>
    </div>
  );
}




