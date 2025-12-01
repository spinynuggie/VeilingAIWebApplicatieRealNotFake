"use client";

import React from "react";
import AppNavbar from "@/components/AppNavbar"; // Assuming you want the navbar here too
import ProductSearchBar from "@/components/ProductSearchBar";
import ProductCard from "@/components/ProductCard";
import { useVeilingAanmaken } from "@/hooks/useVeilingAanmaken";
import styles from "./veilingAanmaken.module.css";
import { AvailableColumn } from "./Components/availableColumn";
import DetailColumn from "./Components/detailColumn";
import AuctionColumn from "./Components/auctionColumn";
import { filter } from "framer-motion/client";

const VeilingAanmakenPage = () => {
  const {
    loading,
    filteredAvailable,      // Gefilterde lijst links
    filteredAuction,
    selectedProduct,
    setSelectedProduct,
    handleAddToAuction,
    handleRemoveFromAuction,
    handleSearchAvailable,
    handleSearchAuction,
  } = useVeilingAanmaken();
  return (
    <main className={styles.pageContainer}>
      <AppNavbar />

      <div className={styles.mainWrapper}>

        {/* KOLOM 1: Nu schoon en leesbaar */}
        <AvailableColumn
            loading={loading}
            products={filteredAvailable}
            selectedId={selectedProduct?.productId}
            onSearch={handleSearchAvailable}
            onSelect={setSelectedProduct}
        />

        {/* KOLOM 2 */}
        <DetailColumn
            product={selectedProduct}
            onAdd={handleAddToAuction}
        />

        {/* KOLOM 3 */}
        <AuctionColumn
            products={filteredAuction}
            onSearch={handleSearchAuction}
            onRemove={handleRemoveFromAuction}
        />

      </div>
    </main>
  );
};

export default VeilingAanmakenPage;
