import React, { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { getProducts, updateProductAuctionData  } from "@/services/productService";



// Dit is het ID van de veiling waar we producten in stoppen (zoals gevraagd: 1)
const CURRENT_VEILING_ID = 1;

export function useVeilingAanmaken() {
  // State voor linker kolom (Beschikbaar)
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [filteredAvailable, setFilteredAvailable] = useState<Product[]>([]);

  // State voor rechter kolom (In veiling)
  const [auctionProducts, setAuctionProducts] = useState<Product[]>([]);

  // State voor midden (Geselecteerd)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);

  // --- 1. DATA OPHALEN ---
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getProducts();

        // Splitsen: Links = ID 0, Rechts = ID 1
        const leftList = data.filter((p) => p.veilingId === 0);
        const rightList = data.filter((p) => p.veilingId === CURRENT_VEILING_ID);

        setAvailableProducts(leftList);
        setFilteredAvailable(leftList);
        setAuctionProducts(rightList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // --- 2. ZOEKEN (Links) ---
  const handleSearch = (term: string) => {
    const lowerTerm = term.toLowerCase();
    const results = availableProducts.filter((p) =>
      p.productNaam.toLowerCase().includes(lowerTerm)
    );
    setFilteredAvailable(results);
  };

  // --- 3. TOEVOEGEN (Links -> Rechts) ---
  const handleAddToAuction = async (maxPrice: number) => {
    if (!selectedProduct) return;

    try {
        // API Call: Zet veilingId op 1 en sla Max prijs op (als startPrijs)
        await updateProductAuctionData({
            productId: selectedProduct.productId,
            veilingId: CURRENT_VEILING_ID,
            startPrijs: maxPrice, // Max input = Startprijs
            eindPrijs: 0          // Min input (of default)
        });

        // State Update
        const updatedProduct = {
            ...selectedProduct,
            veilingId: CURRENT_VEILING_ID,
            startPrijs: maxPrice
        };

        // Verwijder links
        const newAvailable = availableProducts.filter(p => p.productId !== selectedProduct.productId);
        setAvailableProducts(newAvailable);
        setFilteredAvailable(newAvailable); // Update ook de gefilterde lijst

        // Voeg toe rechts
        setAuctionProducts([...auctionProducts, updatedProduct]);

        // Reset midden
        setSelectedProduct(null);

    } catch (e) {
        console.error("Fout bij toevoegen:", e);
        alert("Er ging iets mis bij het opslaan.");
    }
  };

  // --- 4. VERWIJDEREN (Rechts -> Links) ---
  const handleRemoveFromAuction = async (productToRemove: Product) => {
    try {
        // API Call: Zet veilingId terug naar 0
        await updateProductAuctionData({
            productId: productToRemove.productId,
            veilingId: 0,
            startPrijs: 0, // Reset prijzen optioneel
            eindPrijs: 0
        });

        // State Update
        const resetProduct = { ...productToRemove, veilingId: 0 };

        // Verwijder rechts
        setAuctionProducts(auctionProducts.filter(p => p.productId !== productToRemove.productId));

        // Voeg toe links
        const newAvailable = [...availableProducts, resetProduct];
        setAvailableProducts(newAvailable);
        // Als er niet gezocht wordt, update direct de zichtbare lijst.
        // (Simpelheidshalve resetten we hier de filter of voegen we hem toe aan de huidige filter)
        setFilteredAvailable((prev) => [...prev, resetProduct]);

    } catch (e) {
        console.error("Fout bij verwijderen:", e);
        alert("Kon product niet verwijderen uit veiling.");
    }
  };
      return {
    loading,
    availableProducts,
    filteredAvailable,
    auctionProducts,
    selectedProduct,
    setSelectedProduct,
    handleSearch,
    handleAddToAuction,
    handleRemoveFromAuction
  };
}

