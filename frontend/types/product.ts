export interface Product {
  productId: number;
  productNaam: string;
  productBeschrijving: string;
  fotos: string;
}

export interface ProductDisplayProps {
  product: Product[];
}

export interface CreateProductInput {
  productNaam: string;
  productBeschrijving: string;
  fotos: string;
  aantalProduct: number;
  minimumPrijs: number;
  specificaties: string[];
}