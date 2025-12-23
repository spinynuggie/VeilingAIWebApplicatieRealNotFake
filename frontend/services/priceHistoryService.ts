import { authFetch } from "./authService";
import { HistoricalPriceResponse } from "@/types/priceHistory";

const apiBase = process.env.NEXT_PUBLIC_BACKEND_LINK;

if (!apiBase) {
  throw new Error("NEXT_PUBLIC_BACKEND_LINK is not defined.");
}

export async function getPriceHistory(productId: number): Promise<HistoricalPriceResponse> {
  const res = await authFetch(`${apiBase}/api/PriceHistory/${productId}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Kon prijshistorie niet ophalen.");
  }

  return res.json();
}
