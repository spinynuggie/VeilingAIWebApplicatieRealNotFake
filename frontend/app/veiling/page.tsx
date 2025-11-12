"use client";

import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";
import { Product } from "@/types/product";

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Producten ({products.length})</h2>
      {products.map((p) => (
        <div key={p.productId} style={{ padding: '10px', border: '1px solid #ccc', margin: '10px' }}>
          <p>ID: {p.productId}</p>
          <p>Naam: {p.productNaam}</p>
          {p.fotos && <img src={p.fotos} alt={p.productNaam} width="100" />}
        </div>
      ))}
    </div>
  );
}
