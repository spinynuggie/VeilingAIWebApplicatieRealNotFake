"use client";

import React from 'react';
import ProductCard from '@/features/ProductCard';

const sampleProduct = {
  productId: 1,
  fotos: '/placeholder-product.jpg',
  productNaam: 'Voorbeeld Product',
  productBeschrijving: 'Een korte beschrijving van het product.',
  hoeveelheid: 10,
  startPrijs: 50,
  eindPrijs: 20,
  huidigeprijs: 42,
  veilingId: 0,
  verkoperId: 1,
  locatieId: 1,
  specificaties: ['Smal', 'Rood']
};

export default function ProductCardExample() {
  return (
    <div style={{ padding: 8 }}>
      <ProductCard product={sampleProduct as any} mode="display" />
    </div>
  );
}
