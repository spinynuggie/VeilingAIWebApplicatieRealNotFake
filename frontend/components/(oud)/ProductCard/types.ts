// src/components/ProductCard/types.ts

export interface ProductCardData {
  // Standard fields
  name?: string;
  description?: string;
  image?: string | File | null; // Supports both URL string and File object
  specifications?: string[];
  price?: string | number;

  // Database specific fields (Legacy support)
  productNaam?: string;
  productBeschrijving?: string;
  huidigeprijs?: number;
  eindPrijs?: number;
  startPrijs?: number;
  fotos?: string;
}

export interface ProductCardProps {
  product: ProductCardData;
  mode: 'auction' | 'create' | 'display';
  onAction?: (priceValue: number) => void;
}
