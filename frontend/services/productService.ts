import { Product, CreateProductInput } from '@/types/product';

 const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${apiBase}/api/ProductGegevens`);
  if (!res.ok) throw new Error("Ophalen mislukt");
  return res.json();
}

export async function createProduct(payload: CreateProductInput): Promise<Product> {
  const res = await fetch(`${apiBase}/api/ProductGegevens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Aanmaken mislukt');
  return res.json();
}