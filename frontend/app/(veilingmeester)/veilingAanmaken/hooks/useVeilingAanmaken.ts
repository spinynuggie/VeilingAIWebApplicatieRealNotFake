"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { getProducts, updateProductAuctionData } from "@/services/productService";
import { getLocaties, Locatie } from "@/services/locatieService";
import { getVeilingById } from "@/services/veilingService";

// Haal huidige gebruiker op
const getCurrentUserId = () => 1;

export function useVeilingAanmaken(initialVeilingId?: number | null) {
  const [currentVeilingId, setCurrentVeilingId] = useState<number | null>(initialVeilingId || null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [filteredAvailable, setFilteredAvailable] = useState<Product[]>([]);
  const [auctionProducts, setAuctionProducts] = useState<Product[]>([]);
  const [filteredAuction, setFilteredAuction] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<Locatie[]>([]);
  const [auctionLocationId, setAuctionLocationId] = useState<number | null>(null);

  useEffect(() => {
    getLocaties().then(setLocations).catch(console.error);
  }, []);

  // Fetch auction details if we have an ID
  useEffect(() => {
    if (currentVeilingId) {
      getVeilingById(currentVeilingId).then(v => {
        setAuctionLocationId(v.locatieId);
      }).catch(console.error);
    }
  }, [currentVeilingId]);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getProducts();
        let leftList = data.filter((p) => p.veilingId === 0 || p.veilingId === null);

        // OPTIONAL: Filter by location if we have an active auction location
        // This is commented out to ensure all products are visible
        // Uncomment if you want strict location-based filtering
        // if (auctionLocationId !== null) {
        //   leftList = leftList.filter(p => p.locatieId === auctionLocationId);
        // }

        setAvailableProducts(leftList);
        setFilteredAvailable(leftList);

        if (currentVeilingId) {
          const auctionList = data.filter((p) => p.veilingId === currentVeilingId);
          setAuctionProducts(auctionList);
          setFilteredAuction(auctionList);
        }
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [auctionLocationId]);

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

      const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;
      const response = await fetch(`${apiBase}/api/Veiling`, {
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
      setAuctionLocationId(payload.locatieId);
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
    handleCreateVeiling, handleAddToAuction, handleRemoveFromAuction, locations,
    handleSearchAvailable: (t: string) => setFilteredAvailable(availableProducts.filter(p => p.productNaam.toLowerCase().includes(t.toLowerCase()))),
    handleSearchAuction: (t: string) => setFilteredAuction(auctionProducts.filter(p => p.productNaam.toLowerCase().includes(t.toLowerCase()))),
  };
}