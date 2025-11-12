import { Veiling } from '@/types/veiling';

export async function getVeilingen(): Promise<Veiling[]> {
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;
  const res = await fetch(`${apiBase}/api/Veiling`);
  if (!res.ok) throw new Error("Ophalen mislukt");
  return res.json();
}
