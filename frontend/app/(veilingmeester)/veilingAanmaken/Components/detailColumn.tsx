"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "@/features/ProductCard";
import { Product } from "@/types/product";
import { getProductById } from "@/services/productService"; // Zorg dat deze functie bestaat

interface DetailColumnProps {
  product: Product | null; // Dit is het 'simpele' product uit de lijst
  onAdd: (maxPrice: number) => void;
}

export default function DetailColumn({ product, onAdd }: DetailColumnProps) {
  const [fullProduct, setFullProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (product?.productId) {
      setLoading(true);
      // Haal de uitgebreide details op via GET /api/ProductGegevens/{id}
      getProductById(product.productId)
        .then((data) => {
          setFullProduct(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Fout bij ophalen specificaties:", err);
          setLoading(false);
        });
    } else {
      setFullProduct(null);
    }
  }, [product?.productId]);

  return (
    <div>
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Specificaties laden...</div>
      ) : fullProduct ? (
        <ProductCard
          mode="auction"
          onAction={onAdd}
          product={{
            ...fullProduct,
            name: fullProduct.productNaam,
            description: fullProduct.productBeschrijving,
            image: fullProduct.fotos,
            specifications: fullProduct.specificaties?.map((s: any) => s.naam) || [],
            startPrijs: fullProduct.startPrijs,
            eindPrijs: fullProduct.eindPrijs
          }}
        />
      ) : (
        <div style={{ padding: '20px', border: '1px dashed #ccc', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
          Selecteer een product links
        </div>
      )}
    </div>
  );
}