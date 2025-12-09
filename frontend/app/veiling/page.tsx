"use client";

import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";
import { Product } from "@/types/product";
import RequireAuth from "@/components/RequireAuth";

export default function ProductList() {
  // We hoeven niet alle producten op te slaan, alleen degene die we willen tonen
  const [productOne, setProductOne] = useState<Product | undefined>(undefined);

  useEffect(() => {
    // Haal alle producten op
    getProducts()
      .then((data) => {
        // Zoek het specifieke product met productId 1
        const p1 = data.find(p => p.productId === 1);
        setProductOne(p1);
      })
      .catch(console.error);
  }, []);

  return (
    <RequireAuth>
      <div>
        <h2>Productdetails</h2>

        {/* Toon de ProductCard alleen als productOne is gevonden (niet undefined).
          Het gevonden product (p1) wordt doorgegeven als de 'product' prop.
        */}
        {productOne ? (
          <div
            style={{
              padding: '20px',
              border: '1px solid #ccc',
              margin: '20px 0',
            }}
          >
          </div>
        ) : (
          <p>Product met ID 1 wordt geladen of is niet gevonden...</p>
        )}
      </div>
    </RequireAuth>
  );
}
