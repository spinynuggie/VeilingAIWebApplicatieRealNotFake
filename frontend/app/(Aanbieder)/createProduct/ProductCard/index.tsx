// src/components/ProductCard/index.tsx
"use client";

import React, { useState, useEffect } from "react";
import { styles } from "./styles";
import { ProductCardProps } from "./types";

export default function ProductCard({ product, mode, onAction }: ProductCardProps) {
  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    setInputValue("");
  }, [product]);

  const handleActionClick = () => {
    if (onAction) {
      if (mode === 'create') {
        // Mode 1: Create - Use price from prop (form)
        const priceFromForm = product.price || product.huidigeprijs || 0;
        const val = typeof priceFromForm === 'string' ? parseFloat(priceFromForm) : Number(priceFromForm);
        onAction(isNaN(val) ? 0 : val);
      } else {
        // Mode 2: Auction - Use local input (bid)
        const val = parseFloat(inputValue);
        if (isNaN(val)) {
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

  // --- MAPPING LOGICA ---
  const displayTitle = product.name || product.productNaam || "Product Naam";
  const displayDesc = product.description || product.productBeschrijving || "Geen beschrijving beschikbaar.";
  const displayPrice = product.price || product.huidigeprijs;

  // Handle Image (String URL or File object)
  const rawImage = product.image || product.fotos;
  const getImageUrl = (img: string | File | null | undefined) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    if (img instanceof File) return URL.createObjectURL(img);
    return null;
  };
  const imageUrl = getImageUrl(rawImage);

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>{displayTitle}</h2>

      <div style={styles.imagePlaceholder}>
        {imageUrl ? (
          <img src={imageUrl} alt="Product" style={styles.previewImage} />
        ) : (
          <span style={{ color: 'white' }}>Geen afbeelding</span>
        )}
      </div>

      <p style={styles.description}>
        {displayDesc}
      </p>

      <hr style={styles.divider} />

      <div style={styles.specHeader}>
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

      {/* PRICE DISPLAY */}
      <div style={{ marginBottom: "15px" }}>
        <div style={styles.priceDisplay}>
          € {displayPrice || "0.00"}
        </div>
      </div>

      <div style={styles.buttonGroup}>
        {mode === 'display' ? (
          <div></div>
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
          // Create Mode: Just the button
          <button style={styles.btnDark} onClick={handleActionClick}>
            Aanmaken
          </button>
        )}
      </div>
    </div>
  );
}
