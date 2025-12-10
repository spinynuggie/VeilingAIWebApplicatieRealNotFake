"use client";

import React from "react";
import ProductCard from "@/components/ProductCard/ProductCard";
import { Product } from "@/types/product";
// We importeren de CSS module uit de bovenliggende map
import styles from "../veilingAanmaken.module.css";

interface DetailColumnProps {
  product: Product | null;
  onAdd: (maxPrice: number) => void;
}

export default function DetailColumn({ product, onAdd }: DetailColumnProps) {
  return (
    <div className={styles.middleColumn}>
      {product ? (
        <ProductCard
          mode="auction"
          onAction={onAdd}
          product={{
            title: product.productNaam,
            description: product.productBeschrijving,
            image: product.fotos,
            specifications: product.specificaties || [], // Fallback als array leeg is
            price: 0 // Prijs is niet relevant voor weergave in auction mode (wordt input)
          }}
        />
      ) : (
        <div className={styles.placeholder}>
          Selecteer een product links
        </div>
      )}
    </div>
  );
}
