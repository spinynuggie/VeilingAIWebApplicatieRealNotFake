import { Veiling } from '@/types/veiling';
import { authFetch } from "./authService";

export async function getVeilingen(): Promise<Veiling[]> {
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;
  const res = await authFetch(`${apiBase}/api/Veiling`);
  if (!res.ok) throw new Error("Ophalen mislukt");
  return res.json();
}

export async function getVeilingById(id: number): Promise<Veiling> {
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;
  const res = await authFetch(`${apiBase}/api/Veiling/${id}`);
  if (!res.ok) throw new Error("Ophalen van veiling mislukt");
  return res.json();
}

export async function createVeiling(veiling: Omit<Veiling, 'veilingId'>): Promise<Veiling> {
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;
  const res = await authFetch(`${apiBase}/api/Veiling`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(veiling),
  });
  if (!res.ok) throw new Error("Veiling aanmaken mislukt");
  return res.json();
}

export async function deleteVeiling(id: number): Promise<void> {
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;
  const res = await authFetch(`${apiBase}/api/Veiling/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Veiling verwijderen mislukt");
}
