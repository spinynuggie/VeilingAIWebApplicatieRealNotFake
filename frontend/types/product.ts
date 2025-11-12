export interface Product {
  productId: number;
  productNaam: string;
  fotos: string;
}

export interface ProductDisplayProps {
  product: Product;
}
