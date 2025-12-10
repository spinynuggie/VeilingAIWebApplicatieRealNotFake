"use client";

import React, { CSSProperties, useState, useEffect } from "react";

export interface ProductCardData {
  name?: string;
  description?: string;
  image?: string | File | null;
  specifications?: string[];
  price?: string | number;

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

  // HIER IS DE LOGICA AANGEPAST
  const handleActionClick = () => {
    if (onAction) {
        if (mode === 'create') {
            // IN CREATE MODE: Gebruik de prijs uit het formulier (de prop)
            // We hoeven niet meer in een lokaal inputveld te kijken.
            const priceFromForm = product.price || product.huidigeprijs || 0;
            const val = typeof priceFromForm === 'string' ? parseFloat(priceFromForm) : Number(priceFromForm);

            onAction(isNaN(val) ? 0 : val);
        } else {
            // IN AUCTION MODE: Gebruik wel het lokale inputveld (voor het bod)
            const val = parseFloat(inputValue);
            if(isNaN(val)) {
                alert("Vul een geldig bedrag in");
                return;
            }
            onAction(val);
        }
    }
  };

  if (!product) {
    return <div>Loading product…</div>;
  }

  const displayTitle = product.name || product.productNaam || "Product Naam";
  const displayDesc = product.description || product.productBeschrijving || "Geen beschrijving beschikbaar.";

  // De prijs om te tonen (uit formulier of DB)
  const displayPrice = product.price || product.huidigeprijs;

  const rawImage = product.image || product.fotos;
  const getImageUrl = (img: string | File | null | undefined) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
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

      {/*
         PRIJS DISPLAY
         Dit toont de prijs die je in het formulier (links) hebt ingevuld.
      */}
      <div style={{ marginBottom: "15px" }}>
        <div style={styles.priceDisplay}>
           € {displayPrice || "0.00"}
        </div>
      </div>

      <div style={styles.buttonGroup}>
        {mode === 'display' ? (
            <div></div>
        ) : mode === 'auction' ? (
            // Veiling Modus: Wel input nodig om te bieden
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
            // Create Modus: GEEN input meer, alleen de knop.
            // De prijs staat al in het groene blok hierboven.
            <button style={styles.btnDark} onClick={handleActionClick}>
                Aanmaken
            </button>
        )}
      </div>
    </div>
  );
}
