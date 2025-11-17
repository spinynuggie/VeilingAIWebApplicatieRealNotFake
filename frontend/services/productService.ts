import { Product } from '@/types/product';

export async function getProducts(): Promise<Product[]> {
  const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;
  const res = await fetch(`${apiBase}/api/ProductGegevens`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Ophalen mislukt");
  return res.json();
}
