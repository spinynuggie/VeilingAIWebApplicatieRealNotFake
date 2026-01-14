import { authFetch } from './authService';

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

export interface GebruikerAankoop {
  aankoopId: number;
  productId: number;
  productNaam: string;
  datum: string;
  isBetaald: boolean;
  aankoopHoeveelheid: number;
  prijs: number;
  totaalBedrag: number;
}

/**
 * Haalt alle aankopen op van de ingelogde gebruiker.
 * Resultaten zijn al gesorteerd op datum (nieuwste eerst) door de backend.
 */
export async function getMijnAankopen(): Promise<GebruikerAankoop[]> {
  const response = await authFetch(`${apiBase}/api/Gebruiker/mijn-aankopen`);
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Kon aankopen niet ophalen');
  }
  
  return response.json();
}
