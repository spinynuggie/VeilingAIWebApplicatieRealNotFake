import { Product, CreateProductInput, UpdateProductAuctionInput } from '@/types/product';
import { authFetch } from "./authService";

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

export async function getProductById(id: number): Promise<Product> {
  const res = await authFetch(`${apiBase}/api/ProductGegevens/${id}`, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("Kon product details niet ophalen");
  }

  return res.json();
}

export async function getProducts(): Promise<Product[]> {
  const res = await authFetch(`${apiBase}/api/ProductGegevens`, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("Kon producten niet ophalen");
  }

  return res.json();
}

export async function createProduct(payload: CreateProductInput): Promise<any> {
  const res = await authFetch(`${apiBase}/api/ProductGegevens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productNaam: payload.productNaam,
      productBeschrijving: payload.productBeschrijving,
      fotos: payload.fotos,
      hoeveelheid: payload.hoeveelheid,
      eindprijs: payload.eindPrijs,
      verkoperId: payload.verkoperId,
      locatieId: payload.locatieId,
      specificatieIds: payload.specificatieIds
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Fout bij aanmaken product");
  }

  return res.json();
}

export async function updateProductAuctionData(payload: UpdateProductAuctionInput): Promise<void> {
  const res = await authFetch(`${apiBase}/api/ProductGegevens/${payload.productId}/koppel-veiling`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: payload.productId,
      veilingId: payload.veilingId,
      startPrijs: payload.startPrijs,
      eindPrijs: payload.eindPrijs,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Validatie fouten:", errorData.errors);
    throw new Error("Bijwerken veilinggegevens mislukt");
  }
}
export async function getProductsByVerkoper(verkoperId: number): Promise<Product[]> {
  const res = await authFetch(`${apiBase}/api/ProductGegevens/verkoper/${verkoperId}`, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("Kon producten voor deze verkoper niet ophalen");
  }

  return res.json();
}