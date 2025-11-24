import { Gebruiker } from '@/types/gebruiker';

export async function getGebruiker(): Promise<Gebruiker[]> {
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;
  const res = await fetch(`${apiBase}/api/Gebruiker`);
  if (!res.ok) throw new Error("Ophalen mislukt");
  return res.json();
}
