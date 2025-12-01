export interface Product {
  productId: number;
  fotos: string;
  productNaam: string;
  productBeschrijving: string;
  hoeveelheid: number;
  startPrijs: number;
  eindPrijs: number;
  huidigePrijs: number;
  veilingId: number;
  verkoperId: number;
  // Optioneel: specficaties, als je die lokaal gebruikt in de frontend
  specificaties?: string[];
}

export interface ProductDisplayProps {
  product: Product[];
}

export interface CreateProductInput {
  productNaam: string;
  productBeschrijving: string;
  fotos: string;
  hoeveelheid: number;
  startPrijs: number;
  eindPrijs: number;
  verkoperId: number;     
}

export interface UpdateProductAuctionInput {
  productId: number;
  veilingId: number;
  startPrijs: number;
  eindPrijs: number;
}
