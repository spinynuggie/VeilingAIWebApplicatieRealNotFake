import { Product, CreateProductInput, UpdateProductAuctionInput } from '@/types/product';
import { authFetch } from "./authService";

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

export async function getProducts(): Promise<Product[]> {
  const res = await authFetch(`${apiBase}/api/ProductGegevens`, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("Kon producten niet ophalen");
  }

  return res.json();
}

export async function createProduct(payload: CreateProductInput): Promise<Product> {
  const res = await authFetch(`${apiBase}/api/ProductGegevens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Backend Error Details:", errorText);
    throw new Error(`Server Error: ${res.status} - ${errorText}`);
  }

  return res.json();
}

export async function updateProductAuctionData(payload: UpdateProductAuctionInput): Promise<void> {
  const res = await authFetch(`${apiBase}/api/ProductGegevens/${payload.productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: payload.productId,
      veilingId: payload.veilingId,
      startPrijs: payload.startPrijs,
      eindPrijs: payload.eindPrijs,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Bijwerken mislukt");
  }
}