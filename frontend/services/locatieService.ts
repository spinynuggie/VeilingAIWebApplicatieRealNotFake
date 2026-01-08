import { authFetch } from "./authService";

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

export interface Locatie {
  locatieId?: number;
  locatieNaam: string;
  foto: string;
}

export async function getLocaties(): Promise<Locatie[]> {
  try {
    const res = await authFetch(`${apiBase}/api/Locatie`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Failed to fetch locations from API, using fallback", e);
  }

  // Fallback/Mock locations for testing - Main Flower Auctions
  return [
    { locatieId: 1, locatieNaam: "Aalsmeer", foto: "" },
    { locatieId: 2, locatieNaam: "Naaldwijk", foto: "" },
    { locatieId: 3, locatieNaam: "Rijnsburg", foto: "" },
    { locatieId: 4, locatieNaam: "Eelde", foto: "" },
    { locatieId: 5, locatieNaam: "Venlo", foto: "" },
    { locatieId: 6, locatieNaam: "Ede (Plantion)", foto: "" },
    { locatieId: 7, locatieNaam: "Straelen-Herongen", foto: "" },
  ];
}

export async function createLocatie(data: Locatie): Promise<Locatie> {
  const res = await authFetch(`${apiBase}/api/Locatie`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Aanmaken locatie mislukt");
  return res.json();
}
