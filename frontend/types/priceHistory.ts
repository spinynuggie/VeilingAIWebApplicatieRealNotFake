export interface HistoricalPricePoint {
  prijs: number;
  createdAt: string;
}

export interface HistoricalPriceResponse {
  productId: number;
  productNaam: string;
  verkoperId: number;
  averagePrice: number | null;
  last10CurrentSupplier: HistoricalPricePoint[];
  last10AllSuppliers: HistoricalPricePoint[];
}
