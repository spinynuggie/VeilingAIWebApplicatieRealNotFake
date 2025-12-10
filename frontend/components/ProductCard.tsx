"use client";

import React, { CSSProperties, useState, useEffect } from "react";

// We breiden de interface uit zodat hij OOK de database velden herkent
export interface ProductCardData {
  // De velden die je component al had
  name?: string;
  description?: string;
  image?: string | File | null;
  specifications?: string[];
  price?: string | number;

  // De velden die uit jouw DATABASE komen (toegevoegd)
  productNaam?: string;
  productBeschrijving?: string;
  huidigeprijs?: number;
  fotos?: string;
}

interface ProductCardProps {
  product: ProductCardData;
  mode: 'auction' | 'create' | 'display';
  onAction?: (priceValue: number) => void;
}

export default function ProductCard({ product, mode, onAction }: ProductCardProps) {
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    setInputValue("");
  }, [product]);

  const handleActionClick = () => {
    if (onAction) {
        const val = parseFloat(inputValue);
        if(isNaN(val)) {
            alert("Vul een geldig bedrag in");
            return;
        }
        onAction(val);
    }
  };

  // --- MAPPING LOGICA ---
  // Hier kiezen we: "Hebben we 'title'? Nee? Pak dan 'productNaam'."
  if (!product) {
  return <div>Loading product…</div>;
  }
  const displayTitle = product.name || product.productNaam || "Product Naam";
  const displayDesc = product.description || product.productBeschrijving || "Geen beschrijving beschikbaar.";

  // Afbeelding
  const rawImage = product.image || product.fotos;

  const getImageUrl = (img: string | File | null | undefined) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    // Check of het een File object is (voor create mode)
    if (img instanceof File) return URL.createObjectURL(img);
    return null;
  };

  const imageUrl = getImageUrl(rawImage);

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
      minHeight: "500px",
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
      minHeight: "60px",
      whiteSpace: "pre-wrap"
    },
    divider: {
      border: "none",
      borderTop: "2px solid #90B498",
      margin: "0 0 15px 0",
      width: "100%",
    },
    specList: {
      margin: "0 0 30px 20px",
      padding: 0,
      fontSize: "14px",
      flexGrow: 1,
    },
    buttonGroup: {
      display: "flex",
      justifyContent: "space-between",
      gap: "10px",
      marginTop: "auto",
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
      color: 'white',
      fontWeight: 'bold'
    },
    inputBox: {
      backgroundColor: "#AEDCB8",
      border: "1px solid #90B498",
      borderRadius: "8px",
      padding: "10px 5px",
      fontSize: "16px",
      flex: 1,
      textAlign: "center",
      fontWeight: "bold",
      width: "60px",
    },
    infoBox: {
        backgroundColor: "#AEDCB8",
        borderRadius: "8px",
        padding: "10px 5px",
        fontSize: "16px",
        flex: 1,
        textAlign: "center",
        fontWeight: "bold",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#555'
    },
    priceDisplay: {
        backgroundColor: "#90B498",
        borderRadius: "8px",
        padding: "12px",
        textAlign: "center",
        fontWeight: "bold",
        color: "white",
        fontSize: "18px",
        width: "100%"
    }
  };

  return (
    <div style={styles.card}>
    {/* GEBRUIK HIER DE display VARIABELEN */}
      <h2 style={styles.title}>{displayTitle}</h2>

      <div style={styles.imagePlaceholder}>
        {imageUrl ? (
          <img src={imageUrl} alt="Product" style={styles.previewImage} />
        ) : (
          <span style={{color: 'white'}}>Geen afbeelding</span>
        )}
      </div>

      <p style={styles.description}>
        {displayDesc}
      </p>

      <hr style={styles.divider} />

      <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "5px" }}>
        Product specificaties
      </div>
      <ul style={styles.specList}>
        {product.specifications && product.specifications.length > 0 ? (
          product.specifications.map((spec, index) => (
            <li key={index}>{spec}</li>
          ))
        ) : (
          <li>Geen Specificaties</li>
        )}
      </ul>

      <div style={styles.buttonGroup}>
        {mode === 'display' ? (
            <div>
            </div>
        ) : mode === 'auction' ? (
            <>
                <input
                    style={styles.inputBox}
                    placeholder="Bod"
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <button style={styles.btnDark} onClick={handleActionClick}>
                    Bieden
                </button>
            </>
        ) : (
            <>
                <div style={styles.infoBox}>Max</div>
                <input
                    style={styles.inputBox}
                    placeholder="Min"
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
                <button style={styles.btnDark} onClick={handleActionClick}>
                    Aanmaken
                </button>
            </>
        )}
      </div>
    </div>
  );
}


