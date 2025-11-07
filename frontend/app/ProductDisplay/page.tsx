"use client";

import { useEffect, useState } from "react";
import ProductDisplay from "../../components/ProductDisplay";
import { getProduct } from "../../services/productService";

// Interface voor type safety
interface ProductGegevens {
  productId: number;
  fotos: string;
  productNaam: string;
  hoeveelheid: number;
  productBeschrijving: string;
  verkoperId: number;
}

export default function ProductList() {
  const [productGegevens, setProductGegevens] = useState<ProductGegevens[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProduct()
      .then((data) => {
        setProductGegevens(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Fout bij ophalen producten");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Laden...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>Producten</h2>
      {productGegevens.length === 0 ? (
        <p>Geen producten gevonden...</p>
      ) : (
        productGegevens.map((product) => (
          <ProductDisplay
            key={product.productId}
            productId={product.productId}
            productNaam={product.productNaam}
            foto={product.fotos}
          />
        ))
      )}
    </div>
  );
}
