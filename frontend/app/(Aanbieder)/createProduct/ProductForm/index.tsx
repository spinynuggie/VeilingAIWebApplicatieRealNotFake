import React, { useState, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { InteractiveButton } from "./interactiveButton";
import { styles } from "./styles";
import { useAuth } from "@/components/(oud)/AuthProvider";
import { createProduct } from "@/services/productService";
import { Alert, Snackbar, CircularProgress } from "@mui/material";
import SpecificatiesMenu from "./specificatiesMenu";

// --- TYPES ---
export interface ProductData {
  name: string;
  description: string;
  quantity: number | "";
  price: string;
  specifications: string[]; // For visual preview (ProductCard)
  specificationIds: number[]; // For Backend Logic
  image: string; 
}

interface ProductFormProps {
  formData: ProductData;
  setFormData: React.Dispatch<React.SetStateAction<ProductData>>;
}

export default function ProductForm({ formData, setFormData }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();

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

  // ✅ New Handler for the Dropdown Menu
  const handleSpecificationsChange = (ids: number[], names: string[]) => {
    setFormData(prev => ({
      ...prev,
      specificationIds: ids,       // Store IDs for Backend
      specifications: names        // Store Names for ProductCard preview
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) { setError("Naam is verplicht"); return false; }
    if (!formData.quantity) { setError("Aantal is verplicht"); return false; }
    if (Number(formData.quantity) <= 0) { setError("Aantal moet groter zijn dan 0"); return false; }
    if (!formData.price) { setError("Prijs is verplicht"); return false; }
    if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) { setError("Voer een geldig bedrag in"); return false; }
    if (!formData.image) { setError("Afbeelding URL is verplicht"); return false; }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!validateForm()) return;
    
    if (!user) {
      setError("Je moet ingelogd zijn om een product aan te maken");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // ✅ Prepare Payload matching your Backend DTO
      const productData = {
        productNaam: formData.name,
        productBeschrijving: formData.description || "Geen beschrijving",
        fotos: formData.image,
        hoeveelheid: Number(formData.quantity),
        startPrijs: 0, 
        eindPrijs: parseFloat(formData.price), // Assuming this is logic for auctions
        specificatieIds: formData.specificationIds, // ✅ SENDING IDs TO BACKEND
        verkoperId: user.gebruikerId,
      };

      await createProduct(productData);
      setSuccess("Product succesvol aangemaakt!");
      
      // Clear the form
      setFormData({
        name: "",
        description: "",
        quantity: "",
        price: "",
        specifications: [],
        specificationIds: [],
        image: "",
      });
      
    } catch (err: any) {
      console.error("Error creating product:", err);
      setError(err.message || "Er is een fout opgetreden");
    } finally {
      setIsSubmitting(false);
    }
  };

  const showAlert = (message: string, severity: "error" | "success") => (
    <Snackbar
      open={true}
      autoHideDuration={6000}
      onClose={() => severity === "error" ? setError(null) : setSuccess(null)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={() => severity === "error" ? setError(null) : setSuccess(null)} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );

  return (
    <form style={styles.card} onSubmit={handleSubmit}>
      {error && showAlert(error, "error")}
      {success && showAlert(success, "success")}
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
          <label style={styles.label}>Afbeelding URL*</label>
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
            ) : ( <span>Preview...</span> )}
          </div>

          <label style={styles.label}>Aantal Product*</label>
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

          <label style={styles.label}>Minimum Prijs*</label>
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

          {/* ✅ The Dropdown Menu */}
          <div>
            <SpecificatiesMenu 
              onChange={handleSpecificationsChange}
              selectedIdsProp={formData.specificationIds} 
            />
          </div>

          <div style={{ marginTop: "auto", display: "flex", justifyContent: "center", paddingTop: "30px" }}>
            <InteractiveButton 
              type="submit" 
              baseStyle={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Product Aanmaken'}
            </InteractiveButton>
          </div>
        </div>
      </div>
    </form>
  );
}