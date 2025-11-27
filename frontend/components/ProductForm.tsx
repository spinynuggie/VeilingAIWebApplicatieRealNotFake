"use client";

import React, { useState, useRef, CSSProperties, ChangeEvent, FormEvent, KeyboardEvent } from "react";

// --- INTERACTIVE BUTTON ---
interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  baseStyle: CSSProperties;
}

const InteractiveButton: React.FC<InteractiveButtonProps> = ({ baseStyle, children, ...props }) => {
  const [isHovered, setIsHovered] = useState(false);

  const finalStyle: CSSProperties = {
    ...baseStyle,
    transition: "all 0.2s ease-in-out",
    filter: isHovered ? "brightness(0.85)" : "brightness(1)",
    transform: isHovered ? "scale(1.05)" : "scale(1)",
    cursor: "pointer",
  };

  return (
    <button
      style={finalStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </button>
  );
};

// --- TYPES ---
export interface ProductData {
  name: string;
  description: string;
  quantity: number | ""; 
  price: string;
  specifications: string[];
  image: File | null;
}

interface ProductFormProps {
  formData: ProductData;
  setFormData: React.Dispatch<React.SetStateAction<ProductData>>;
}

export default function ProductForm({ formData, setFormData }: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImageFocused, setIsImageFocused] = useState(false);
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
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
      e.preventDefault();
    }
  };

  const preventInvalidPriceInput = (e: KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
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

  const cancelSpecification = () => {
    setNewSpecValue("");
    setIsAddingSpec(false);
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

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Product opgeslagen:", formData);
  };

  // --- STYLES (Ongewijzigd) ---
  const styles: { [key: string]: CSSProperties } = {
    card: {
      backgroundColor: "#D1FADF",
      padding: "40px",
      borderRadius: "20px",
      width: "100%",
      maxWidth: "900px",
      boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
      fontFamily: "Arial, sans-serif",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
    },
    titleInput: {
      width: "100%",
      backgroundColor: "#AEDCB8",
      border: "none",
      borderRadius: "10px",
      padding: "15px",
      fontSize: "18px",
      textAlign: "center",
      fontWeight: 500,
      marginBottom: "30px",
      outline: "none",
      color: "#333",
    },
    mainContent: {
      display: "flex",
      justifyContent: "space-between",
      gap: "50px",
      width: "100%",
    },
    columnLeft: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center", 
    },
    columnRight: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
    },
    label: {
      fontWeight: "bold",
      fontSize: "18px",
      marginBottom: "15px",
      color: "#000",
      width: "100%",
    },
    imageUploadBox: {
      width: "100%", 
      backgroundColor: "#90B498",
      borderRadius: "10px",
      height: "250px", 
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      color: "white",
      outline: isImageFocused ? "4px solid #AEDCB8" : "none",
      outlineOffset: "2px",
      marginBottom: "30px",
    },
    previewImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      position: "absolute",
    },
    textarea: {
      width: "100%",
      backgroundColor: "#AEDCB8",
      border: "none",
      borderRadius: "10px",
      padding: "20px",
      fontSize: "16px",
      outline: "none",
      resize: "none",
      height: "250px", 
      marginBottom: "30px", 
    },
    quantityWrapper: {
      display: "flex",
      gap: "15px",
      alignItems: "center",
      marginBottom: "30px",
      justifyContent: "center",
    },
    btnSmall: {
      width: "60px",
      height: "50px",
      backgroundColor: "#AEDCB8",
      border: "none",
      borderRadius: "10px",
      fontSize: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    quantityInput: {
      width: "100px",
      height: "50px",
      backgroundColor: "#AEDCB8",
      borderRadius: "10px",
      border: "none",
      textAlign: "center",
      fontSize: "18px",
      fontWeight: "bold",
      outline: "none",
      appearance: "textfield",
    },
    priceWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center", 
      gap: "15px",
      width: "100%", 
      paddingRight: "25px", 
    },
    currencySymbol: {
      fontSize: "24px",
      fontWeight: "bold",
    },
    priceInput: {
      width: "160px",
      height: "50px",
      backgroundColor: "#AEDCB8",
      border: "none",
      borderRadius: "10px",
      textAlign: "center",
      fontSize: "18px",
      outline: "none",
    },
    specList: {
      paddingLeft: "0",
      listStyle: "none",
      marginBottom: "15px",
      width: "100%",
    },
    specItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "5px 0", 
      fontWeight: 500,
    },
    specBullet: {
      marginRight: "10px",
      fontWeight: "bold",
    },
    removeSpecBtn: {
      background: "transparent",
      border: "none",
      color: "#d9534f",
      fontSize: "16px",
      fontWeight: "bold",
      marginLeft: "10px",
      padding: "5px",
      cursor: "pointer",
    },
    addSpecBtn: {
      backgroundColor: "#AEDCB8",
      border: "none",
      borderRadius: "8px",
      padding: "15px 20px",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      justifyContent: "center", 
      gap: "10px",
      fontSize: "14px",
      width: "100%", 
    },
    specInputWrapper: {
      display: "flex",
      gap: "10px",
      width: "100%",
    },
    specTextInput: {
      flex: 1,
      backgroundColor: "#fff",
      border: "2px solid #AEDCB8",
      borderRadius: "8px",
      padding: "10px",
      fontSize: "14px",
      outline: "none",
    },
    specActionBtn: {
      width: "40px",
      border: "none",
      borderRadius: "8px",
      fontWeight: "bold",
      fontSize: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    submitBtn: {
      backgroundColor: "#90B498",
      color: "#000",
      padding: "15px 30px",
      border: "none",
      borderRadius: "10px",
      fontWeight: "bold",
      fontSize: "16px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    },
  };

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
        <div style={styles.columnLeft}>
          <label style={{...styles.label, textAlign: "center"}}>Afbeelding Toevoegen</label>
          <div 
            style={styles.imageUploadBox}
            onClick={handleImageClick}
            tabIndex={0} 
            onKeyDown={handleImageKeyDown}
            onFocus={() => setIsImageFocused(true)}
            onBlur={() => setIsImageFocused(false)}
            role="button"
            aria-label="Klik of druk op Enter om een afbeelding te uploaden"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            {formData.image ? (
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Preview"
                style={styles.previewImage}
              />
            ) : (
              <span>Klik om te uploaden</span>
            )}
          </div>

          <label style={{...styles.label, textAlign: "center"}}>Aantal Product</label>
          <div style={styles.quantityWrapper}>
            <InteractiveButton
              type="button"
              onClick={() => handleQuantityButton(-1)}
              baseStyle={styles.btnSmall}
            >
              -
            </InteractiveButton>
            <input
              type="number"
              placeholder="..."
              value={formData.quantity}
              onChange={handleQuantityInput}
              onKeyDown={preventInvalidIntegerInput}
              style={styles.quantityInput}
            />
            <InteractiveButton
              type="button"
              onClick={() => handleQuantityButton(1)}
              baseStyle={styles.btnSmall}
            >
              +
            </InteractiveButton>
          </div>

          <label style={{...styles.label, textAlign: "center"}}>Maximum Prijs</label>
          <div style={styles.priceWrapper}>
            <span style={styles.currencySymbol}>€</span>
            <input
              type="text"
              inputMode="decimal"
              name="price"
              placeholder="..."
              value={formData.price}
              onChange={handlePriceChange}
              onKeyDown={preventInvalidPriceInput}
              style={styles.priceInput}
            />
          </div>
        </div>

        <div style={styles.columnRight}>
          <label style={{...styles.label, textAlign: "center"}}>Beschrijving</label>
          <textarea
            name="description"
            placeholder="Beschrijving..."
            value={formData.description}
            onChange={handleChange}
            style={styles.textarea}
          />

          <label style={{...styles.label, textAlign: "center"}}>Product Specificaties</label>
          <ul style={styles.specList}>
            {formData.specifications.length === 0 && (
              <li style={{ color: "#666", fontStyle: "italic", marginBottom: "10px" }}>
                Nog geen specificaties...
              </li>
            )}
            {formData.specifications.map((spec, index) => (
              <li key={index} style={styles.specItem}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={styles.specBullet}>•</span>
                    <span>{spec}</span>
                </div>
                <InteractiveButton
                  type="button" 
                  onClick={() => removeSpecification(index)}
                  baseStyle={styles.removeSpecBtn}
                  title="Verwijder"
                >
                  ✕
                </InteractiveButton>
              </li>
            ))}
          </ul>

          {isAddingSpec ? (
            <div style={styles.specInputWrapper}>
              <input
                autoFocus
                type="text"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                onKeyDown={handleSpecKeyDown}
                placeholder="Typ specificatie..."
                style={styles.specTextInput}
              />
              <InteractiveButton
                type="button" 
                onClick={saveSpecification} 
                baseStyle={{...styles.specActionBtn, backgroundColor: '#90B498'}}
                title="Opslaan"
              >
                ✓
              </InteractiveButton>
              <InteractiveButton
                type="button" 
                onClick={cancelSpecification} 
                baseStyle={{...styles.specActionBtn, backgroundColor: '#ffb3b3'}}
                title="Annuleren"
              >
                ✕
              </InteractiveButton>
            </div>
          ) : (
            <InteractiveButton
              type="button"
              onClick={() => setIsAddingSpec(true)}
              baseStyle={styles.addSpecBtn}
            >
              <span style={{ fontSize: "18px", marginRight: "10px" }}>+</span> Specificatie toevoegen
            </InteractiveButton>
          )}

          <div style={{ marginTop: "auto", display: "flex", justifyContent: "center", paddingTop: "30px" }}>
            <InteractiveButton type="submit" baseStyle={styles.submitBtn}>
              Product Aanmaken
            </InteractiveButton>
          </div>
        </div>
      </div>
    </form>
  );
}