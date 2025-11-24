export interface Product {
  productId: number;
  productNaam: string;
  productBeschrijving: string;
  fotos: string;
}

export interface ProductDisplayProps {
  product: Product[];
}
