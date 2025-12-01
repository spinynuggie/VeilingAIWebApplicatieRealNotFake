// types/search.ts (of zet bovenaan service file)
export interface SearchResult {
  id: number;
  naam: string;
  type: "Product" | "Veiling";
  image?: string;
}

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query) return [];

  const res = await fetch(`${apiBase}/api/Search?query=${encodeURIComponent(query)}`);

  if (!res.ok) {
    console.error("Search failed");
    return [];
  }

  return res.json();
}
