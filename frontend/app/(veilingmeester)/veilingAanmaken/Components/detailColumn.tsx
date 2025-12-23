"use client";

import React from "react";
import ProductCard from "@/features/ProductCard";
import { Product } from "@/types/product";
// We importeren de CSS module uit de bovenliggende map

interface DetailColumnProps {
  product: Product | null;
  onAdd: (maxPrice: number) => void;
}

export default function DetailColumn({ product, onAdd }: DetailColumnProps) {
  return (
    <div >
      {product ? (
        <ProductCard
          mode="auction"
          onAction={onAdd}
          product={{
            name: product.productNaam,
            description: product.productBeschrijving,
            image: product.fotos,
            specifications: product.specificaties || [], // Fallback als array leeg is
            price: 0, // Prijs is niet relevant voor weergave in auction mode (wordt input)
            startPrijs: product.startPrijs,
            eindPrijs: product.eindPrijs
          }}
        />
      ) : (
        <div >
          Selecteer een product links
        </div>
      )}
    </div>
  );
}
