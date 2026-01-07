import { authFetch } from "./authService";

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

export interface Locatie {
  locatieId?: number;
  locatieNaam: string;
  foto: string;
}

export async function getLocaties(): Promise<Locatie[]> {
  const res = await authFetch(`${apiBase}/api/Locatie`);
  if (!res.ok) throw new Error("Kon locaties niet ophalen");
  return res.json();
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