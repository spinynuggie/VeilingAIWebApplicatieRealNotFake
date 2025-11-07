"use client";

import { useEffect, useState } from "react";
import  ProductDisplay  from "../../components/ProductDisplay";
import { getProduct } from "../../services/productService";

//Tijdelijke file om te kijken hoe de objecten er uiteindelijk uit komen te zien zonder andere pagina's in de weg te zitten
export default function ProductList() {
  const [productGegevens, setProductGegevens] = useState<any[]>([]);

  useEffect(() => {
    getProduct()
      .then(setProductGegevens)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Producten</h2>
      {productGegevens.length === 0 ? (
        <p>Geen productGegevens gevonden...</p>
      ) : (
        productGegevens.map((v) => (
          <ProductDisplay key={v.productId} productId={v.productId} productNaam={v.productNaam} />
        ))
      )}
    </div>
  );
}
