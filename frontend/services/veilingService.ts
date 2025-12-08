import { Veiling } from '@/types/veiling';
import { authFetch } from "./authService";

export async function getVeilingen(): Promise<Veiling[]> {
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;
  const res = await authFetch(`${apiBase}/api/Veiling`);
  if (!res.ok) throw new Error("Ophalen mislukt");
  return res.json();
}
