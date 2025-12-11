"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { getProducts, updateProductAuctionData } from "@/services/productService";
import { usePathname } from "next/navigation";

export function useVeilingAanmaken() {
  const pathname = usePathname();
  const id = parseInt(pathname.split('/').pop() || '0');
  const CURRENT_VEILING_ID = id;

  // --- LINKER KOLOM STATES ---
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [filteredAvailable, setFilteredAvailable] = useState<Product[]>([]);

  // --- RECHTER KOLOM STATES ---
  const [auctionProducts, setAuctionProducts] = useState<Product[]>([]);
  const [filteredAuction, setFilteredAuction] = useState<Product[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. DATA OPHALEN
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getProducts();
        const leftList = data.filter((p) => p.veilingId === 0);
        const rightList = data.filter((p) => p.veilingId === CURRENT_VEILING_ID);

        setAvailableProducts(leftList);
        setFilteredAvailable(leftList);

        setAuctionProducts(rightList);
        setFilteredAuction(rightList);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 2a. ZOEKEN LINKS
  const handleSearchAvailable = (term: string) => {
    const lowerTerm = term.toLowerCase();
    setFilteredAvailable(availableProducts.filter((p) =>
      p.productNaam.toLowerCase().includes(lowerTerm)
    ));
  };

  // 2b. ZOEKEN RECHTS
  const handleSearchAuction = (term: string) => {
    const lowerTerm = term.toLowerCase();
    setFilteredAuction(auctionProducts.filter((p) =>
      p.productNaam.toLowerCase().includes(lowerTerm)
    ));
  };

  // 3. TOEVOEGEN (Links -> Rechts)
  const handleAddToAuction = async (maxPrice: number) => {
    if (!selectedProduct) return;
    try {
        await updateProductAuctionData({
            productId: selectedProduct.productId,
            veilingId: CURRENT_VEILING_ID,
            startPrijs: maxPrice,
            eindPrijs: 0
        });

        const updatedProduct = { ...selectedProduct, veilingId: CURRENT_VEILING_ID, startPrijs: maxPrice };

        // Update Links
        const newAvailable = availableProducts.filter(p => p.productId !== selectedProduct.productId);
        setAvailableProducts(newAvailable);
        setFilteredAvailable(newAvailable);

        // Update Rechts
        const newAuctionList = [...auctionProducts, updatedProduct];
        setAuctionProducts(newAuctionList);
        setFilteredAuction(newAuctionList);

        setSelectedProduct(null);
    } catch (e) {
        console.error(e);
    }
  };

  // 4. VERWIJDEREN (Rechts -> Links)
  const handleRemoveFromAuction = async (productToRemove: Product) => {
    try {
        await updateProductAuctionData({
            productId: productToRemove.productId,
            veilingId: 0,
            startPrijs: 0,
            eindPrijs: 0
        });

        const resetProduct = { ...productToRemove, veilingId: 0 };

        // Update Rechts
        const newAuctionList = auctionProducts.filter(p => p.productId !== productToRemove.productId);
        setAuctionProducts(newAuctionList);
        setFilteredAuction(newAuctionList);

        // Update Links
        const newAvailable = [...availableProducts, resetProduct];
        setAvailableProducts(newAvailable);
        setFilteredAvailable(newAvailable);

    } catch (e) {
        console.error(e);
    }
  };

  return {
    loading,
    filteredAvailable,
    filteredAuction,
    selectedProduct,
    setSelectedProduct,
    handleSearchAvailable,
    handleSearchAuction,
    handleAddToAuction,
    handleRemoveFromAuction
  };
}
