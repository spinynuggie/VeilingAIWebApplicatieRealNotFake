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
  specificaties?: string[];
}

export interface CreateProductInput {
  productNaam: string;
  productBeschrijving: string;
  fotos: string;
  hoeveelheid: number;
  startPrijs: number;
  eindprijs: number;      // Match met Backend DTO
  verkoperId: number;
  specificatieIds: number[]; // De cruciale koppeling
}

export interface UpdateProductAuctionInput {
  productId: number;
  veilingId: number;
  startPrijs: number;
  eindPrijs: number;
}