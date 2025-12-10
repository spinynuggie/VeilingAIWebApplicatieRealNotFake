// src/components/ProductForm/index.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { InteractiveButton } from "./interactiveButton";
import { styles } from "./styles";

// --- TYPES ---
export interface ProductData {
  name: string;
  description: string;
  quantity: number | "";
  price: string;
  specifications: string[];
  image: string; // Keeping it as String URL
}

interface ProductFormProps {
  formData: ProductData;
  setFormData: React.Dispatch<React.SetStateAction<ProductData>>;
}

export default function ProductForm({ formData, setFormData }: ProductFormProps) {
  const [isAddingSpec, setIsAddingSpec] = useState(false);
  const [newSpecValue, setNewSpecValue] = useState("");

  // --- HANDLERS ---
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d*(\.\d{0,2})?$/.test(val)) {
      setFormData((prev) => ({ ...prev, price: val }));
    }
  };

  const handleQuantityButton = (amount: number) => {
    setFormData((prev) => {
      const currentValue = prev.quantity === "" ? 0 : prev.quantity;
      const newValue = Math.max(0, currentValue + amount);
      return { ...prev, quantity: newValue };
    });
  };

  const handleQuantityInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      setFormData((prev) => ({ ...prev, quantity: "" }));
      return;
    }
    const val = parseInt(e.target.value);
    setFormData((prev) => ({
      ...prev,
      quantity: isNaN(val) ? 0 : Math.max(0, val),
    }));
  };

  const preventInvalidIntegerInput = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault();
  };

  const preventInvalidPriceInput = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
  };

  const saveSpecification = () => {
    if (newSpecValue.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        specifications: [...prev.specifications, newSpecValue.trim()],
      }));
      setNewSpecValue("");
      setIsAddingSpec(false);
    }
  };

  const handleSpecKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveSpecification();
    }
  };

  const removeSpecification = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Product opgeslagen:", formData);
    // Here you would add your API call
  };

  // --- RENDER ---
  return (
    <form style={styles.card} onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Naam Product..."
        value={formData.name}
        onChange={handleChange}
        style={styles.titleInput}
      />

      <div style={styles.mainContent}>
        {/* LEFT COLUMN */}
        <div style={styles.columnLeft}>

          <label style={styles.label}>Afbeelding URL</label>
          <input
            type="text"
            name="image"
            placeholder="https://..."
            value={formData.image}
            onChange={handleChange}
            style={{...styles.titleInput, marginBottom: "15px", fontSize: "14px"}}
          />

          <div style={styles.imagePreviewBox}>
            {formData.image ? (
              <img
                src={formData.image}
                alt="Preview"
                style={styles.previewImage}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <span>Preview...</span>
            )}
          </div>

          <label style={styles.label}>Aantal Product</label>
          <div style={styles.quantityWrapper}>
            <InteractiveButton type="button" onClick={() => handleQuantityButton(-1)} baseStyle={styles.btnSmall}>-</InteractiveButton>
            <input
              type="number"
              value={formData.quantity}
              onChange={handleQuantityInput}
              onKeyDown={preventInvalidIntegerInput}
              style={styles.quantityInput}
            />
            <InteractiveButton type="button" onClick={() => handleQuantityButton(1)} baseStyle={styles.btnSmall}>+</InteractiveButton>
          </div>

          <label style={styles.label}>Maximum Prijs</label>
          <div style={styles.priceWrapper}>
            <span style={styles.currencySymbol}>€</span>
            <input
              type="text"
              inputMode="decimal"
              name="price"
              value={formData.price}
              onChange={handlePriceChange}
              onKeyDown={preventInvalidPriceInput}
              style={styles.priceInput}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={styles.columnRight}>
          <label style={styles.label}>Beschrijving</label>
          <textarea
            name="description"
            placeholder="Beschrijving..."
            value={formData.description}
            onChange={handleChange}
            style={styles.textarea}
          />

          <label style={styles.label}>Product Specificaties</label>
          <ul style={styles.specList}>
            {formData.specifications.length === 0 && <li style={{ color: "#666", fontStyle: "italic", marginBottom: "10px" }}>Nog geen specificaties...</li>}
            {formData.specifications.map((spec, index) => (
              <li key={index} style={styles.specItem}>
                <div style={{display: 'flex', alignItems: 'center'}}><span style={styles.specBullet}>•</span><span>{spec}</span></div>
                <InteractiveButton type="button" onClick={() => removeSpecification(index)} baseStyle={styles.removeSpecBtn}>✕</InteractiveButton>
              </li>
            ))}
          </ul>

          {isAddingSpec ? (
            <div style={styles.specInputWrapper}>
              <input autoFocus type="text" value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)} onKeyDown={handleSpecKeyDown} placeholder="Typ specificatie..." style={styles.specTextInput} />
              <InteractiveButton type="button" onClick={saveSpecification} baseStyle={{...styles.specActionBtn, backgroundColor: '#90B498'}}>✓</InteractiveButton>
              <InteractiveButton type="button" onClick={() => setIsAddingSpec(false)} baseStyle={{...styles.specActionBtn, backgroundColor: '#ffb3b3'}}>✕</InteractiveButton>
            </div>
          ) : (
            <InteractiveButton type="button" onClick={() => setIsAddingSpec(true)} baseStyle={styles.addSpecBtn}><span style={{ fontSize: "18px", marginRight: "10px" }}>+</span> Specificatie toevoegen</InteractiveButton>
          )}

          <div style={{ marginTop: "auto", display: "flex", justifyContent: "center", paddingTop: "30px" }}>
            <InteractiveButton type="submit" baseStyle={styles.submitBtn}>Product Aanmaken</InteractiveButton>
          </div>
        </div>
      </div>
    </form>
  );
}
