const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

export async function globalSearch(query: string, signal: AbortSignal): Promise<SearchResult[]> {
  const res = await fetch(`${apiBase}/api/Search?query=${encodeURIComponent(query)}`, { signal });
  return res.json();
}

// De specifieke zoekfunctie voor specificaties
export async function searchSpecificaties(query: string, signal: AbortSignal): Promise<SearchResult[]> {
  const res = await fetch(`${apiBase}/api/Search/search?query=${encodeURIComponent(query)}`, { signal });
  const data = await res.json();
  
  return data.map((s: any) => ({
    id: s.specificatieId,
    naam: s.naam,
    type: "Specificatie",
    image: null // Of een icoon-url
  }));
}