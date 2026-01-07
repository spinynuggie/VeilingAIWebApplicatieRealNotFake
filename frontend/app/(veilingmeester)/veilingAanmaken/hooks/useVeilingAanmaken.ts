"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { getProducts, updateProductAuctionData } from "@/services/productService";

// Haal huidige gebruiker op
const getCurrentUserId = () => 1;

export function useVeilingAanmaken() {
  const [currentVeilingId, setCurrentVeilingId] = useState<number | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [filteredAvailable, setFilteredAvailable] = useState<Product[]>([]);
  const [auctionProducts, setAuctionProducts] = useState<Product[]>([]);
  const [filteredAuction, setFilteredAuction] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getProducts();
        const leftList = data.filter((p) => p.veilingId === 0 || p.veilingId === null);
        setAvailableProducts(leftList);
        setFilteredAvailable(leftList);
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleCreateVeiling = async (formData: any) => {
    try {
      setError(null);

      // Payload bouwen conform Swagger
      const payload = {
        naam: String(formData.title || ""),
        beschrijving: String(formData.description || ""),
        image: String(formData.imageUrl || ""),
        // Zorg dat datums niet leeg zijn voor ISO conversie
        starttijd: formData.startTime ? new Date(formData.startTime).toISOString() : null,
        eindtijd: formData.endTime ? new Date(formData.endTime).toISOString() : null,
        veilingMeesterId: Number(getCurrentUserId()),
        locatieId: Number(formData.locationId || 1)
      };

      console.log("Versturen naar API:", payload);

      const response = await fetch("http://localhost:5000/api/Veiling", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // DIT LOGT DE EXACTE FOUTEN (bijv. "The locatieId field is required")
        console.error("BACKEND VALIDATIE FOUT:", errorData.errors);
        
        // Combineer de foutmeldingen voor de gebruiker
        const messages = errorData.errors 
          ? Object.entries(errorData.errors).map(([field, msg]) => `${field}: ${msg}`).join(", ")
          : errorData.title || "Validatie fout";

        throw new Error(messages);
      }
      
      const newVeiling = await response.json();
      // Afhankelijk van je backend: .veilingId of .id
      const createdId = newVeiling.veilingId || newVeiling.id;
      setCurrentVeilingId(createdId);
      return createdId;

    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const handleAddToAuction = async (maxPrice: number) => {
    if (!selectedProduct || !currentVeilingId) return;
    try {
      await updateProductAuctionData({
        productId: selectedProduct.productId,
        veilingId: currentVeilingId,
        startPrijs: maxPrice,
        eindPrijs: selectedProduct.eindPrijs
      });
      const updated = { ...selectedProduct, veilingId: currentVeilingId, startPrijs: maxPrice };
      setAvailableProducts(p => p.filter(x => x.productId !== selectedProduct.productId));
      setFilteredAvailable(p => p.filter(x => x.productId !== selectedProduct.productId));
      setAuctionProducts(p => [...p, updated]);
      setFilteredAuction(p => [...p, updated]);
      setSelectedProduct(null);
    } catch (e) { setError("Toevoegen mislukt"); }
  };

  const handleRemoveFromAuction = async (productToRemove: Product) => {
    try {
      await updateProductAuctionData({ productId: productToRemove.productId, veilingId: 0, startPrijs: 0, eindPrijs: productToRemove.eindPrijs });
      const reset = { ...productToRemove, veilingId: 0 };
      setAuctionProducts(p => p.filter(x => x.productId !== productToRemove.productId));
      setFilteredAuction(p => p.filter(x => x.productId !== productToRemove.productId));
      setAvailableProducts(p => [...p, reset]);
      setFilteredAvailable(p => [...p, reset]);
    } catch (e) { setError("Verwijderen mislukt"); }
  };

  return {
    loading, filteredAvailable, filteredAuction, selectedProduct, setSelectedProduct, error, setError,
    handleCreateVeiling, handleAddToAuction, handleRemoveFromAuction,
    handleSearchAvailable: (t: string) => setFilteredAvailable(availableProducts.filter(p => p.productNaam.toLowerCase().includes(t.toLowerCase()))),
    handleSearchAuction: (t: string) => setFilteredAuction(auctionProducts.filter(p => p.productNaam.toLowerCase().includes(t.toLowerCase()))),
  };
}