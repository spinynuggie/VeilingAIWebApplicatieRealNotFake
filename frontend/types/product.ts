export interface Product {
  productId: number;
  fotos: string;
  productNaam: string;
  productBeschrijving: string;
  hoeveelheid: number;
  startPrijs: number;
  eindPrijs: number;
  huidigeprijs: number;
  veilingId: number;
  verkoperId: number;
  locatieId: number;
  specificaties?: string[];
}

export interface CreateProductInput {
  productNaam: string;
  productBeschrijving: string;
  fotos: string;
  hoeveelheid: number;
  startPrijs: number;
  eindPrijs: number;
  verkoperId: number;
  locatieId: number;
  specificatieIds: number[];
}

export interface UpdateProductAuctionInput {
  productId: number;
  veilingId: number;
  startPrijs: number;
  eindPrijs: number;
}

export interface ProductDisplayProps {
  product: Product[];
}