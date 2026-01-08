export interface SearchResult {
  id: number;
  naam: string;
  type: "Product" | "Veiling" | "Specificatie";
  image?: string | null;
}
