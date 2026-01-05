import React, { useState, ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { useSearch } from "@/hooks/useSearch";  
import { SearchResult } from "@/types/search";    
import { useAuth } from "@/components/AuthProvider";
import { createProduct } from "@/services/productService";
import { Alert, Snackbar, CircularProgress } from "@mui/material";
import { Box } from "@/components/Box";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Buttons/Button";
import SearchBar from "@/components/SearchBar"
import { Stack, Grid, Typography, InputAdornment, Box as BoxMui } from "@mui/material";
import { searchSpecificaties } from "@/services/searchService";

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
  const searchControl = useSearch<SearchResult>(searchSpecificaties);

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
 <Box component="form" onSubmit={handleSubmit} >
  <Typography variant="h5" gutterBottom>Product Aanmaken</Typography>
  
  <Grid container spacing={4}>
    {/* LINKER KOLOM */}
    <Grid size={{ xs: 12, md: 6 }}>
      <Stack spacing={3}>
        <TextField
          label="Naam Product"
          fullWidth
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <TextField
          label="Afbeelding URL"
          fullWidth
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://..."
        />

        {/* Preview Box */}
        <BoxMui sx={{ height: 200, border: '1px dashed grey', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {formData.image ? <img src={formData.image} style={{ maxHeight: '100%' }} /> : "Preview"}
        </BoxMui>

        <Stack direction="row" spacing={2} alignItems="center">
           <TextField
            label="Aantal"
            type="number"
            value={formData.quantity}
            onChange={handleQuantityInput}
            onKeyDown={preventInvalidIntegerInput}
          />
          {/* Hier kun je je +/- knoppen eventueel behouden of MUI IconButton gebruiken */}
        </Stack>

        <TextField
          label="Minimum Prijs"
          value={formData.price}
          onChange={handlePriceChange}
          slotProps={{
            input: {
              startAdornment: <InputAdornment position="start">€</InputAdornment>,
            },
          }}
        />
      </Stack>
    </Grid>

    {/* RECHTER KOLOM */}
    <Grid size={{ xs: 12, md: 6 }}>
      <Stack spacing={3} sx={{ height: '100%' }}>
        <TextField
          label="Beschrijving"
          multiline
          rows={6}
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
        <SearchBar mode="callback" searchControl={searchControl} >

        </SearchBar>

        <BoxMui sx={{ mt: 'auto', textAlign: 'center' }}>
          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting && <CircularProgress size={20} />}
          >
            Product Aanmaken
          </Button>
        </BoxMui>
      </Stack>
    </Grid>
  </Grid>
</Box>
  );
}